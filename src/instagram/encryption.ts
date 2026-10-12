import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const prefix = 'ig:v1'
const associatedData = Buffer.from('instagram-settings.accessToken')

const errorMessages = {
  'missing-key':
    'INSTAGRAM_TOKEN_ENCRYPTION_KEY saknas i serverns miljö. Lägg in den befintliga nyckeln och starta om servern, eller deploya på nytt.',
  'invalid-key':
    'INSTAGRAM_TOKEN_ENCRYPTION_KEY har fel format. Nyckeln ska vara 32 bytes kodade som base64. Kontrollera värdet och starta om servern.',
  'encryption-failed':
    'Instagram-token kunde inte krypteras. Kontrollera serverns kryptografikonfiguration och INSTAGRAM_TOKEN_ENCRYPTION_KEY.',
  'decryption-failed':
    'Instagram-token kunde inte läsas med serverns krypteringsnyckel. Använd samma INSTAGRAM_TOKEN_ENCRYPTION_KEY som när token sparades.',
} as const

export class InstagramEncryptionError extends Error {
  constructor(readonly code: keyof typeof errorMessages) {
    super(errorMessages[code])
    this.name = 'InstagramEncryptionError'
  }
}

function encryptionKey() {
  const value = process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY?.trim()
  if (!value) throw new InstagramEncryptionError('missing-key')
  if (!/^[A-Za-z0-9+/]{43}=$/.test(value)) throw new InstagramEncryptionError('invalid-key')
  const key = Buffer.from(value, 'base64')
  if (key.length !== 32) throw new InstagramEncryptionError('invalid-key')
  return key
}

export function encryptInstagramToken(token: string): string {
  try {
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
    cipher.setAAD(associatedData)
    const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
    return [
      prefix,
      iv.toString('base64'),
      cipher.getAuthTag().toString('base64'),
      ciphertext.toString('base64'),
    ].join(':')
  } catch (error) {
    if (error instanceof InstagramEncryptionError) throw error
    // Never propagate a crypto error, input value, or environment variable.
    throw new InstagramEncryptionError('encryption-failed')
  }
}

export function decryptInstagramToken(value: string): string {
  try {
    const [namespace, version, iv, tag, ciphertext, extra] = value.split(':')
    if (`${namespace}:${version}` !== prefix || !iv || !tag || !ciphertext || extra)
      throw new Error()
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64'))
    decipher.setAAD(associatedData)
    decipher.setAuthTag(Buffer.from(tag, 'base64'))
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64')),
      decipher.final(),
    ]).toString('utf8')
  } catch (error) {
    if (error instanceof InstagramEncryptionError) throw error
    throw new InstagramEncryptionError('decryption-failed')
  }
}

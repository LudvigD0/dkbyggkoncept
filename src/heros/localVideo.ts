export const HOME_HERO_VIDEO_PATH = '/design/hero-background.mp4'

export function isLocalHeroVideoPath(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\/(?!\/)[^\s?#\\]+\.mp4$/i.test(value) &&
    !value.split('/').some((part) => part === '.' || part === '..')
  )
}

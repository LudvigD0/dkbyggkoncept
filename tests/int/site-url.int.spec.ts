import { afterEach, describe, expect, it, vi } from 'vitest'
import { getClientSideURL, getServerSideURL } from '@/utilities/getURL'

afterEach(() => vi.unstubAllEnvs())

describe('Website origins', () => {
  it.each([
    {
      name: 'configured production domain',
      env: 'production',
      configured: 'https://www.dkbyggkoncept.se',
      deployment: 'deployment.vercel.app',
      production: 'dkbyggkoncept.se',
      expected: 'https://www.dkbyggkoncept.se',
    },
    {
      name: 'generated preview domain',
      env: 'preview',
      configured: '',
      deployment: 'project-preview.vercel.app',
      production: 'dkbyggkoncept.se',
      expected: 'https://project-preview.vercel.app',
    },
    {
      name: 'configured preview domain',
      env: 'preview',
      configured: 'https://preview.dkbyggkoncept.se/',
      deployment: 'project-preview.vercel.app',
      production: 'dkbyggkoncept.se',
      expected: 'https://preview.dkbyggkoncept.se',
    },
    {
      name: 'automatic production domain',
      env: 'production',
      configured: '',
      deployment: 'deployment.vercel.app',
      production: 'dkbyggkoncept.se',
      expected: 'https://dkbyggkoncept.se',
    },
    {
      name: 'deployment fallback',
      env: 'production',
      configured: '',
      deployment: 'deployment.vercel.app',
      production: '',
      expected: 'https://deployment.vercel.app',
    },
    {
      name: 'local development',
      env: 'development',
      configured: '',
      deployment: '',
      production: '',
      expected: 'http://localhost:3000',
    },
  ])('uses the $name', ({ env, configured, deployment, production, expected }) => {
    vi.stubEnv('VERCEL_ENV', env)
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', configured)
    vi.stubEnv('VERCEL_URL', deployment)
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', production)
    expect(getServerSideURL()).toBe(expected)
  })

  it('keeps browser requests on the current origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://www.dkbyggkoncept.se')
    expect(getClientSideURL()).toBe(window.location.origin)
  })
})

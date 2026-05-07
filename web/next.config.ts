import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  experimental: {
    typedEnv: true,

    // belangrijk voor uploads met proxy.ts
    proxyClientMaxBodySize: '100mb',
  },
  serverExternalPackages: ['pino', 'pino-pretty'],
}

export default nextConfig

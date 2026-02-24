/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routes only, no static pages
  output: 'standalone',
  
  // Disable React strict mode for production
  reactStrictMode: true,
  
  // Environment variables that should be exposed to the browser (none for now)
  env: {},
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 protects dev-only chunks/HMR from cross-origin access. Studio
  // previews run the dev server behind an iframe/proxy origin, so without an
  // allowlist the HTML can return 200 while JS chunks are rejected with 403.
  // Keep this dev-only list narrow instead of disabling origin protection.
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '*.vusercontent.net',
    '*.vercel.run',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

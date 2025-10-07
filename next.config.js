/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output for Vercel
  // output: 'standalone', // This is for Docker, not Vercel
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Image optimization
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Compression
  compress: true,
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许连接到本地后端
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig

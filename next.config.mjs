/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/submit", destination: "/", permanent: false },
      { source: "/leaderboard", destination: "/archive/2026", permanent: false },
      { source: "/results", destination: "/archive/2026", permanent: false },
      { source: "/rules", destination: "/", permanent: false },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "almusanze-voting-system.vercel.app"],
    },
  },
};

export default nextConfig;

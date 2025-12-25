import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbopack configuration (to silence warnings and set correct root)
  turbopack: {
    root: __dirname,
  },
  // Webpack configuration to ensure modules resolve from the correct directory
  webpack: (config, { defaultLoaders }) => {
    // Ensure webpack resolves modules from the current project directory
    const projectRoot = path.resolve(__dirname);
    
    config.resolve.modules = [
      path.join(projectRoot, 'node_modules'),
      ...(config.resolve.modules || []),
    ];
    
    // Ensure webpack uses the correct context
    config.context = projectRoot;
    
    // Add alias for tailwindcss to ensure it resolves correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      'tailwindcss': path.join(projectRoot, 'node_modules', 'tailwindcss'),
    };
    
    return config;
  },
};

export default nextConfig;

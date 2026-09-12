import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root to this project. Without it Turbopack walks up the
    // filesystem looking for a lockfile and can latch onto an unrelated one
    // outside the repository.
    root: path.join(__dirname),
  },
};

export default nextConfig;

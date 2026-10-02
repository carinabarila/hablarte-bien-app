import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // @supabase/phoenix declara phoenix.mjs en exports pero ese archivo
    // no existe en el paquete. Apuntamos directamente al .cjs.js que sí existe.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@supabase/phoenix": path.resolve(
        "./node_modules/@supabase/phoenix/priv/static/phoenix.cjs.js"
      ),
    };
    return config;
  },
};

export default nextConfig;

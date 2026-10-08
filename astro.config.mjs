// @ts-check
import { defineConfig } from 'astro/config';

// Remote images (mga.com.br/storage/...) are optimized to AVIF/WebP only when
// OPTIMIZE_REMOTE_IMAGES=1 (set in vercel.json / netlify.toml). Locally and in
// offline builds the original URL is used with explicit width/height.
export default defineConfig({
  site: 'https://www.mga.com.br',
  trailingSlash: 'never',
  build: { format: 'file' },
  image: {
    domains: ['www.mga.com.br', 'mga.com.br'],
  },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
});

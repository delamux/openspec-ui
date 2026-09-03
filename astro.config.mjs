// @ts-check
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import node from '@astrojs/node';

// Config files are evaluated before Astro loads .env, so import.meta.env is empty here.
const envFile = fileURLToPath(new URL('.env', import.meta.url));
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

// Vite answers 403 to any host it was not told about, so reaching the dev server by
// name from another device (Tailscale, LAN) needs that name listed here.
const allowedHosts = (process.env.DEV_ALLOWED_HOSTS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter((host) => host.length > 0);

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: { server: { allowedHosts } },
});

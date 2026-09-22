import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			$lib: path.resolve(import.meta.dirname, './src/lib'),
			'$app/environment': path.resolve(import.meta.dirname, './src/lib/__mocks__/app-environment.ts')
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['e2e/**', 'node_modules/**', '_backup_nextjs/**']
	}
});

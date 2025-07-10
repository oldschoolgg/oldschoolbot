import path from 'node:path';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const manualChunks = {
	vendor: ['wouter', 'wouter-preact', 'preact', 'preact/compat'],
	reactws: ['react-use-websocket']
};
type ManualChunks = Record<string, string[]>;

function convertManualChunksToAdvancedChunks(manualChunks: ManualChunks) {
	return {
		advancedChunks: {
			groups: Object.entries(manualChunks).map(([name, modules]) => ({
				name,
				test: (id: string) => modules.some(m => id.includes(m))
			}))
		}
	};
}

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
	plugins: [preact(), tailwindcss()],
	build: {
		cssCodeSplit: true,
		manifest: true,
		emptyOutDir: true,
		modulePreload: false,
		polyfillModulePreload: false,
		rollupOptions: {
			output: {
				sourcemap: false,
				advancedChunks: convertManualChunksToAdvancedChunks(manualChunks).advancedChunks,
				legalComments: 'none'
			},
			treeshake: true
		}
	}
});

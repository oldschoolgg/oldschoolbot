import { statSync, writeFileSync } from 'node:fs';
import * as esbuild from 'esbuild';
import fg from 'fast-glob';

const baseOptions: esbuild.BuildOptions = {
	keepNames: true,
	minify: false,
	external: ['node-fetch'],
	entryPoints: [
		'./src/index.ts',
		'./src/util/util.ts',
		'./src/constants.ts',
		'./src/EGear.ts',
		'./src/EItem.ts',
		'./src/EQuest.ts',
		'./src/EMonster.ts',
		'./src/structures/Wiki.ts',
		'./src/structures/Hiscores.ts',
		'./src/gear/index.ts'
	],
	bundle: true,
	sourcemap: true,
	metafile: true,
	platform: 'node',
	loader: {
		'.json': 'copy'
	}
};

async function main() {
	await Promise.all([
		esbuild.build({
			...baseOptions,
			format: 'cjs',
			target: 'node20',
			outdir: './dist/cjs',
			outExtension: { '.js': '.cjs' }
		}),
		esbuild.build({
			...baseOptions,
			format: 'esm',
			target: 'esnext',
			outdir: './dist/esm',
			outExtension: { '.js': '.mjs' }
		})
	]);

	function formatBytes(bytes: number, decimals = 2) {
		if (bytes === 0) return '0 B';

		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
	}

	let metadata = '';
	for (const folder of ['./dist/cjs', './dist/esm']) {
		const files = await fg(`${folder}/**/*.{cjs,mjs,json}`);
		const results = files.map(file => ({
			file,
			size: statSync(file).size
		}));

		metadata += `Files in ${folder}:\n`;
		metadata += results
			.sort((a, b) => a.file.localeCompare(b.file))
			.map(({ file, size }) => `	${file}: ${formatBytes(size)} ${size.toLocaleString()} bytes`)
			.join('\n');
		metadata += `\n\nTotal size: ${formatBytes(results.reduce((acc, { size }) => acc + size, 0))}\n\n\n`;
	}

	writeFileSync('./metadata.txt', `${metadata.trim()}\n`);
}

main();

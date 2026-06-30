import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

function usage(): never {
	console.error(
		'Usage: pnpm tsx --tsconfig scripts/tsconfig.json scripts/image-diff-box.ts <expected.png> <actual.png> [output.png]'
	);
	process.exit(1);
}

function defaultOutputPath(actualPath: string) {
	const parsed = path.parse(actualPath);
	return path.join(parsed.dir, `${parsed.name}.diff-box.png`);
}

function svgRect(width: number, height: number, minX: number, minY: number, maxX: number, maxY: number) {
	const strokeWidth = 2;
	const halfStroke = strokeWidth / 2;
	const x = Math.max(halfStroke, minX + halfStroke);
	const y = Math.max(halfStroke, minY + halfStroke);
	const rectWidth = Math.min(width - x - halfStroke, maxX - minX + 1);
	const rectHeight = Math.min(height - y - halfStroke, maxY - minY + 1);

	return Buffer.from(`
		<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
			<rect
				x="${x}"
				y="${y}"
				width="${Math.max(1, rectWidth)}"
				height="${Math.max(1, rectHeight)}"
				fill="none"
				stroke="red"
				stroke-width="${strokeWidth}"
				shape-rendering="crispEdges"
			/>
		</svg>
	`);
}

async function rawRgba(filePath: string) {
	const image = sharp(filePath).ensureAlpha();
	const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
	return { data, width: info.width, height: info.height };
}

async function main() {
	const [expectedPath, actualPath, outputPath = defaultOutputPath(process.argv[3] ?? '')] = process.argv.slice(2);
	if (!expectedPath || !actualPath) usage();

	const [expected, actual] = await Promise.all([rawRgba(expectedPath), rawRgba(actualPath)]);
	if (expected.width !== actual.width || expected.height !== actual.height) {
		throw new Error(
			`Image dimensions differ: ${expectedPath} is ${expected.width}x${expected.height}, ` +
				`${actualPath} is ${actual.width}x${actual.height}`
		);
	}

	let diffPixels = 0;
	let minX = expected.width;
	let minY = expected.height;
	let maxX = -1;
	let maxY = -1;

	for (let i = 0; i < expected.data.length; i += 4) {
		if (
			expected.data[i] === actual.data[i] &&
			expected.data[i + 1] === actual.data[i + 1] &&
			expected.data[i + 2] === actual.data[i + 2] &&
			expected.data[i + 3] === actual.data[i + 3]
		) {
			continue;
		}

		const pixelIndex = i / 4;
		const x = pixelIndex % expected.width;
		const y = Math.floor(pixelIndex / expected.width);

		diffPixels++;
		minX = Math.min(minX, x);
		minY = Math.min(minY, y);
		maxX = Math.max(maxX, x);
		maxY = Math.max(maxY, y);
	}

	if (diffPixels === 0) {
		console.log('No pixel differences found.');
		return;
	}

	await sharp(actualPath)
		.ensureAlpha()
		.composite([{ input: svgRect(actual.width, actual.height, minX, minY, maxX, maxY), left: 0, top: 0 }])
		.png()
		.toFile(outputPath);

	console.log(`Diff pixels: ${diffPixels}`);
	console.log(`Bounding box: x=${minX}, y=${minY}, width=${maxX - minX + 1}, height=${maxY - minY + 1}`);
	console.log(`Wrote: ${outputPath}`);
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});

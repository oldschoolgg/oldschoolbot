import * as fs from 'node:fs';
import { join } from 'node:path';
import AdmZip from 'adm-zip';
import fetch from 'node-fetch';

const REPO_ZIP_URL = 'https://github.com/runelite/static.runelite.net/archive/refs/heads/gh-pages.zip';
const TARGET_FOLDER_IN_ZIP = 'static.runelite.net-gh-pages/cache/item/icon';
const OUTPUT_DIR = join(process.cwd(), 'tmp/icons');
const zipPath = join(process.cwd(), 'tmp/repo.zip');

if (!fs.existsSync(OUTPUT_DIR)) {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function downloadZip() {
	const resp = await fetch(REPO_ZIP_URL);
	const buffer = await resp.arrayBuffer();
	fs.writeFileSync(zipPath, Buffer.from(buffer));
}

async function extractFolderFromZip() {
	const zip = new AdmZip(zipPath);
	const entries = zip.getEntries();

	for (const entry of entries) {
		if (entry.entryName.startsWith(TARGET_FOLDER_IN_ZIP) && !entry.isDirectory) {
			const relativePath = entry.entryName.replace(`${TARGET_FOLDER_IN_ZIP}/`, '');
			const outputPath = join(OUTPUT_DIR, relativePath);
			fs.mkdirSync(join(outputPath, '..'), { recursive: true });
			fs.writeFileSync(outputPath, entry.getData());
		}
	}
}

async function main() {
	await downloadZip();
	await extractFolderFromZip();
}

main();

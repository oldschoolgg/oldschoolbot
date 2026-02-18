import { renderCreatablesFile } from './creatables.js';
import { renderDataFiles } from './dataFiles.js';
import { createMonstersJson } from './monstersJson.js';
import { renderCommandsFile } from './renderCommandsFile.js';
import { clueBoosts } from './wiki/clueBoosts.js';
import { renderFishingXpHrTable } from './wiki/fishingSnapshots.js';
import { renderMiningXpHrTable } from './wiki/miningSnapshots.js';
import { renderCoxMarkdown } from './wiki/renderCox.js';
import { renderMonstersMarkdown } from './wiki/renderMonsters.js';
import { renderQuestsMarkdown } from './wiki/renderQuests.js';
import { renderTripBuyables } from './wiki/tripBuyables.js';
import { updateAuthors } from './wiki/updateAuthors.js';

const availableScripts = {
	renderCommandsFile,
	createMonstersJson,
	renderCreatablesFile,
	renderDataFiles,
	clueBoosts,
	renderMonstersMarkdown,
	renderCoxMarkdown,
	renderTripBuyables,
	renderQuestsMarkdown,
	renderFishingXpHrTable,
	renderMiningXpHrTable,
	updateAuthors
};

const scriptNames = Object.keys(availableScripts);

function printHelp() {
	console.log('Usage: pnpm cli:script <scriptName>');
	console.log(`Valid: ${scriptNames.join(', ')}`);
}

async function main() {
	const scriptName = process.argv[2];
	if (!scriptName || scriptName === '--help' || scriptName === '-h') {
		printHelp();
		return;
	}
	if (!(scriptName in availableScripts)) {
		throw new Error(`Unknown script "${scriptName}". Valid: ${scriptNames.join(', ')}`);
	}

	await Promise.resolve(availableScripts[scriptName as keyof typeof availableScripts]());
}

void main().catch(error => {
	console.error(error);
	process.exit(1);
});

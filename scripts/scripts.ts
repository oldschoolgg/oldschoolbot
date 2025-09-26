import { TimerManager } from '@sapphire/timer-manager';
import '../src/lib/safeglobals';

import { execSync } from 'node:child_process';

import { sonicBoom } from '@/lib/util/logger.js';
import { applyStaticDefine } from '../meta.js';
import { renderBsoItemsFile } from './bsoData.js';
import { renderCreatablesFile } from './creatables.js';
import { createMonstersJson } from './monstersJson.js';
import { renderCommandsFile } from './renderCommandsFile.js';

applyStaticDefine();

function scriptsMain() {
	createMonstersJson();
	renderCreatablesFile();
	renderCommandsFile();

	renderBsoItemsFile();

	TimerManager.destroy();
	sonicBoom.destroy();
	execSync('biome check data --write --unsafe --diagnostic-level=error');
}

scriptsMain();

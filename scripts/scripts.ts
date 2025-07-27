import { TimerManager } from '@sapphire/timer-manager';
import '../src/lib/safeglobals';
import { execSync } from 'node:child_process';
applyStaticDefine();

import { sonicBoom } from '@/lib/util/logger';
import { applyStaticDefine } from '../meta.js';
import { renderBsoItemsFile } from './bsoData';
import { renderCreatablesFile } from './creatables';
import { createMonstersJson } from './monstersJson.js';
import { renderCommandsFile } from './renderCommandsFile';

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

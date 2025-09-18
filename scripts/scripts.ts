import { TimerManager } from '@sapphire/timer-manager';
import '../src/lib/safeglobals.js';
import { execSync } from 'node:child_process';
applyStaticDefine();

import { sonicBoom } from '@/lib/util/logger.js';
import { applyStaticDefine } from '../meta.js';
import { renderCreatablesFile } from './creatables.js';
import { createMonstersJson } from './monstersJson.js';
import { renderCommandsFile } from './renderCommandsFile.js';

function scriptsMain() {
	createMonstersJson();
	renderCreatablesFile();
	renderCommandsFile();

	TimerManager.destroy();
	sonicBoom.destroy();
	execSync('biome check data --write --unsafe --diagnostic-level=error');
}

scriptsMain();

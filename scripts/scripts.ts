import { TimerManager } from '@sapphire/timer-manager';
import '../src/lib/safeglobals';
import { execSync } from 'node:child_process';

import { sonicBoom } from '@/lib/util/logger';
import { renderCreatablesFile } from './creatables';
import { createMonstersJson } from './monstersJson.js';
import { renderCommandsFile } from './renderCommandsFile';

function scriptsMain() {
	createMonstersJson();
	renderCreatablesFile();
	renderCommandsFile();

	TimerManager.destroy();
	sonicBoom.destroy();
	execSync('biome check data --write --unsafe --diagnostic-level=error');
}

scriptsMain();

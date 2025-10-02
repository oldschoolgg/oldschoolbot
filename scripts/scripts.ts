import { TimerManager } from '@sapphire/timer-manager';
import '../src/lib/safeglobals';

import { execSync } from 'node:child_process';

import { sonicBoom } from '@/lib/util/logger.js';
import { renderBsoItemsFile } from './bsoData.js';
import { renderCommandsFile } from './renderCommandsFile.js';

function scriptsMain() {
	renderCommandsFile();

	renderBsoItemsFile();

	TimerManager.destroy();
	sonicBoom.destroy();
	execSync('biome check data --write --unsafe --diagnostic-level=error');
}

scriptsMain();

import { createTsdownConfig } from '../../scripts/createTsdownConfig.ts';

const entry = ['src/index.ts', 'src/testBotWebsocket.ts'];
export default createTsdownConfig({
	entry,
	unbundle: false
});

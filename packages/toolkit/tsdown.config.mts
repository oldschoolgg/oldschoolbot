import { createTsupConfig } from '../../scripts/tsupconfig.ts';

const entry = [
	'src/util.ts',
	'src/structures.ts',
	'src/constants.ts',
	'src/testBotWebsocket.ts',
	'src/util/datetime.ts',
	'src/string-util.ts',
	'src/util/discord/index.ts',
	'src/util/math/index.ts',
	'src/util/node.ts',
	'src/util/runescape.ts',
	'src/rng/index.ts'
];
export default createTsupConfig({
	entry
});

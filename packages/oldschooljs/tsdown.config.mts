import {createTsupConfig} from "../../scripts/tsupconfig.ts";

const entry = [
	'./src/index.ts',
	'./src/constants.ts',
	'./src/EGear.ts',
	'./src/EItem.ts',
	'./src/EMonster.ts',
	'./src/structures/Wiki.ts',
	'./src/hiscores/index.ts',
	'./src/gear/index.ts',
];

export default createTsupConfig({
   entry,
	copy: [
	'src/assets',
	{ from: 'src/assets', to: 'dist/assets' },
	],
});

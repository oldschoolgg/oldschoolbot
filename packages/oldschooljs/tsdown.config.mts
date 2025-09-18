import {createTsupConfig} from "../../scripts/tsupconfig.ts";

const entryPoints = [
		'./src/index.ts',
		'./src/util/util.ts',
		'./src/constants.ts',
		'./src/EGear.ts',
		'./src/EItem.ts',
		'./src/EMonster.ts',
		'./src/structures/Wiki.ts',
		'./src/structures/Hiscores.ts',
		'./src/gear/index.ts'
	];

export default createTsupConfig({
   entryPoints
});

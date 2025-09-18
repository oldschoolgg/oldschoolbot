import {createTsupConfig} from "../../scripts/tsupconfig.ts";

const entryPoints = [
		'./src/index.ts',
	];

export default createTsupConfig({
   entryPoints
});

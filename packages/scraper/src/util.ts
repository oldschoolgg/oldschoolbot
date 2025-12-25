// import { md5sum } from '@oldschoolgg/toolkit/node';
import { writeFileSync } from "node:fs";

export type DataFileContent<T> = {
	updated_at: number;
	hash: string;
	data: T;
}

export function saveDataFile(fileName: string, data: unknown) {
	// const jsonString = JSON.stringify(data);
	// const hash = md5sum(jsonString);
	const file: DataFileContent<typeof data> = {
		updated_at: Date.now(),
		hash: 'x',
		data
	};
	writeFileSync(`./src/data/${fileName}`, JSON.stringify(file, null, 4));
}

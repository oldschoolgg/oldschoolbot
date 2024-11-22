import { createHash } from 'node:crypto';
import { gzip } from 'node:zlib';

export async function asyncGzip(buffer: Buffer) {
	return new Promise<Buffer>((resolve, reject) => {
		gzip(buffer, {}, (error, gzipped) => {
			if (error) {
				reject(error);
			}
			resolve(gzipped);
		});
	});
}

export function md5sum(str: string) {
	return createHash('md5').update(str).digest('hex');
}

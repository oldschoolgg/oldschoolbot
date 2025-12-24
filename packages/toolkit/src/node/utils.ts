import { createHash } from 'node:crypto';
import { gzip } from 'node:zlib';

export async function asyncGzip(buffer: Buffer): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		gzip(buffer, {}, (error, gzipped) => {
			if (error) {
				reject(error);
			}
			resolve(gzipped);
		});
	});
}

export function md5sum(str: string): string {
	return createHash('md5').update(str).digest('hex');
}

const wordBlacklistBase64 =
	'YXNzDQpzaGl0DQpiaXRjaA0KYm9vYnMNCnRpdHMNCmJhbGxzYWNrDQpiYncNCmJkc20NCmJhc3RhcmQNCmJpbWJvDQpjb2NrDQpkaWNrDQpjbGl0DQpibG93am9iDQpib2xsb2NrDQpib25kYWdlDQpib25lcg0KYm9vYg0KYnVra2FrZQ0KZHlrZQ0KYnVsbHNoaXQNCmJ1bQ0KYnV0dGhvbGUNCmNhbXNsdXQNCmNhbXdob3JlDQpjaGluaw0KY2hvYWQNCmdhbmdiYW5nDQpjdW0NCmN1bnQNCmRlZXB0aHJvYXQNCmRpbGRvDQpjb2NrDQpmdWNrDQpwZW5pcw0KdmFnaW5hDQp2dWx2YQ0Kc2x1dA0KbWFzdHVyYmF0ZQ0Kc2hpdA0KbmlnZ2VyDQpjcmFja2VyDQpqZXcNCmlzcmFlbA0KcGFsZXN0aW5lDQp0cnVtcA0KYmlkZW4NCnJlcHVibGljYW4NCmRlbW9jcmF0DQpuYXppDQphbnRpZmE=';
const wordBlacklist = Buffer.from(wordBlacklistBase64.trim(), 'base64')
	.toString('utf8')
	.split('\n')
	.map(word => word.trim().toLowerCase());

export function containsBlacklistedWord(str: string): boolean {
	const lowerCaseStr = str.toLowerCase();
	for (const word of wordBlacklist) {
		if (lowerCaseStr.includes(word)) {
			return true;
		}
	}
	return false;
}

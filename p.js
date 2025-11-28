function genSecret() {
	const bytes = crypto.getRandomValues
		? crypto.getRandomValues(new Uint8Array(32))
		: require('crypto').randomBytes(32);

	return Buffer.from(bytes).toString('base64');
}

console.log(genSecret());
console.log(genSecret());
console.log(genSecret());
console.log(genSecret());
console.log(genSecret());
console.log(genSecret());
console.log(genSecret());
console.log(genSecret());
console.log(genSecret());
console.log(genSecret());
console.log(genSecret());

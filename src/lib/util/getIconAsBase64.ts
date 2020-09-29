export default async function(itemID: number): Promise<string> {
	return require('fs').promises.readFile(`./icon_cache/${itemID}.png`, { encoding: 'base64' });
}

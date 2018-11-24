const trRegex = /<table class="server-list">/;
const whiteSpace = /\s/;

const parseTable = (html) => {
	const result = trRegex.exec(html);
	if (!result) return null;

	const extracted = extractHTML(html.slice(result.index));
	return extracted.children[1].children.map(ch => ({
		name: ch.children[0].children[0].content,
		players: ch.children[1].content,
		country: ch.children[2].content,
		type: ch.children[3].content,
		activity: ch.children[4].content
	}));
};

const extractHTML = (html) => {
	html = html.trim();
	const tagName = html.slice(1, html.indexOf(' '));
	const endOfOpeningTag = html.indexOf('>', tagName.length) + 1;
	const attributes = html.slice(2 + tagName.length, endOfOpeningTag - 1);

	let char;
	let hasStarted = false;
	let buffer = '';
	const children = [];
	let i = endOfOpeningTag - 1;
	while (++i < html.length) {
		char = html[i];
		if (!hasStarted && whiteSpace.test(char)) continue;
		if (char === '<') {
			if (html[i + 1] === '/') {
				const index = html.indexOf('>', i + 1);
				if (index !== -1) i += index - i + 1;
				break;
			}
			const extracted = extractHTML(html.slice(i - 1, html.length).trim());
			i += extracted.tagLength;
			children.push(extracted);
			hasStarted = false;
			continue;
		}
		hasStarted = true;
		buffer += char;
	}

	return {
		tagName,
		attributes,
		tagLength: i,
		content: buffer,
		children
	};
};

module.exports = {
	extractHTML, parseTable
};

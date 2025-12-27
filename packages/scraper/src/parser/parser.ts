import type {
	BoldNode,
	ExternalLinkNode,
	HeadingNode,
	HtmlTagNode,
	ItalicNode,
	LinkNode,
	ListItemNode,
	ListNode,
	ParseResult,
	TableCellNode,
	TableNode,
	TableRowNode,
	TemplateNode,
	TemplateParam,
	TextNode,
	WikiNode
} from './types.js';

class WikitextParser {
	private input: string;
	private pos: number;
	private length: number;

	constructor(input: string) {
		this.input = input;
		this.pos = 0;
		this.length = input.length;
	}

	parse(): ParseResult {
		const nodes = this.parseNodes();
		return { nodes };
	}

	private parseNodes(stopChars: string[] = []): WikiNode[] {
		const nodes: WikiNode[] = [];
		while (this.pos < this.length) {
			if (stopChars.some(c => this.lookingAt(c))) break;
			const node = this.parseNode(stopChars);
			if (node) {
				if (node.type === 'text' && nodes.length > 0) {
					const last = nodes[nodes.length - 1];
					if (last.type === 'text') {
						last.value += node.value;
						continue;
					}
				}
				nodes.push(node);
			}
		}
		return nodes;
	}

	private parseNode(stopChars: string[] = []): WikiNode | null {
		if (this.pos >= this.length) return null;

		if (this.lookingAt('{{')) return this.parseTemplate();
		if (this.lookingAt('[[')) return this.parseLink();
		if (this.lookingAt('[') && this.isExternalLinkStart()) return this.parseExternalLink();
		if (this.lookingAt('=') && this.isHeadingStart()) return this.parseHeading();
		if (this.lookingAt("'''''")) return this.parseBoldItalic();
		if (this.lookingAt("'''")) return this.parseBold();
		if (this.lookingAt("''")) return this.parseItalic();
		if (this.lookingAt('<')) return this.parseHtmlTag();
		if (this.lookingAt('{|')) return this.parseTable();
		if (this.lookingAt('----')) return this.parseHorizontalRule();
		if (this.isAtLineStart() && this.lookingAtAny(['*', '#', ';', ':'])) return this.parseList();

		return this.parseText(stopChars);
	}

	private parseTemplate(): TemplateNode {
		this.consume('{{');
		const nameEnd = this.findFirst(['|', '}}']);
		const name = this.input.slice(this.pos, nameEnd).trim();
		this.pos = nameEnd;

		const params: TemplateParam[] = [];
		let paramIndex = 1;

		while (this.lookingAt('|')) {
			this.consume('|');
			const param = this.parseTemplateParam(paramIndex);
			params.push(param);
			if (param.name === null) paramIndex++;
		}

		if (this.lookingAt('}}')) this.consume('}}');
		return { type: 'template', name, params };
	}

	private parseTemplateParam(_index: number): TemplateParam {
		const equalsPos = this.findParamEquals();
		if (equalsPos !== -1) {
			const name = this.input.slice(this.pos, equalsPos).trim();
			this.pos = equalsPos + 1;
			const value = this.parseNodes(['|', '}}']);
			return { name, value };
		}
		const value = this.parseNodes(['|', '}}']);
		return { name: null, value };
	}

	private findParamEquals(): number {
		let depth = 0;
		let i = this.pos;
		while (i < this.length) {
			if (this.input.startsWith('{{', i) || this.input.startsWith('[[', i)) {
				depth++;
				i += 2;
			} else if (this.input.startsWith('}}', i) || this.input.startsWith(']]', i)) {
				if (depth === 0) return -1;
				depth--;
				i += 2;
			} else if (this.input[i] === '|' && depth === 0) {
				return -1;
			} else if (this.input[i] === '=' && depth === 0) {
				return i;
			} else {
				i++;
			}
		}
		return -1;
	}

	private parseLink(): LinkNode {
		this.consume('[[');
		const pipeOrEnd = this.findFirst(['|', ']]']);
		const target = this.input.slice(this.pos, pipeOrEnd).trim();
		this.pos = pipeOrEnd;

		let text: string | null = null;
		if (this.lookingAt('|')) {
			this.consume('|');
			const endPos = this.findBalanced('[[', ']]');
			text = this.input.slice(this.pos, endPos).trim();
			this.pos = endPos;
		}

		if (this.lookingAt(']]')) this.consume(']]');

		const isFile = /^(File|Image):/i.test(target);
		const isCategory = /^Category:/i.test(target);

		return { type: 'link', target, text, isFile, isCategory };
	}

	private parseExternalLink(): ExternalLinkNode {
		this.consume('[');
		const endPos = this.input.indexOf(']', this.pos);
		const content = this.input.slice(this.pos, endPos === -1 ? this.length : endPos);
		if (endPos !== -1) this.pos = endPos + 1;
		else this.pos = this.length;

		const spaceIdx = content.indexOf(' ');
		if (spaceIdx === -1) {
			return { type: 'externalLink', url: content.trim(), text: null };
		}
		return {
			type: 'externalLink',
			url: content.slice(0, spaceIdx).trim(),
			text: content.slice(spaceIdx + 1).trim()
		};
	}

	private parseHeading(): HeadingNode {
		let level = 0;
		while (this.pos + level < this.length && this.input[this.pos + level] === '=') level++;
		level = Math.min(level, 6);
		this.pos += level;

		const lineEnd = this.input.indexOf('\n', this.pos);
		const line = this.input.slice(this.pos, lineEnd === -1 ? this.length : lineEnd);
		const match = line.match(new RegExp(`^(.*)={${level}}\\s*$`));
		const contentStr = match ? match[1].trim() : line.replace(/=+\s*$/, '').trim();

		this.pos = lineEnd === -1 ? this.length : lineEnd + 1;

		const subParser = new WikitextParser(contentStr);
		const content = subParser.parseNodes();

		return { type: 'heading', level, content };
	}

	private parseBoldItalic(): BoldNode {
		this.consume("'''''");
		const content = this.parseUntilQuotes(5);
		return {
			type: 'bold',
			content: [{ type: 'italic', content } as ItalicNode]
		};
	}

	private parseBold(): BoldNode {
		this.consume("'''");
		const content = this.parseUntilQuotes(3);
		return { type: 'bold', content };
	}

	private parseItalic(): ItalicNode {
		this.consume("''");
		const content = this.parseUntilQuotes(2);
		return { type: 'italic', content };
	}

	private parseUntilQuotes(count: number): WikiNode[] {
		const marker = "'".repeat(count);
		const nodes: WikiNode[] = [];
		while (this.pos < this.length && !this.lookingAt(marker) && !this.lookingAt('\n')) {
			if (this.lookingAt('{{')) nodes.push(this.parseTemplate());
			else if (this.lookingAt('[[')) nodes.push(this.parseLink());
			else {
				const endPos = this.findFirst([marker, '{{', '[[', '\n']);
				const text = this.input.slice(this.pos, endPos);
				if (text) nodes.push({ type: 'text', value: text });
				this.pos = endPos;
			}
		}
		if (this.lookingAt(marker)) this.pos += count;
		return nodes;
	}

	private parseHtmlTag(): HtmlTagNode | TextNode {
		const match = this.input.slice(this.pos).match(/^<(\/?)([\w-]+)([^>]*?)(\/?)>/);
		if (!match) return this.parseTextChar();

		const [full, isClosing, tag, attrStr, selfClose] = match;
		this.pos += full.length;

		if (isClosing) return { type: 'text', value: full };

		const attributes = this.parseAttributes(attrStr);
		const selfClosing = selfClose === '/' || ['br', 'hr', 'img', 'ref'].includes(tag.toLowerCase());

		if (selfClosing) {
			return { type: 'htmlTag', tag, attributes, content: [], selfClosing: true };
		}

		const closeTag = `</${tag}>`;
		const closeIdx = this.input.toLowerCase().indexOf(closeTag.toLowerCase(), this.pos);
		let content: WikiNode[];

		if (closeIdx === -1) {
			content = [];
		} else if (['nowiki', 'pre', 'code', 'syntaxhighlight', 'source', 'math'].includes(tag.toLowerCase())) {
			const raw = this.input.slice(this.pos, closeIdx);
			content = raw ? [{ type: 'text', value: raw }] : [];
			this.pos = closeIdx + closeTag.length;
		} else {
			const inner = this.input.slice(this.pos, closeIdx);
			const subParser = new WikitextParser(inner);
			content = subParser.parseNodes();
			this.pos = closeIdx + closeTag.length;
		}

		return { type: 'htmlTag', tag, attributes, content, selfClosing: false };
	}

	private parseAttributes(attrStr: string): Record<string, string> {
		const attrs: Record<string, string> = {};
		const regex = /([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
		let m: any;
		while ((m = regex.exec(attrStr))) {
			attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
		}
		return attrs;
	}

	private parseTable(): TableNode {
		this.consume('{|');
		const attrEnd = this.input.indexOf('\n', this.pos);
		const attributes = attrEnd !== -1 ? this.input.slice(this.pos, attrEnd).trim() : '';
		if (attrEnd !== -1) this.pos = attrEnd + 1;

		const rows: TableRowNode[] = [];
		let currentCells: TableCellNode[] = [];
		let isHeaderRow = false;

		while (this.pos < this.length && !this.lookingAt('|}')) {
			if (this.lookingAt('|-')) {
				if (currentCells.length) {
					rows.push({ type: 'tableRow', cells: currentCells, isHeader: isHeaderRow });
					currentCells = [];
					isHeaderRow = false;
				}
				this.consumeLine();
			} else if (this.lookingAt('|+')) {
				this.consumeLine();
			} else if (this.lookingAt('!')) {
				isHeaderRow = true;
				this.pos++;
				currentCells.push(...this.parseTableCells(true));
			} else if (this.lookingAt('|')) {
				this.pos++;
				currentCells.push(...this.parseTableCells(false));
			} else {
				this.consumeLine();
			}
		}

		if (currentCells.length) {
			rows.push({ type: 'tableRow', cells: currentCells, isHeader: isHeaderRow });
		}

		if (this.lookingAt('|}')) this.consume('|}');
		this.skipNewlines();

		return { type: 'table', attributes, rows };
	}

	private parseTableCells(isHeader: boolean): TableCellNode[] {
		const lineEnd = this.input.indexOf('\n', this.pos);
		const line = this.input.slice(this.pos, lineEnd === -1 ? this.length : lineEnd);
		this.pos = lineEnd === -1 ? this.length : lineEnd + 1;

		const delimiter = isHeader ? '!!' : '||';
		const parts = this.splitTableCells(line, delimiter);

		return parts.map(part => {
			const pipeIdx = part.indexOf('|');
			const content =
				pipeIdx !== -1 && !part.slice(0, pipeIdx).includes('[[') ? part.slice(pipeIdx + 1).trim() : part.trim();
			const subParser = new WikitextParser(content);
			return { type: 'tableCell', content: subParser.parseNodes(), isHeader };
		});
	}

	private splitTableCells(line: string, delimiter: string): string[] {
		const parts: string[] = [];
		let current = '';
		let depth = 0;
		let i = 0;
		while (i < line.length) {
			if (line.startsWith('[[', i) || line.startsWith('{{', i)) {
				current += line.slice(i, i + 2);
				depth++;
				i += 2;
			} else if (line.startsWith(']]', i) || line.startsWith('}}', i)) {
				current += line.slice(i, i + 2);
				depth--;
				i += 2;
			} else if (depth === 0 && line.startsWith(delimiter, i)) {
				parts.push(current);
				current = '';
				i += delimiter.length;
			} else {
				current += line[i];
				i++;
			}
		}
		if (current) parts.push(current);
		return parts;
	}

	private parseList(): ListNode {
		const marker = this.input[this.pos];
		const style: 'ordered' | 'unordered' | 'definition' =
			marker === '#' ? 'ordered' : marker === '*' ? 'unordered' : 'definition';

		const items: ListItemNode[] = [];
		while (this.pos < this.length && this.isAtLineStart() && this.input[this.pos] === marker) {
			this.pos++;
			const lineEnd = this.input.indexOf('\n', this.pos);
			const line = this.input.slice(this.pos, lineEnd === -1 ? this.length : lineEnd);
			this.pos = lineEnd === -1 ? this.length : lineEnd + 1;

			const subParser = new WikitextParser(line.trim());
			items.push({ type: 'listItem', content: subParser.parseNodes(), sublist: null });
		}

		return { type: 'list', style, items };
	}

	private parseHorizontalRule(): WikiNode {
		this.consume('----');
		while (this.pos < this.length && this.input[this.pos] === '-') this.pos++;
		this.skipNewlines();
		return { type: 'horizontalRule' };
	}

	private parseText(stopChars: string[]): TextNode {
		const specialStarts = ['{{', '[[', '[', "'''", "''", '<', '{|', '----'];
		let endPos = this.length;

		for (const stop of [...stopChars, ...specialStarts]) {
			const idx = this.input.indexOf(stop, this.pos);
			if (idx !== -1 && idx < endPos) endPos = idx;
		}

		let searchPos = this.pos;
		while (searchPos < endPos) {
			const nlIdx = this.input.indexOf('\n', searchPos);
			if (nlIdx === -1 || nlIdx >= endPos) break;

			const nextChar = this.input[nlIdx + 1];
			if (nextChar === '*' || nextChar === '#' || nextChar === ';' || nextChar === ':') {
				endPos = nlIdx + 1;
				break;
			}
			if (nextChar === '=') {
				const lineEnd = this.input.indexOf('\n', nlIdx + 1);
				const line = this.input.slice(nlIdx + 1, lineEnd === -1 ? this.length : lineEnd);
				if (/^={1,6}[^=].*={1,6}\s*$/.test(line)) {
					endPos = nlIdx + 1;
					break;
				}
			}
			searchPos = nlIdx + 1;
		}

		if (endPos === this.pos) endPos = this.pos + 1;
		const value = this.input.slice(this.pos, endPos);
		this.pos = endPos;
		return { type: 'text', value };
	}

	private parseTextChar(): TextNode {
		const value = this.input[this.pos];
		this.pos++;
		return { type: 'text', value };
	}

	private lookingAt(s: string): boolean {
		return this.input.startsWith(s, this.pos);
	}

	private lookingAtAny(strs: string[]): boolean {
		return strs.some(s => this.lookingAt(s));
	}

	private consume(s: string): void {
		if (this.lookingAt(s)) this.pos += s.length;
	}

	private consumeLine(): void {
		const nl = this.input.indexOf('\n', this.pos);
		this.pos = nl === -1 ? this.length : nl + 1;
	}

	private skipNewlines(): void {
		while (this.pos < this.length && this.input[this.pos] === '\n') this.pos++;
	}

	private findFirst(markers: string[]): number {
		let min = this.length;
		for (const m of markers) {
			const idx = this.findBalancedMarker(m);
			if (idx !== -1 && idx < min) min = idx;
		}
		return min;
	}

	private findBalancedMarker(marker: string): number {
		let depth = 0;
		let i = this.pos;
		while (i < this.length) {
			if (this.input.startsWith('{{', i)) {
				depth++;
				i += 2;
			} else if (this.input.startsWith('}}', i)) {
				if (marker === '}}' && depth === 0) return i;
				depth = Math.max(0, depth - 1);
				i += 2;
			} else if (this.input.startsWith('[[', i)) {
				depth++;
				i += 2;
			} else if (this.input.startsWith(']]', i)) {
				if (marker === ']]' && depth === 0) return i;
				depth = Math.max(0, depth - 1);
				i += 2;
			} else if (depth === 0 && this.input.startsWith(marker, i)) {
				return i;
			} else {
				i++;
			}
		}
		return this.length;
	}

	private findBalanced(open: string, close: string): number {
		let depth = 0;
		let i = this.pos;
		while (i < this.length) {
			if (this.input.startsWith(open, i)) {
				depth++;
				i += open.length;
			} else if (this.input.startsWith(close, i)) {
				if (depth === 0) return i;
				depth--;
				i += close.length;
			} else {
				i++;
			}
		}
		return this.length;
	}

	private isExternalLinkStart(): boolean {
		const rest = this.input.slice(this.pos + 1);
		return /^https?:\/\//.test(rest) || /^\/\//.test(rest);
	}

	private isHeadingStart(): boolean {
		if (this.pos !== 0 && this.input[this.pos - 1] !== '\n') return false;
		const lineEnd = this.input.indexOf('\n', this.pos);
		const line = this.input.slice(this.pos, lineEnd === -1 ? this.length : lineEnd);
		return /^={1,6}[^=].*={1,6}\s*$/.test(line);
	}

	private isAtLineStart(): boolean {
		return this.pos === 0 || this.input[this.pos - 1] === '\n';
	}
}

export function parse(wikitext: string): ParseResult {
	const parser = new WikitextParser(wikitext);
	return parser.parse();
}

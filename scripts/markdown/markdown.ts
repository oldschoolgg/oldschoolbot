import { isFunction } from 'e';

export class Tab {
	private title = '';
	public content = '';

	setTitle(title: string): this {
		this.title = title;
		return this;
	}

	setContent(content: string | (() => string)): this {
		this.content = isFunction(content) ? content() : content;
		return this;
	}

	toString(): string {
		return `<TabItem label="${this.title}">
    ${this.content}
</TabItem>`;
	}
}

export class Tabs {
	private tabs: Tab[] = [];

	constructor(tabs: Tab[] = []) {
		this.tabs = tabs;
	}

	addTab(tab: Tab): this {
		this.tabs.push(tab);
		return this;
	}

	toString(): string {
		const inner = this.tabs
			.filter(tab => tab.content?.length > 0)
			.map(tab => tab.toString())
			.join('\n');
		return `<Tabs>
${inner}
</Tabs>`;
	}
}

export class Table {
	private headers: string[] = [];
	private rows: string[][] = [];

	addHeader(...headers: string[]): this {
		this.headers = headers;
		return this;
	}

	addRow(...row: string[]): this {
		this.rows.push(row);
		return this;
	}

	toString(): string {
		const headerLine = `| ${this.headers.join(' | ')} |`;
		const separatorLine = `| ${this.headers.map(() => '---').join(' | ')} |`;
		const rows = this.rows.map(row => `| ${row.join(' | ')} |`).join('\n');
		return `${headerLine}\n${separatorLine}\n${rows}\n`;
	}
}

export class Markdown {
	private elements: (Tabs | Table | string | Markdown)[] = [];
	private accordionTitle: string | null = null;

	setAccordion(title: string): this {
		this.accordionTitle = title;
		return this;
	}

	addLine(str: string) {
		this.elements.push(`${str}\n`);
		return this;
	}

	add(element: Tabs | Table | string | Markdown): this {
		this.elements.push(element);
		return this;
	}

	toString(): string {
		const inner = this.elements
			.map(el => el.toString())
			.join('\n')
			.replace(/(\[\[[^\]]*?)(?<!\\):(.*?\]\])/g, '$1\\:$2');
		if (this.accordionTitle) {
			return `<details>
<summary>${this.accordionTitle}</summary>
${inner}
</details>`;
		}
		return inner;
	}
}

import type { HeadingNode, LinkNode, ParseResult, TemplateNode, WikiNode } from './types.js';

export function parseBoolean(value: string | boolean | undefined | null) {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') {
		const val = value.trim().toLowerCase();
		if (val === 'yes' || val === 'true') return true;
		if (val === 'no' || val === 'false') return false;
	}
	return Boolean(value);
}

export function getTemplates(result: ParseResult, name?: string): TemplateNode[] {
	const templates: TemplateNode[] = [];
	const visit = (nodes: WikiNode[]) => {
		for (const node of nodes) {
			if (node.type === 'template') {
				if (!name || node.name.toLowerCase() === name.toLowerCase()) {
					templates.push(node);
				}
				for (const param of node.params) visit(param.value);
			} else if (node.type === 'heading') visit(node.content);
			else if (node.type === 'bold' || node.type === 'italic') visit(node.content);
			else if (node.type === 'htmlTag') visit(node.content);
			else if (node.type === 'table') {
				for (const row of node.rows) {
					for (const cell of row.cells) visit(cell.content);
				}
			} else if (node.type === 'list') {
				for (const item of node.items) visit(item.content);
			}
		}
	};
	visit(result.nodes);
	return templates;
}

export function getLinks(result: ParseResult): LinkNode[] {
	const links: LinkNode[] = [];
	const visit = (nodes: WikiNode[]) => {
		for (const node of nodes) {
			if (node.type === 'link') links.push(node);
			else if (node.type === 'template') {
				for (const param of node.params) visit(param.value);
			} else if (node.type === 'heading') visit(node.content);
			else if (node.type === 'bold' || node.type === 'italic') visit(node.content);
			else if (node.type === 'htmlTag') visit(node.content);
		}
	};
	visit(result.nodes);
	return links;
}

export function nodesToText(nodes: WikiNode[]): string {
	let text = '';
	for (const node of nodes) {
		switch (node.type) {
			case 'text':
				text += node.value;
				break;
			case 'link':
				text += node.text ?? node.target;
				break;
			case 'externalLink':
				text += node.text ?? node.url;
				break;
			case 'template':
				break;
			case 'heading':
				text += nodesToText(node.content);
				break;
			case 'bold':
			case 'italic':
				text += nodesToText(node.content);
				break;
			case 'htmlTag':
				text += nodesToText(node.content);
				break;
			default:
				break;
		}
	}
	return text;
}

export function getSections(result: ParseResult): { heading: HeadingNode | null; content: WikiNode[] }[] {
	const sections: { heading: HeadingNode | null; content: WikiNode[] }[] = [];
	let current: WikiNode[] = [];
	let hasAddedFirst = false;

	for (const node of result.nodes) {
		if (node.type === 'heading') {
			if (!hasAddedFirst) {
				sections.push({ heading: null, content: current });
				hasAddedFirst = true;
			}
			current = [];
			sections.push({ heading: node, content: current });
		} else {
			current.push(node);
		}
	}

	if (!hasAddedFirst) {
		sections.push({ heading: null, content: current });
	}

	return sections;
}

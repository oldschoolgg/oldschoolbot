import { visit } from 'unist-util-visit';

const PUNCTUATION = '.,;:!?';

export default function rehypeFixInlineSpacing() {
	return (tree: any) => {
		visit(tree, 'element', (_node, _index, parent) => {
			if (!parent || !Array.isArray(parent.children)) return;
			const children = parent.children;
			for (let i = 1; i < children.length; i++) {
				const prev = children[i - 1];
				const curr = children[i];

				// Fix missing space before inline element (e.g. <a>)
				if (
					curr.type === 'element' &&
					['a', 'span', 'strong', 'em', 'code'].includes(curr.tagName) &&
					prev.type === 'text' &&
					prev.value.length > 0
				) {
					const prevChar = prev.value[prev.value.length - 1];
					if (!/\s/.test(prevChar) && !PUNCTUATION.includes(prevChar)) {
						prev.value += ' ';
					}
				}

				// Fix missing space after inline element
				if (
					prev.type === 'element' &&
					['a', 'span', 'strong', 'em', 'code'].includes(prev.tagName) &&
					curr.type === 'text' &&
					curr.value.length > 0
				) {
					let prevText = '';
					const lastChild = prev.children?.[prev.children.length - 1];
					if (lastChild && lastChild.type === 'text') {
						prevText = lastChild.value;
					} else if (prev.type === 'element' && prev.children?.length === 0 && prev.value) {
						prevText = prev.value;
					}

					if (/^\s/.test(curr.value)) continue;
					if (PUNCTUATION.includes(curr.value[0])) continue;
					if (prevText && /[\s.,;:!?]$/.test(prevText)) continue;
					curr.value = ` ${curr.value}`;
				}
			}
		});
	};
}

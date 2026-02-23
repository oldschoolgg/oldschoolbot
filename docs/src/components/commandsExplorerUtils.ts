export type ChoiceNode = {
	name: string;
	value: string | number;
};

export type OptionNode = {
	name: string;
	description: string;
	type: string;
	required: boolean;
	choices?: ChoiceNode[];
	min?: number;
	max?: number;
};

export type CommandNode = {
	name: string;
	path: string;
	description: string;
	examples?: string[];
	options: OptionNode[];
	subcommands: CommandNode[];
};

export const toAnchorId = (commandPath: string): string =>
	commandPath
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

export const normalizeExample = (example: string): string => {
	const trimmed = example.trim();
	return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

export const formatChoiceDisplay = (choice: ChoiceNode): string => {
	const choiceName = String(choice.name ?? '').trim();
	const choiceValue = String(choice.value ?? '').trim();
	if (!choiceName) return choiceValue;
	return choiceName;
};

export function getNodeSearchText(node: CommandNode): string {
	const optionsText = node.options
		.map(option => {
			const choicesText = (option.choices ?? [])
				.map(choice => `${choice.name} ${String(choice.value)}`)
				.join(' ');
			return `${option.name} ${option.description} ${choicesText}`;
		})
		.join(' ');
	return `/${node.path} ${node.name} ${node.description} ${optionsText}`.toLowerCase();
}

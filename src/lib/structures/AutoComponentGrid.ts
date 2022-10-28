import { ActionRowBuilder, AnyComponentBuilder, normalizeArray, RestOrArray } from 'discord.js';
import { chunk } from 'e';

export class AutoComponentGrid<T extends AnyComponentBuilder> {
	public readonly components: T[];
	constructor(...components: RestOrArray<T>) {
		this.components = [];
		if (components) this.components.push(...normalizeArray(components));
	}

	addComponents(...components: RestOrArray<T>) {
		this.components.push(...normalizeArray(components));
		return this;
	}

	outputComponents() {
		const buttonGroups = chunk(this.components, 5);
		const result = buttonGroups.map(g => new ActionRowBuilder<T>({ components: g }));
		return result;
	}
}

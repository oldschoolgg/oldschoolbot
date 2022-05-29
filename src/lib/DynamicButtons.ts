import { MessageButton } from 'discord.js';
import { chunk } from 'e';
import murmurhash from 'murmurhash';

export class DynamicButtons {
	buttons: { name: string; id: string; fn: () => {}; emoji: string | undefined; cantBeBusy: boolean }[] = [];

	render({ isBusy }: { isBusy: boolean }) {
		const buttons = this.buttons
			.filter(b => {
				if (isBusy && b.cantBeBusy) return false;
				return true;
			})
			.map(b => new MessageButton({ label: b.name, customID: b.id, style: 'SECONDARY', emoji: b.emoji }));
		return chunk(buttons, 5);
	}

	add({ name, fn, emoji, cantBeBusy }: { name: string; fn: () => {}; emoji?: string; cantBeBusy?: boolean }) {
		const id = murmurhash(name).toString();
		this.buttons.push({
			name,
			id,
			fn,
			emoji,
			cantBeBusy: cantBeBusy ?? false
		});
	}
}

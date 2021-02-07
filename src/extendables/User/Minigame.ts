import { User } from 'discord.js';
import { Extendable, ExtendableStore, KlasaUser } from 'klasa';

import { MinigameIDsEnum, Minigames } from '../../lib/minions/data/minigames';
import { MinigameTable } from '../../lib/typeorm/MinigameTable.entity';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	async getMinigameScore(this: KlasaUser, id: MinigameIDsEnum) {
		const MinigameEntity = await this.getMinigameEntity();
		const minigame = Minigames.find(i => i.id === id)!;
		return MinigameEntity[minigame.key];
	}

	async getMinigameEntity(this: KlasaUser): Promise<MinigameTable> {
		let value = await MinigameTable.findOne({ userID: this.id });
		if (!value) {
			value = new MinigameTable();
			value.userID = this.id;
			await value.save();
		}
		return value;
	}

	public async incrementMinigameScore(this: User, minigameID: number, amountToAdd = 1) {
		const MinigameEntity = await this.getMinigameEntity();
		const minigame = Minigames.find(i => i.id === minigameID)!;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		MinigameEntity[minigame.key] += amountToAdd;
		this.log(`had Quantity[${amountToAdd}] Score added to ${minigame.name}`);
		await MinigameEntity.save();
	}
}

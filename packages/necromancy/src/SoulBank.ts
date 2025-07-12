import { GeneralBank, type GeneralBankType } from '@oldschoolgg/toolkit/structures';

type MonsterId = number;

export class SoulBank extends GeneralBank<MonsterId> {
	constructor(initialBank?: GeneralBankType<MonsterId>) {
		super({ initialBank });
	}
}

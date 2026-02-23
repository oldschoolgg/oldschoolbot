import { type AnyInteraction, type InputItx, MInteraction } from '@oldschoolgg/discord';
import { MathRNG } from 'node-rng';

type OSInputItx<T extends AnyInteraction> = InputItx<T> & { user: MUser };

export class OSInteraction<T extends AnyInteraction = AnyInteraction> extends MInteraction<T> {
	public user: MUser;

	constructor({ user, ...rest }: OSInputItx<T>) {
		super(rest);
		this.user = user;
	}

	get rng(): RNGProvider {
		return MathRNG;
	}
}

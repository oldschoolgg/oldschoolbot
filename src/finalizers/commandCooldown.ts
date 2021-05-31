import { Command, Finalizer, FinalizerStore, KlasaMessage, RateLimitManager } from 'klasa';

export default class extends Finalizer {
	public cooldowns: WeakMap<object, any> = new WeakMap();

	public constructor(store: FinalizerStore, file: string[], directory: string) {
		super(store, file, directory);
	}

	run(message: KlasaMessage, command: Command) {
		if (command.cooldown <= 0 || this.client.owners.has(message.author)) return;

		try {
			this.getCooldown(message, command).drip();
		} catch (err) {
			this.client.emit(
				'error',
				new Error(
					`${message.author.username}[${message.author.id}] has exceeded the RateLimit for ${message.command}`
				)
			);
		}
	}

	getCooldown(message: KlasaMessage, command: Command) {
		let cooldownManager = this.cooldowns.get(command);
		if (!cooldownManager) {
			cooldownManager = new RateLimitManager(command.bucket, command.cooldown * 1000);
			this.cooldowns.set(command, cooldownManager);
		}
		return cooldownManager.acquire(
			message.guild ? message[command.cooldownLevel]!.id : message.author.id
		);
	}
}

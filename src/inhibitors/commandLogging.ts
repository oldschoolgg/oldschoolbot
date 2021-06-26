import { Command, Inhibitor, InhibitorStore, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	public constructor(store: InhibitorStore, file: string[], directory: string) {
		super(store, file, directory);
	}

	run(message: KlasaMessage, command: Command) {
		const shard = message.guild ? message.guild.shardID : 0;
		this.client.emit(
			'log',
			[
				`[${shard}]`,
				`${command.name}(${message.args ? message.args.join(', ') : ''})`,
				`${message.author.username}[${message.author.id}]`,
				message.guild ? `${message.guild.name}[${message.guild.id}]` : 'Direct Messages'
			].join(' ')
		);
	}
}

import { CommandStore, KlasaMessage, Stopwatch, Type, util } from 'klasa';
import { inspect } from 'util';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['ev'],
			permissionLevel: 10,
			guarded: true,
			usage: '<expression:str>',
			categoryFlags: ['hidden']
		});
	}

	async run(message: KlasaMessage, [code]: [string]) {
		if (!this.client.owners.has(message.author)) return null;
		const { success, result, time, type } = await this.eval(message, code);
		if (typeof result !== 'string') return null;

		const footer = util.codeBlock('ts', type);
		const output = message.language.get(
			success ? 'COMMAND_EVAL_OUTPUT' : 'COMMAND_EVAL_ERROR',
			time,
			util.codeBlock('js', result),
			footer
		);

		if ('silent' in message.flagArgs) return null;

		// Handle too-long-messages
		if (output.length > 2000) {
			if (message.guild && message.channel.attachable) {
				return message.channel.sendFile(
					Buffer.from(result),
					'output.txt',
					message.language.get('COMMAND_EVAL_SENDFILE', time, footer)
				);
			}
			this.client.emit('log', result);
			return message.sendLocale('COMMAND_EVAL_SENDCONSOLE', [time, footer]);
		}

		// If it's a message that can be sent correctly, send it
		return message.sendMessage(output);
	}

	// Eval the input
	async eval(message: KlasaMessage, code: string) {
		// eslint-disable-next-line no-unused-vars
		const msg = message;
		const { flagArgs: flags } = message;
		code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
		const stopwatch = new Stopwatch();
		let success = false;
		let syncTime = '?';
		let asyncTime = '?';
		let result = null;
		let thenable = false;
		// eslint-disable-next-line @typescript-eslint/init-declarations
		let type!: Type;
		try {
			if (flags.async) code = `(async () => {\n${code}\n})();`;
			else if (flags.bk) code = `(async () => {\nreturn ${code}\n})();`;
			// eslint-disable-next-line no-eval
			result = eval(code);
			syncTime = stopwatch.toString();
			type = new Type(result);
			if (util.isThenable(result)) {
				thenable = true;
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.toString();
			}
			success = true;
		} catch (error) {
			if (!syncTime) syncTime = stopwatch.toString();
			if (!type) type = new Type(error);
			if (thenable && !asyncTime) asyncTime = stopwatch.toString();
			if (error && error.stack) this.client.emit('error', error.stack);
			result = error;
			success = false;
		}

		stopwatch.stop();
		if (msg.flagArgs.bk) {
			msg.channel.sendBankImage({ bank: result });
		}

		if (typeof result !== 'string') {
			result = inspect(result, {
				depth: flags.depth ? parseInt(flags.depth) || 0 : 0,
				showHidden: Boolean(flags.showHidden)
			});
		}

		return {
			success,
			type,
			time: this.formatTime(syncTime, asyncTime),
			result: util.clean(result)
		};
	}

	formatTime(syncTime: string, asyncTime: string | undefined) {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}
}

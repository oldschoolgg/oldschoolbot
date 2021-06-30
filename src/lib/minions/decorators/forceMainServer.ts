import { KlasaMessage } from 'klasa';
import { createFunctionInhibitor } from 'klasa-decorators';

/**
 * Ironmen cant use this.
 */
export const forceMainServer = createFunctionInhibitor(
	(msg: KlasaMessage) => {
		return msg.guild
			? ['858140841809936434', '718538129320968222'].includes(msg.guild.id)
			: msg.channel.type === 'dm'
			? ['156230339621027840', '188114790676168704', '730113358249984001'].includes(msg.channel.recipient.id)
			: false;
	},
	(msg: KlasaMessage) => {
		msg.channel.send('What are you doing step-minion?');
	}
);

export default forceMainServer;

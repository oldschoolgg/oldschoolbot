import { KlasaMessage } from 'klasa';
import { createFunctionInhibitor } from 'klasa-decorators';

/**
 * Disalow command usage outside the server declared here
 */
export const forceMainServer = createFunctionInhibitor(
	(msg: KlasaMessage) => {
		return ['342983479501389826'].includes(msg.guild!.id);
	},
	(msg: KlasaMessage) => {
		msg.channel.send(
			'This command is only allowed in the Official Discord Channel: https://discord.com/invite/WJWmAuJ'
		);
	}
);

export default forceMainServer;

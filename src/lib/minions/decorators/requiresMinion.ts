import { KlasaMessage } from 'klasa';
import { createFunctionInhibitor } from 'klasa-decorators';

/**
 * Requires that the user has a minion to execute this function.
 */
const requiresMinion = createFunctionInhibitor(
	(msg: KlasaMessage) => {
		return msg.author.hasMinion;
	},
	(msg: KlasaMessage) => {
		msg.channel.send(`You don't have a minion yet. You can buy one by typing \`${msg.cmdPrefix}minion buy\`.`);
	}
);

export default requiresMinion;

import { KlasaMessage } from 'klasa';
import { createFunctionInhibitor } from 'klasa-decorators';

/**
 * Requires that the users' minion isn't busy.
 */
const minionNotBusy = createFunctionInhibitor(
	(msg: KlasaMessage) => {
		return !msg.author.minionIsBusy;
	},
	(msg: KlasaMessage) => {
		msg.author.log('[TTK-BUSY] Decorator');
		return msg.send(`${msg.author.minionName} is currently busy.`);
	}
);

export default minionNotBusy;

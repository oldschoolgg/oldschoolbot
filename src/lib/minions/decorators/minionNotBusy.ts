import { createFunctionInhibitor } from 'klasa-decorators';
import { KlasaMessage } from 'klasa';

/**
 * Requires that the users' minion isn't busy.
 */
const minionNotBusy = createFunctionInhibitor(
	(msg: KlasaMessage) => {
		return !msg.author.minionIsBusy;
	},
	(msg: KlasaMessage) => msg.send(`${msg.author.minionName} is currently busy.`)
);

export default minionNotBusy;

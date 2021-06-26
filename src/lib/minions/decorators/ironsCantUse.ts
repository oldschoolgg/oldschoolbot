import { KlasaMessage } from 'klasa';
import { createFunctionInhibitor } from 'klasa-decorators';

/**
 * Ironmen cant use this.
 */
const ironsCantUse = createFunctionInhibitor(
	(msg: KlasaMessage) => {
		return !msg.author.isIronman;
	},
	(msg: KlasaMessage) => {
		msg.channel.send("You can't do this, as you're an ironman and chose to limit yourself!");
	}
);

export default ironsCantUse;

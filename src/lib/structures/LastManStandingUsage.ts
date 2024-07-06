export default class LastManStandingUsage {
	public contestants = 0;
	public deaths: Set<number> = new Set();
	public killers: Set<number> = new Set();
	private readonly parts: (string | number)[] = [];

	public constructor(usage: string) {
		this.parse(usage);
	}

	public display(...values: string[]) {
		return this.parts.map(part => (typeof part === 'number' ? `**${values[part]}**` : part)).join('');
	}

	public parse(usage: string): void {
		let current = '';
		let char: string | undefined = undefined;
		for (let i = 0; i < usage.length; i++) {
			char = usage.charAt(i);
			if (char === '{') {
				// If there was text, push buffer
				if (current) {
					this.parts.push(current);
					current = '';
				}

				// Parse tag {NT?}
				const n = Number(usage.charAt(++i));

				// If N > contestants, assign contestants to N
				if (n > this.contestants) this.contestants = n;

				const nextChar = ++i;
				// If D, add death; if K, add killer
				if (usage.charAt(nextChar) === 'D') {
					this.deaths.add(n - 1);
					i++;
				} else if (usage.charAt(nextChar) === 'K') {
					this.killers.add(n - 1);
					i++;
				}

				this.parts.push(n - 1);
			} else {
				current += char;
			}
		}

		if (current) this.parts.push(current);
	}
}

export const LMS_PREP = [
	'{1} grabs a Dragon dagger.',
	'{1} grabs an Abyssal whip and retreats.',
	'{1} and {2} fight for a whip. {1} gives up and retreats.',
	"{1} finds a Heavy ballista, some Javelins, and an Ava's assembler.",
	'{1} runs into a building and hides upstairs.',
	"{1} takes a handful of Morrigan's Javelins.",
	"{1} rips a Zuriel's staff out of {2}'s hands.",
	'{1} finds a Saradomin brew.',
	'{1} gathers as much food as they can.',
	"{1} grabs a Vesta's longsword.",
	'{1} takes a Ghrazi Rapier from inside the Trinity Outpost.',
	'{1} finds a Crate with an Infernal cape.',
	'{1} takes a AGS from inside the Moser Settlement.',
	'{1}, {2}, and {3} work together to get as many supplies as possible.',
	'{1} runs away with a pair of Eternal boots and some sharks.',
	'{1} snatches a vial of Super restore and a Stamina potion.',
	'{1} finds a box full of supplies and a Granite maul.',
	'{1} searches a supply box, not realizing it is empty.',
	'{1}, {2}, {3}, and {4} share everything they gathered before running.',
	'{1} retrieves a Staff of the Dead from the Debtor hideout .',
	"{1} grabs a Stamina potion while {2} finds a set of Ahrim's robes.",
	'{1} scares {2} away from the Moser Settlement.',
	'{1} grabs a Dragonfire shield from the ground on The Mountain.',
	'{1} snatches a pair of Dragon claws.',
	'{1} grabs a lone pair of pants.',
	'{1} grabs a lone ranger boot and wears it on their head.',
	'{1} trips over while running to a building, {2} picks them up and they run off together.',
	'{1} has to go to the bathroom and comes back to {2} picking their pockets'
].map(string => new LastManStandingUsage(string));

export const LMS_FINAL = [
	'{1} eats a shark.',
	'{1} attacks {2}, but they manage to escape.',
	'{1} chases {2}.',
	'{1} runs away from {2}.',
	'{1} defeats {2} in a fight, but spares their life.',
	'{1} and {2} work together for now...',
	'{1} travels to higher ground.',
	'{1} forces {2} to eat pant.',
	'{1} searches for a bloody chest.',
	'{1} uses their bloodier key and receives a full inventory of food.',
	"{1K} throws a dragon knife into {2D}'s head.",
	'{1D} begs for {2K} to kill them. They reluctantly oblige, killing {1D}.',
	'{1K} decapitates {2D} with an AGS spec.',
	'{1K} severely injures {2D}, but puts them out of their misery.',
	'{1K} severely injures {2D} and leaves them to die.',
	"{1K} bashes {2D}'s head in with a Dragon mace.",
	"{1K} throws a dragon knife into {2D}'s chest.",
	'{1D} is unable to convince {2K} to not kill them.',
	'{1K} convinces {2D} to not kill them, only to kill {2D} instead.',
	'{1D} unknowingly runs into the fog and dies.',
	'{1K} throws a chinchompa, killing {2D}.',
	'{1K} throws a chinchompa, killing {2D}, and {3D}.',
	'{1D} dies from poison.',
	'{1D} dies from venom.',
	"{1K} kills {2D} with a Morrigan's throwing axe.",
	'{1D} dies in the fog trying to escape the arena.',
	'{1D} accidently detonates a chinchompa trying to throw it.',
	'{1K} ambushes {2D} and kills them.',
	"{1K} KO's {2D} with an AGS spec.",
	'{1K} shoots {2D} with a Dark bow.',
	"{1K} stabs {2D} in the back with a Vesta's longsword.",
	'{1K} kills {2D} with a Ghrazi rapier.',
	'{1K} punches {2D} in the face.',
	'{1D} Talks about how good they are while fighting {2K} and is promptly stacked out by {2K}.',
	'{1K} repeatedly stabs {2D} to death with Draggon dagger.',
	'{1D} is found to be using an auto-prayer client and is banned mid game.'
].map(string => new LastManStandingUsage(string));

export const LMS_ROUND = [
	'{1D} steps out of the safezone too soon and gets killed by the fog.',
	"{1K} throws a Morrigan's Javelin into {2D}'s head.",
	'{1D} gets 6 Hour logged and dies.',
	'{1K} catches {2D} off guard and AGS specs a 73.',
	"{1K} shoots a Dragon arrow into {2D}'s head.",
	'{1D} cannot handle the circumstances and runs off into the fog.',
	"{1K} bashes {2D}'s head with a Granite maul several times.",
	'{1K} exsanguinates {2D} with a Ghrazi Rapier.',
	"{1K} plunges a Dragon dagger into {2D}'s abdomen.",
	'{1K} sets {2D} on fire with an Infernal cape.',
	'{1D} falls into a pit and dies.',
	'{1K} stabs {2D} while their back is turned.',
	'{1K} severely injures {2D}, but puts them out of their misery.',
	'{1K} severely injures {2D} and leaves them to die.',
	"{1K} bashes {2D}'s head in with an Elder maul.",
	'{1K} pushes {2D} off a cliff during a whip fight.',
	"{1K} throws a Dragon knife into {2D}'s chest.",
	'{1D} is unable to convince {2K} to not kill them.',
	'{1K} convinces {2D} to not kill them, only to kill {2D} instead.',
	'{1K}, {2}, and {3D} start fighting, but {2} runs away as {1K} kills {3D}.',
	'{1K} kills {2D} with their own spec weapon.',
	'{1K} overpowers {2D}, killing them.',
	'{1K} throws a Chinchompa, killing {2D}.',
	'{1K} throws a Chinchompa, killing {2D}, and {3D}.',
	'{1K} throws a Chinchompa, killing {2D}, {3D}, and {4D}.',
	'{1K} throws a Chinchompa, killing {2D}, {3D}, {4D} and {5D}.',
	'{1D} trips over a chinchompa while running away from {2}, blowing themself up.',
	'{1D} trips over a chinchompa while running away from {2D}, blowing them both up.',
	'{1K} kills {2D} as they try to run away.',
	'{1D}, {2D}, {3D}, and {4D} form a suicide pact, and run off into the fog.',
	'{1K} kills {2D} with a Dragon thrownaxe.',
	'{1K} and {2K} fight {3D} and {4D}. {1K} and {2K} survive.',
	'{1D} and {2D} fight {3K} and {4K}. {3K} and {4K} survive.',
	'{1D} attacks {2}, but {3K} protects them, killing {1D}.',
	'{1K} severely slices {2D} with an Armadyl godsword.',
	'{1K} strangles {2D} with an Abyssal whip.',
	'{1K} kills {2D} for their supplies.',
	'{1K} hurls a Dragon Javelin at {2}, but misses and kills {3D} instead.',
	"{1K} shoots a poisonous Dragon dart into {2D}'s neck, slowly killing them.",
	'{1K} stabs {2D} with a Ghrazi rapier.',
	'{1K} stabs {2D} in the back with a Zuriels Staff.',
	'{1K}, {2D}, and {3D} get into a fight. {1K} triumphantly kills them both.',
	'{1K} finds {2D} hiding in the Debtor Hideout and kills them.',
	'{1D} finds {2K} hiding in the Debtor Hideout, but {2K} kills them.',
	'{1K} kills {2D} with a Dragon scimitar.',
	'{1K} and {2D} fight for a crate.{1K} strangles {2D} with a whip and runs.',
	'{1K} repeatedly stabs {2D} to death with a Ghrazi Rapier.',
	'{1D} trips over while running from the fog, and is killed by {2K}.',
	'{1} trips over while running from the fog, {2} picks them up and they run off together.',
	"{1K} aims a Dragon arrow at {2}'s head and shoots, {3D} jumps in the way and sacrifices their life to save them.",
	'{1} searches for a bloody chest.',
	'{1} hides in a building to rest.',
	'{1} eats all their food.',
	'{1} and {2} run into each other and decide to truce for the round.',
	'{1} thinks about winning.',
	'{1} looks at the night sky.',
	'{1} defeats {2} in a fight, but spares their life.',
	'{1} begs for {2} to kill them. They refuse, keeping {1} alive.',
	'{1} finds a Dragon hatchet in a chest.',
	'{1} finds a combat potion in a chest.',
	'{1} finds potions in a chest.',
	'{1} finds food in a chest.',
	'{1} finds a chinchompa in a chest.',
	'{1} questions their sanity.',
	'{1} forces {2} to eat pant.',
	'{1K} forces {2D} to eat pant. {2D} chokes and dies.',
	'{1K} catches {2D} off guard and kills them.',
	"{1K} throws a dragon knife into {2D}'s head.",
	'{1D} begs for {2K} to kill them. They reluctantly oblige, killing {1D}.',
	'{1K} and {2K} work together to kill {3D}.',
	"{1K} shoots a Dark bow spec into {2D}'s head.",
	'{1D} bleeds out due to untreated injuries.',
	'{1D} cannot handle the circumstances and logs out.',
	'{1D} unknowingly eats cadava berries and dies.',
	'{1K} silently specs out {2D}.',
	'{1K} decapitates {2D} with an AGS spec.',
	'{1K} spears {2D} in the abdomen.',
	'{1K} sets {2D} on fire with Flames of Zamorak.',
	'{1K} stabs {2D} while their back is turned.',
	'{1K} severely injures {2D}, but puts them out of their misery.',
	'{1K} severely injures {2D} and leaves them to die.',
	"{1K} bashes {2D}'s head in with a mace.",
	'{1K} pushes {2D} off a cliff during a knife fight.',
	"{1K} throws a knife into {2D}'s chest.",
	'{1D} is unable to convince {2K} to not kill them.',
	'{1K} convinces {2D} to not kill them, only to kill {2D} instead.',
	'{1K}, {2}, and {3D} start fighting, but {2} runs away as {1K} kills {3D}.',
	'{1K} kills {2D} with their own weapon.',
	'{1K} overpowers {2D}, killing them.',
	'{1K} kills {2D} as they try to run.',
	'{1K} kills {2D} with a dragon hatchet.',
	'{1K} and {2K} fight {3D} and {4D}. {1K} and {2K} survive.',
	'{1D} dies in the fog trying to escape the arena.',
	'{1D} accidentally detonates a Chinchompa while trying to pet it.',
	'{1D} attacks {2}, but {3K} protects them, killing {1D}.',
	'{1K} ambushes {2D} and kills them.',
	'{1D} accidently sets off a wild chinchompa, getting blown to pieces.',
	"{1K} severely slices {2D} with a Vesta's longsword.",
	'{1K} strangles {2D} with an Abyssal whip.',
	'{1K} kills {2D} for their supplies.',
	'{1K} shoots an arrow at {2}, but misses and kills {3D} instead.',
	"{1K} shoots a poisonous bronze dart into {2D}'s neck, slowly killing them.",
	'{1K}, {2K}, and {3K} successfully ambush and kill {4D}, {5D}, and {6D}.',
	'{1D}, {2D}, and {3D} unsuccessfully ambush {4K}, {5K}, and {6K}, who kill them instead.',
	"{1K} stabs {2D} with a Vesta's spear.",
	'{1} forces {2K} to kill {3D} or {4}. They decide to kill {3D}.',
	'{1K} forces {2D} to kill {3} or {4}. They refuse to kill, so {1K} kills them instead.',
	"{1D} poisons {2}'s potion, but mistakes it for their own and dies.",
	"{1K} poisons {2D}'s potion. They drink it and die.",
	'{1K}, {2D}, and {3D} get into a fight. {1K} triumphantly kills them both.',
	"{1K} kills {2D} with a Statius's warhammer.",
	'{1K} and {2K} track down and kill {3D}.',
	'{1K} tracks down and kills {2D}.',
	'{1K} repeatedly stabs {2D} to death with a Dragon dagger.',
	'{1D} trips and falls into the river.',
	'{1D} gets killed by a bot using an auto prayer switcher.',
	'{1D} gets hit in the head by a falling supply crate.',
	'{1D} disconnects due to their mom pulling out the internet cord',
	'{1K} smashes {2D} over the head with a pet rock.',
	"{1D} gets told it's time for dinner"
].map(string => new LastManStandingUsage(string));

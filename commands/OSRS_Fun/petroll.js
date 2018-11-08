const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Rolls a chance at getting every Pet at once.',
			usage: '<amount:int{1,100}>'
		});
		this.pets = {
			'<:Baby_chinchompa_red:324127375539306497>': 30000,
			'<:Baby_mole:324127375858204672>': 3000,
			'<:Beaver:324127375761604611>': 40000,
			'<:Bloodhound:324127375602483212>': 1000,
			'<:Callisto_cub:324127376273440768>': 2000,
			'<:Giant_squirrel:324127376432824320>': 30000,
			'<:Heron:324127376516841483>': 30000,
			'<:Kalphite_princess_2nd_form:324127376915300352>': 3000,
			'<:Olmlet:324127376873357316>': 3000,
			'<:Pet_chaos_elemental:324127377070227456>': 1000,
			'<:Pet_dagannoth_prime:324127376877289474>': 5000,
			'<:Pet_dagannoth_rex:324127377091330049>': 5000,
			'<:Pet_dagannoth_supreme:324127377066164245>': 5000,
			'<:Pet_dark_core:324127377347313674>': 5000,
			'<:Pet_general_graardor:324127377376673792>': 5000,
			'<:Pet_kraken:324127377477206016>': 3000,
			'<:Pet_kreearra:324127377305239555>': 5000,
			'<:Pet_kril_tsutsaroth:324127377527406594>': 5000,
			'<:Pet_penance_queen:324127377649303553>': 1000,
			'<:Pet_smoke_devil:324127377493852162>': 3000,
			'<:Pet_snakeling:324127377816944642>': 5000,
			'<:Pet_zilyana:324127378248957952>': 5000,
			'<:Phoenix:324127378223792129>': 5000,
			'<:Prince_black_dragon:324127378538364928>': 3000,
			'<:Rift_guardian_fire:324127378588827648>': 40000,
			'<:Rock_golem:324127378429313026>': 30000,
			'<:Rocky:324127378647285771>': 30000,
			'<:Scorpias_offspring:324127378773377024>': 3000,
			'<:Skotos:324127378890817546>': 65,
			'<:Tangleroot:324127378978635778>': 30000,
			'<:Tzrekjad:324127379188613121>': 200,
			'<:Venenatis_spiderling:324127379092144129>': 2000,
			'<:Vetion_jr:324127378999738369>': 2000,
			'<:Abyssal_orphan:324127375774449664>': 2560,
			'<:Hellpuppy:324127376185491458>': 3000,
			'<:Chompy_chick:346196885859598337>': 500,
			'<:Jalnibrek:346196886119514113>': 200,
			'<:Herbi:357773175318249472>': 6500,
			'<:Noon:379595337234382848>': 3000,
			'<:Vorki:400713309252222977>': 3000,
			'<:Lil_zik:479460344423776266>': 650
		};
	}

	async run(msg, [amount]) {
		const pets = [];

		for (let i = 0; i < amount; i++) {
			for (const pet in this.pets) {
				if (this.roll(this.pets[pet])) pets.push(pet);
			}
		}

		if (pets.length === 0) return msg.send("You didn't get any pets!");
		return msg.send(pets.join(' '));
	}

};

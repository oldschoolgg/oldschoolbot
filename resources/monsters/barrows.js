const barrows = {
	drops: [
		'<:Veracs_plateskirt:403038865130127361>',
		'<:Veracs_helm:403038865239179264>',
		'<:Veracs_flail:403038865176264715>',
		'<:Veracs_brassard:403038865079795722>',
		'<:Torags_platelegs:403038865092509705>',
		'<:Torags_platebody:403038865008361472>',
		'<:Torags_helm:403038864983457803>',
		'<:Torags_hammers:403038864853303296>',
		'<:Karils_leathertop:403038864798646282>',
		'<:Karils_leatherskirt:403038864777936921>',
		'<:Dharoks_greataxe:403038864299655169>',
		'<:Dharoks_helm:403038864199122947>',
		'<:Dharoks_platebody:403038864404512768>',
		'<:Dharoks_platelegs:403038864114974731>',
		'<:Guthans_chainskirt:403038864446586880>',
		'<:Guthans_helm:403038864404512770>',
		'<:Guthans_platebody:403038864299655171>',
		'<:Guthans_warspear:403038864681467905>',
		'<:Karils_coif:403038864718954497>',
		'<:Karils_crossbow:403038864777805825>',
		'<:Ahrims_staff:403038864350117889>',
		'<:Ahrims_robetop:403038864316301337>',
		'<:Ahrims_robeskirt:403038864350117888>',
		'<:Ahrims_hood:403038864362438666>'
	],
	rollSigil(int) {
		if (int < 1) {
			return this.drops.elysianSigil;
		} else if (int < 4) {
			return this.drops.spectralSigil;
		} else {
			return this.drops.arcaneSigil;
		}
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(17)) {
				loot.push(this.drops[Math.floor(Math.random() * this.drops.length)]);
			}
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = barrows;

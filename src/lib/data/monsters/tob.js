const tob = {
	drops: {
		pet: {
			emoji: '<:Lil_zik:479460344423776266>',
			name: `Lil' Zik`,
			shortName: 'pet',
			price: 0
		},
		scytheOfVitur: {
			emoji: '<:Scythe_of_vitur_uncharged:455403545294929920>',
			name: 'Scythe of Vitur',
			shortName: 'scytheOfVitur',
			price: 1133056452
		},
		sanguinestiStaff: {
			emoji: '<:Sanguinesti_staff_uncharged:455403545298993162>',
			name: 'Sanguinesti Staff',
			shortName: 'sanguinestiStaff',
			price: 102979616
		},
		ghraziRapier: {
			emoji: '<:Ghrazi_rapier:455403545093472268>',
			name: 'Ghrazi Rapier',
			shortName: 'ghraziRapier',
			price: 162877526
		},
		justiciarFaceguard: {
			emoji: '<:Justiciar_faceguard:455403544971968523>',
			name: 'Justiciar Faceguard',
			shortName: 'justiciarFaceguard',
			price: 31166928
		},
		justiciarChestguard: {
			emoji: '<:Justiciar_chestguard:455403544854659093>',
			name: 'Justiciar Chestguard',
			shortName: 'justiciarChestguard',
			price: 18787917
		},
		justiciarLegguards: {
			emoji: '<:Justiciar_legguards:455403545265700874>',
			name: 'Justiciar Legguards',
			shortName: 'justiciarLegguards',
			price: 19042774
		},
		avernicDefenderHilt: {
			emoji: '<:Avernic_defender_hilt:455403544900534272>',
			name: 'Avernic Defender Hilt',
			shortName: 'avernicDefenderHilt',
			price: 69393965
		}
	},
	kill(quantity) {
		if (quantity <= 100) {
			return this.smallKill(quantity);
		} else {
			return this.bigKill(quantity);
		}
	},
	smallKill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(650)) loot.push(this.drops.pet.emoji);
			if (this.roll(9.1 * 4)) loot.push(this.determineItem().emoji);
		}
		return loot.join(' ');
	},
	bigKill(quantity) {
		const loot = {
			pet: 0,
			scytheOfVitur: 0,
			ghraziRapier: 0,
			avernicDefenderHilt: 0,
			sanguinestiStaff: 0,
			justiciarFaceguard: 0,
			justiciarChestguard: 0,
			justiciarLegguards: 0
		};
		const displayLoot = [];
		let totalValue = 0;

		for (let i = 0; i < quantity; i++) {
			if (this.roll(650)) loot.pet++;
			if (this.roll(9.1 * 4)) loot[this.determineItem().shortName]++;
		}
		for (const key in loot) {
			displayLoot.push(`**${this.drops[key].emoji}**: ${loot[key].toLocaleString()} `);
			totalValue += this.drops[key].price * loot[key];
		}
		displayLoot.push(`\n**Total Value:** ${totalValue.toLocaleString()} GP`);
		displayLoot.push(`**GP/HR** ${(totalValue / ((quantity * 25) / 60)).toLocaleString()} GP`);
		displayLoot.push(`**Total Hours**: ${((quantity * 25) / 60).toLocaleString()}`);
		return displayLoot.join('\n');
	},
	finish() {
		const { drops } = this;
		let kc = 0;
		const loot = [];
		const lootTrack = [];
		while (loot.length < 8) {
			kc++;
			if (!lootTrack.includes(drops.pet) && this.roll(650)) {
				lootTrack.push(drops.pet);
				loot.push(`**Lil' Zik:** ${kc} KC ${drops.pet.emoji}`);
			}
			if (!this.roll(9.1 * 4)) continue;
			const droppedItem = this.determineItem();
			if (!lootTrack.includes(droppedItem.shortName)) {
				loot.push(`**${droppedItem.name}:** ${kc} KC ${droppedItem.emoji}`);
				lootTrack.push(droppedItem.shortName);
			}
		}
		return `It took you **${kc.toLocaleString()}** kills to finish the Theatere of Blood ${drops.pet.emoji} ${loot.join('\n')}`;
	},

	determineItem() {
		const number = parseInt(Math.random() * 19 + 1);
		switch (true) {
			case number === 1:
				return this.drops.scytheOfVitur;
			case number <= 3:
				return this.drops.sanguinestiStaff;
			case number <= 5:
				return this.drops.ghraziRapier;
			case number <= 7:
				return this.drops.justiciarFaceguard;
			case number <= 9:
				return this.drops.justiciarChestguard;
			case number <= 11:
				return this.drops.justiciarLegguards;
			default:
				return this.drops.avernicDefenderHilt;
		}
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = tob;

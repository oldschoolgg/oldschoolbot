const tob = {
	drops: {
		pet: '<:Lil_zik:455403545424822272>',
		scytheOfVitur: '<:Scythe_of_vitur_uncharged:455403545294929920>',
		sanguinestiStaff: '<:Sanguinesti_staff_uncharged:455403545298993162>',
		justiciarLegguards: '<:Justiciar_legguards:455403545265700874>',
		justiciarFaceguard: '<:Justiciar_faceguard:455403544971968523>',
		ghraziRapier: '<:Ghrazi_rapier:455403545093472268>',
		justiciarChestguard: '<:Justiciar_chestguard:455403544854659093>',
		avernicDefenderHilt: '<:Avernic_defender_hilt:455403544900534272>'
	},
	// The GP value of the items
	priceMap: {
		pet: 0,
		scytheOfVitur: 497731251,
		sanguinestiStaff: 181861388,
		justiciarLegguards: 32752486,
		justiciarFaceguard: 40747460,
		ghraziRapier: 398134289,
		justiciarChestguard: 32933593,
		avernicDefenderHilt: 108223053
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
			if (this.roll(650)) loot.push(this.drops.pet);
			if (this.roll(40)) {
				const number = parseInt((Math.random() * 20) + 1);
				switch (true) {
					case number === 1:
						loot.push(this.drops.scytheOfVitur);
						break;
					case number <= 3:
						loot.push(this.drops.sanguinestiStaff);
						break;
					case number <= 5:
						loot.push(this.drops.ghraziRapier);
						break;
					case number <= 7:
						loot.push(this.drops.justiciarFaceguard);
						break;
					case number <= 9:
						loot.push(this.drops.justiciarLegguards);
						break;
					case number <= 11:
						loot.push(this.drops.justiciarChestguard);
						break;
					default:
						loot.push(this.drops.avernicDefenderHilt);
						break;
				}
			}
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
			if (this.roll(40)) {
				const number = parseInt((Math.random() * 20) + 1);
				switch (true) {
					case number === 1:
						loot.scytheOfVitur++;
						break;
					case number <= 3:
						loot.sanguinestiStaff++;
						break;
					case number <= 5:
						loot.ghraziRapier++;
						break;
					case number <= 7:
						loot.justiciarFaceguard++;
						break;
					case number <= 9:
						loot.justiciarLegguards++;
						break;
					case number <= 11:
						loot.justiciarChestguard++;
						break;
					default:
						loot.avernicDefenderHilt++;
						break;
				}
			}
		}
		for (const key in loot) {
			displayLoot.push(`**${this.drops[key]}**: ${loot[key].toLocaleString()} `);
			totalValue += this.priceMap[key] * loot[key];
		}
		displayLoot.push(`\n**Total Value:** ${totalValue.toLocaleString()} GP`);
		displayLoot.push(`**GP/HR** ${(totalValue / (quantity * 0.25)).toLocaleString()} GP`);
		displayLoot.push(`**Total Hours**: ${(quantity * 0.25).toLocaleString()}`);
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
				loot.push(`**Lil' Zik:** ${kc} KC ${drops.pet}`);
			}
			if (!this.roll(40)) continue;
			const number = parseInt((Math.random() * 20) + 1);
			switch (true) {
				case number === 1:
					if (!lootTrack.includes(drops.scytheOfVitur)) {
						loot.push(`**Scythe of Vitur:** ${kc} KC ${drops.scytheOfVitur}`);
						lootTrack.push(drops.scytheOfVitur);
					}
					break;
				case number <= 3:
					if (!lootTrack.includes(drops.sanguinestiStaff)) {
						loot.push(`**Sanguinesti Staff:** ${kc} KC ${drops.sanguinestiStaff}`);
						lootTrack.push(drops.sanguinestiStaff);
					}
					break;
				case number <= 5:
					if (!lootTrack.includes(drops.ghraziRapier)) {
						loot.push(`**Ghrazi Rapier:** ${kc} KC ${drops.ghraziRapier}`);
						lootTrack.push(drops.ghraziRapier);
					}
					break;
				case number <= 7:
					if (!lootTrack.includes(drops.justiciarFaceguard)) {
						loot.push(`**Justiciar Faceguard:** ${kc} KC ${drops.justiciarFaceguard}`);
						lootTrack.push(drops.justiciarFaceguard);
					}
					break;
				case number <= 9:
					if (!lootTrack.includes(drops.justiciarLegguards)) {
						loot.push(`**Justiciar Legguards:** ${kc} KC ${drops.justiciarLegguards}`);
						lootTrack.push(drops.justiciarLegguards);
					}
					break;
				case number <= 11:
					if (!lootTrack.includes(drops.justiciarChestguard)) {
						loot.push(`**Justiciar Chestguard** ${kc} KC ${drops.justiciarChestguard}`);
						lootTrack.push(drops.justiciarChestguard);
					}
					break;
				default:
					if (!lootTrack.includes(drops.avernicDefenderHilt)) {
						loot.push(`**Avernic Defender Hilt** ${kc} KC ${drops.avernicDefenderHilt}`);
						lootTrack.push(drops.avernicDefenderHilt);
					}
					break;
			}
		}
		return loot.join('\n');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = tob;

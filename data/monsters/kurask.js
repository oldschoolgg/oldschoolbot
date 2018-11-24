const kurask = {
	drops: {
		mysticRobe: '<:Mystic_robe_top_light:507040947171754006>',
		leafBladedSword: '<:Leafbladed_sword:507040947029409805>',
		leafBladedBattleaxe: '<:Leafbladed_battleaxe:507040947494715395>',
		kuraskHead: '<:Kurask_head:507040947478200323>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(512)) loot.push(this.drops.mysticRobe);
			if (this.roll(384)) loot.push(this.drops.leafBladedSword);
			if (this.roll(1026)) loot.push(this.drops.leafBladedBattleaxe);
			if (this.roll(3000)) loot.push(this.drops.kuraskHead);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = kurask;

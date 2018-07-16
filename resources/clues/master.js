const elite = {
	drops: {
		bloodhound: '<:Bloodhound:324127375602483212>',
		fancyTiara: '<:Fancy_tiara:468289923519086592>',
		thirdAgePickaxe: '<:3rd_age_pickaxe:468289922600665088>',
		thirdAgeAxe: '<:3rd_age_axe:468289922412052491>',
		ringOfCoins: '<:Ring_of_coins:468289924505010186>',
		bucketHelm: '<:Bucket_helm_g:468289922927820821>',
		misc: [
			'<:Obsidian_cape_r:468289924479582208>',
			'<:Half_moon_spectacles:468289923477274624>',
			'<:Ale_of_the_gods:468289922646933504>'
		],
		masks: [
			'<:Old_demon_mask:468289924248895489>',
			'<:Lesser_demon_mask:468289923384868885>',
			'<:Greater_demon_mask:468289923519086612>',
			'<:Black_demon_mask:468289922717974530>',
			'<:Jungle_demon_mask:468289923644915722>'
		],
		samuraiArmor: [
			'<:Samurai_boots:468289924622450689>',
			'<:Samurai_gloves:468289924282580993>',
			'<:Samurai_greaves:468289924836229130>',
			'<:Samurai_kasa:468289924735565828>',
			'<:Samurai_shirt:468289924630839327>'
		],
		mummyArmor: [
			'<:Mummys_body:468289923691315203>',
			'<:Mummys_feet:468289923993305108>',
			'<:Mummys_hands:468289925117378570>',
			'<:Mummys_head:468289924194631681>',
			'<:Mummys_legs:468289924215603220>'
		],
		ankouArmor: [
			'<:Ankou_gloves:468289922642477066>',
			'<:Ankou_mask:468289922692939776>',
			'<:Ankou_socks:468289922353332225>',
			'<:Ankou_top:468289922793734144>',
			'<:Ankous_leggings:468289922869231616>'
		],
		hoods: [
			'<:Arceuus_house_hood:468289922881552394>',
			'<:Hosidius_house_hood:468289923565486081>',
			'<:Lovakengj_house_hood:468289923913482260>',
			'<:Piscarilius_house_hood:468289924056088576>',
			'<:Shayzien_house_hood:468289925037686794>'
		],
		darkRobes: [
			'<:Boots_of_darkness:468289923145924608>',
			'<:Gloves_of_darkness:468289923145924620>',
			'<:Hood_of_darkness:468289924031053825>',
			'<:Robe_bottom_of_darkness:468289924190306305>',
			'<:Robe_top_of_darkness:468289924584439838>'
		],
		godswordKits: [
			'<:Zamorak_godsword_ornament_kit:468289924945281024>',
			'<:Bandos_godsword_ornament_kit:468289922793603073>',
			'<:Saradomin_godsword_ornament_kit:468289924823515136>',
			'<:Armadyl_godsword_ornament_kit:468289922932015104>'
		],
		kits: [
			'<:Occult_ornament_kit:468289923921739789>',
			'<:Torture_ornament_kit:468289924915920896>',
			'<:Dragon_defender_ornament_kit:468289923288399872>'
		]
	},
	open(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(140)) loot.push(this.drops.fancyTiara);
			if (this.roll(1000)) loot.push(this.drops.bloodhound);
			if (this.roll(20000)) loot.push(this.drops.thirdAgePickaxe);
			if (this.roll(20000)) loot.push(this.drops.thirdAgeAxe);
			if (this.roll(1180)) loot.push(this.drops.ringOfCoins);
			if (this.roll(1300)) loot.push(this.drops.bucketHelm);
			if (this.roll(28)) loot.push(this.rand(this.drops.masks));
			if (this.roll(28)) loot.push(this.rand(this.drops.samuraiArmor));
			if (this.roll(407)) loot.push(this.rand(this.drops.mummyArmor));
			if (this.roll(407)) loot.push(this.rand(this.drops.ankouArmor));
			if (this.roll(24)) loot.push(this.rand(this.drops.hoods));
			if (this.roll(28)) loot.push(this.rand(this.drops.darkRobes));
			if (this.roll(50)) loot.push(this.rand(this.drops.misc));
			if (this.roll(50)) loot.push(this.rand(this.drops.godswordKits));
			if (this.roll(50)) loot.push(this.rand(this.drops.kits));
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	},
	rand(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}
};

module.exports = elite;

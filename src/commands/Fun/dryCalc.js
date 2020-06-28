/* 
  Witty Switch Comments Pulled From:
  https://oldschool.runescape.wiki/w/Calculator:Dry_calc
*/
const { Command } = require('klasa');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Calculates the drop chance of getting an item within a set amount of kills.' ,
			usage: '<dropRate:int><kills:int>',
            usageDelim: ' '
		});
	}
	async run(msg,[dropRate,kills]) {
		function round(value, precision) {
			var multiplier = Math.pow(10, precision || 0);
			return Math.round(value * multiplier) / multiplier;
		}
        if (dropRate > 100000000 || kills > 100000000) throw "I can't process a number higher than 100 million! enneUni has already claimed the only uncut onyx!";
		if (dropRate < 1 || kills < 1) throw "I can't calculate with zeros. Go kill monsters, or update their drop values.";
		var noDropChance = Math.pow((1-(1/dropRate)),kills);
		var dropChance = 100*(1-noDropChance);
		var output = `${kills} monsters died for an item with a 1/${dropRate} (${round((100/dropRate),2)}%) drop rate!\nYou had a ${round(noDropChance*100,2)}% chance of not receiving the drop, and a ${round(dropChance,2)}% chance of receiving the item.`;
		switch (true){
			case kills == dropRate:
				output = `${output} An unenglightened being would say 'but 1/x over x kills means I should get it', but you know better now.`;
				break;
			case dropChance < 1:
				output = `${output} You are some sort of sentient water being you're so not-dry. How'd you even do this?**Splash!**`; 
				break;
			case dropChance < 8:
				output = `${output} You're a higher % water than a watermelon.`;
				break;
			case dropChance < 30:
				output = `${output} Only ironmen can be this lucky.`;
				break;
			case dropChance < 49:
				output = `${output} You're quite the lucker aren't you.`;
				break;
			case dropChance > 49 && dropChance < 51:
				output = `${output} A perfect mix of dry and undry, as all things should be.`;
				break;
			case dropChance < 73:
				break;
			case dropChance < 74:
				output = `${output} :rofl: :rofl: :rofl:`;
				break;
			case dropChance < 90:
				output = `${output} Oof`;
				break;
			case dropChance < 99:
				output = `${output} A skeleton is less dry than you.`;
				break;
			case dropChance > 99:
				output = `${output} You are so dry you have collapsed into the dry singularity. The dryularity, if you will.`;
				break;
		}
        return msg.send( output );
    }
};

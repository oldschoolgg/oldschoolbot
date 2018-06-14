class Monster {

	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}

}

module.exports.Monster = Monster;

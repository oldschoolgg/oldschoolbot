function Monster() {
	this.roll = function roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	};
}

module.exports = Monster;

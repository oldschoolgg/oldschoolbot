function roll(max) {
	return Math.floor(Math.random() * max + 1) === 1;
}

function cleanString(str) {
	return str.replace(/[^0-9a-zA-Z]/gi, '').toUpperCase();
}

function fmNum(num) {
	if (num) return num.toLocaleString();
}

function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function toTitleCase(str) {
	var splitStr = str.toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(' ');
}

const formatDuration = ms => {
	if (ms < 0) ms = -ms;
	const time = {
		day: Math.floor(ms / 86400000),
		hour: Math.floor(ms / 3600000) % 24,
		minute: Math.floor(ms / 60000) % 60
	};
	return Object.entries(time)
		.filter(val => val[1] !== 0)
		.map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
		.join(', ');
};

module.exports = {
	roll,
	cleanString,
	fmNum,
	rand,
	toTitleCase,
	formatDuration
};

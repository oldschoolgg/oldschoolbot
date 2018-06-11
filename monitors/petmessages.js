const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, { ignoreOthers: false });
	}

	async run(msg) {
		if (this.roll(100000) && msg.guild.configs.petchannel === msg.channel.id) {
			const pet = pets[Math.floor(Math.random() * pets.length)];
			return msg.send(`${msg.author} is extremely lucky and just got this pet: ${pet}`);
		} else { return null; }
	}

	async init() {
		if (!this.client.gateways.guilds.schema.has('petchannel')) {
			await this.client.gateways.guilds.schema.add('petchannel', { type: 'textchannel' });
		}
	}

};

const pets = [
	'<:Rocky:324127378647285771>',
	'<:Rock_golem:324127378429313026>',
	'<:Rift_guardian_fire:324127378588827648>',
	'<:Heron:324127376516841483>',
	'<:Giant_squirrel:324127376432824320>',
	'<:Beaver:324127375761604611>',
	'<:Baby_chinchompa_red:324127375539306497>'
];

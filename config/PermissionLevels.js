const { PermissionLevels } = require('klasa');

module.exports = new PermissionLevels()
	.add(0, () => true)
	.add(7,
		(message) => message.guild && message.member.permissions.has('ADMINISTRATOR'),
		{ fetch: true }
	)
	.add(9, (message) => message.author === message.client.owner, { break: true })
	.add(10, (message) => message.author === message.client.owner);

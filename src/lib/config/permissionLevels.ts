import { PermissionLevels, KlasaMessage } from 'klasa';
import { Permissions } from 'discord.js';

const permissionLevels = new PermissionLevels()
	.add(0, () => true)
	.add(
		6,
		(message: KlasaMessage) =>
			!!message.guild &&
			!!message.member &&
			message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS),
		{
			fetch: true
		}
	)
	.add(
		7,
		(message: KlasaMessage) =>
			!!message.guild &&
			!!message.member &&
			message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR),
		{
			fetch: true
		}
	)
	.add(9, (message: KlasaMessage) => message.author === message.client.owner, { break: true })
	.add(10, (message: KlasaMessage) => message.author === message.client.owner);

export default permissionLevels;

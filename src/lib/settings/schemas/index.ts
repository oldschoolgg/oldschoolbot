import initClientSchema from './ClientSchema';
import initGuildSchema from './GuildSchema';
import initUserSchema from './UserSchema';

export function initSchemas() {
	initClientSchema();
	initGuildSchema();
	initUserSchema();
}

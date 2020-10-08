import { KlasaClient, KlasaUser } from 'klasa';

export default function getActivityOfUser(client: KlasaClient, user: KlasaUser | string) {
	return client.pgBoss.minionIsBusy(typeof user === 'string' ? user : user.id);
}

import { EItem } from '@/EItem.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleOpenable } from '@/structures/SimpleOpenable.js';

const DossierTable = new LootTable({ limit: 1740 })
	.add('Contract of bloodied blows', 3, 260)
	.add('Contract of divine severance', 3, 260)
	.add('Contract of forfeit breath', 3, 260)
	.add('Contract of glyphic attenuation', 3, 260)
	.add('Contract of sensory clouding', 3, 260)
	.add('Chasm teleport scroll', [15, 18], 116)
	.add('Rite of vile transference', 1, 116)
	.add('Contract of familiar acquisition', 2, 65)
	.add('Contract of shard acquisition', 1, 39)
	.add('Contract of worm acquisition', 1, 39)
	.add('Contract of catalyst acquisition', 1, 39)
	.add('Contract of harmony acquisition', 1, 13)
	.add('Contract of oathplate acquisition', 1, 13);

export default new SimpleOpenable({
	id: EItem.DOSSIER,
	name: 'Dossier',
	aliases: ['dossier'],
	table: DossierTable
});

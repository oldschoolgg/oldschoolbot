import { MaterialBank } from '../src/lib/invention/MaterialBank';

describe('materialLoot', () => {
	test('materialLoot', () => {
		const materialLoot = new MaterialBank();
		materialLoot.add('armadyl', 10);
		materialLoot.add('bandos', 1);
		materialLoot.add('bandos', 5);
		expect(materialLoot.amount('bandos')).toEqual(6);
		expect(materialLoot.amount('armadyl')).toEqual(10);
	});
});

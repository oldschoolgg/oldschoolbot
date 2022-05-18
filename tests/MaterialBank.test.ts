import { MaterialBank } from '../src/lib/invention/MaterialBank';

describe('materialLoot', () => {
	test('materialLoot', () => {
		const materialLoot = new MaterialBank();
		materialLoot.add('armadyl', 10);
		materialLoot.add('bandos', 1);
		materialLoot.add('bandos', 5);
		materialLoot.add('corporeal', 100);
		materialLoot.remove('corporeal', 20);
		expect(materialLoot.amount('corporeal')).toEqual(80);
		materialLoot.remove(new MaterialBank().add('corporeal', 20));
		expect(materialLoot.amount('corporeal')).toEqual(60);
		expect(materialLoot.amount('bandos')).toEqual(6);
		expect(materialLoot.amount('armadyl')).toEqual(10);
	});
});

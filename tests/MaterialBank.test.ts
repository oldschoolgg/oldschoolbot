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
	test('has', () => {
		const materialLoot = new MaterialBank();
		materialLoot.add('armadyl', 10);
		materialLoot.add('bandos', 5);

		expect(materialLoot.has(new MaterialBank().add('armadyl', 10))).toEqual(true);
		expect(materialLoot.has(new MaterialBank().add('armadyl', 10).add('bandos', 5))).toEqual(true);
		expect(materialLoot.has(new MaterialBank().add('armadyl', 11))).toEqual(false);
		expect(materialLoot.has(new MaterialBank().add('armadyl', 10).add('bandos', 6))).toEqual(false);
	});
	test('fits', () => {
		const materialLoot = new MaterialBank();
		materialLoot.add('armadyl', 10);
		materialLoot.add('bandos', 5);

		expect(materialLoot.fits(new MaterialBank().add('armadyl', 10))).toEqual(1);
		expect(new MaterialBank().add('armadyl', 10).fits(materialLoot)).toEqual(0);
		expect(materialLoot.fits(new MaterialBank().add('armadyl', 1))).toEqual(10);
	});
});

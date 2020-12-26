import getOSItem from '../src/lib/util/getOSItem';
import { parseStringBank } from '../src/lib/util/parseStringBank';

const psb = parseStringBank;
test('parseStringBank', async () => {
	const quantities = [
		['5k', 5000],
		['1.5k', 1500],
		['1m', 1_000_000],
		['20', 20],
		['0', 0],
		['', 0]
	];

	for (const [input, output] of quantities) {
		expect(psb(`${input} twisted bow`)).toEqual([
			{ qty: output, item: getOSItem('Twisted bow') }
		]);
	}

	const output = psb(` 1 twisted bow, coal,  5k egg,  1b trout `);
	const expected = [
		{ qty: 1, item: getOSItem('Twisted bow') },
		{
			qty: 0,
			item: getOSItem('Coal')
		},
		{
			qty: 5000,
			item: getOSItem('Egg')
		},
		{
			qty: 1_000_000_000,
			item: getOSItem('Trout')
		}
	];
	expect(expected).toEqual(expect.arrayContaining(output));
	expect(output.length).toEqual(expected.length);
	for (let i = 0; i < output.length; i++) {
		let res = output[i];
		let exp = expected[i];
		expect(res.qty).toEqual(exp.qty);
		expect(res.item).toEqual(exp.item);
	}

	expect(psb('')).toEqual([]);
	expect(psb(' ')).toEqual([]);
});

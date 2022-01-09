import { resolveNameBank } from '../../util';
import { Createable } from '../createables';

export const tobCreatables: Createable[] = [
	{
		name: 'Scythe of vitur',
		inputItems: resolveNameBank({
			'Scythe of vitur (uncharged)': 1
		}),
		outputItems: resolveNameBank({
			'Scythe of vitur': 1
		})
	},
	{
		name: 'Sanguinesti staff',
		inputItems: resolveNameBank({
			'Sanguinesti staff (uncharged)': 1
		}),
		outputItems: resolveNameBank({
			'Sanguinesti staff': 1
		})
	},
	{
		name: 'Revert sanguinesti staff',
		inputItems: resolveNameBank({
			'Sanguinesti staff': 1
		}),
		outputItems: resolveNameBank({
			'Sanguinesti staff (uncharged)': 1
		})
	},
	{
		name: 'Revert scythe of vitur',
		inputItems: resolveNameBank({
			'Scythe of vitur': 1
		}),
		outputItems: resolveNameBank({
			'Scythe of vitur (uncharged)': 1
		})
	},
	{
		name: 'Holy scythe of vitur',
		inputItems: resolveNameBank({
			'Holy scythe of vitur (uncharged)': 1
		}),
		outputItems: resolveNameBank({
			'Holy scythe of vitur': 1
		})
	},
	{
		name: 'Revert holy scythe of vitur',
		inputItems: resolveNameBank({
			'Holy scythe of vitur': 1
		}),
		outputItems: resolveNameBank({
			'Holy scythe of vitur (uncharged)': 1
		})
	},
	{
		name: 'Revert holy scythe of vitur (uncharged)',
		inputItems: resolveNameBank({
			'Holy scythe of vitur (uncharged)': 1
		}),
		outputItems: resolveNameBank({
			'Scythe of vitur (uncharged)': 1,
			'Holy ornament kit': 1
		})
	},
	{
		name: 'Sanguine scythe of vitur',
		inputItems: resolveNameBank({
			'Sanguine scythe of vitur (uncharged)': 1
		}),
		outputItems: resolveNameBank({
			'Sanguine scythe of vitur': 1
		})
	},
	{
		name: 'Revert sanguine scythe of vitur',
		inputItems: resolveNameBank({
			'Sanguine scythe of vitur': 1
		}),
		outputItems: resolveNameBank({
			'Sanguine scythe of vitur (uncharged)': 1
		})
	},
	{
		name: 'Sanguine scythe of vitur (uncharged)',
		inputItems: resolveNameBank({
			'Scythe of vitur (uncharged)': 1,
			'Sanguine ornament kit': 1
		}),
		outputItems: resolveNameBank({
			'Sanguine scythe of vitur (uncharged)': 1
		})
	},
	{
		name: 'Revert sanguine scythe of vitur (uncharged)',
		inputItems: resolveNameBank({
			'Sanguine scythe of vitur (uncharged)': 1
		}),
		outputItems: resolveNameBank({
			'Scythe of vitur (uncharged)': 1,
			'Sanguine ornament kit': 1
		})
	},
	{
		name: 'Holy scythe of vitur (uncharged)',
		inputItems: resolveNameBank({
			'Scythe of vitur (uncharged)': 1,
			'Holy ornament kit': 1
		}),
		outputItems: resolveNameBank({
			'Holy scythe of vitur (uncharged)': 1
		})
	},
	{
		name: 'Holy sanguinesti staff (uncharged)',
		inputItems: resolveNameBank({
			'Sanguinesti staff (uncharged)': 1,
			'Holy ornament kit': 1
		}),
		outputItems: resolveNameBank({
			'Holy sanguinesti staff (uncharged)': 1
		})
	},
	{
		name: 'Revert holy sanguinesti staff (uncharged)',
		inputItems: resolveNameBank({
			'holy sanguinesti staff (uncharged)': 1
		}),
		outputItems: resolveNameBank({
			'Sanguinesti staff (uncharged)': 1,
			'Holy ornament kit': 1
		})
	},
	{
		name: 'Avernic defender',
		inputItems: resolveNameBank({
			'Dragon defender': 1,
			'Avernic defender hilt': 1
		}),
		outputItems: resolveNameBank({
			'Avernic defender': 1
		})
	},
	{
		name: 'Revert avernic defender',
		inputItems: resolveNameBank({
			'Avernic defender': 1
		}),
		outputItems: resolveNameBank({
			'Dragon defender': 1
		})
	},
	{
		name: 'Holy ghrazi rapier',
		inputItems: resolveNameBank({
			'Ghrazi rapier': 1,
			'Holy ornament kit': 1
		}),
		outputItems: resolveNameBank({
			'Holy ghrazi rapier': 1
		})
	},
	{
		name: 'Revert holy ghrazi rapier',
		inputItems: resolveNameBank({
			'Holy ghrazi rapier': 1,
			'Holy ornament kit': 1
		}),
		outputItems: resolveNameBank({
			'Ghrazi rapier': 1
		})
	}
];

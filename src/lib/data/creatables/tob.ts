import { Bank } from 'oldschooljs';

import type { Createable } from '../createables';

export const tobCreatables: Createable[] = [
	{
		name: 'Scythe of vitur',
		inputItems: new Bank({
			'Scythe of vitur (uncharged)': 1
		}),
		outputItems: new Bank({
			'Scythe of vitur': 1
		})
	},
	{
		name: 'Sanguinesti staff',
		inputItems: new Bank({
			'Sanguinesti staff (uncharged)': 1
		}),
		outputItems: new Bank({
			'Sanguinesti staff': 1
		})
	},
	{
		name: 'Holy sanguinesti staff',
		inputItems: new Bank({
			'Holy sanguinesti staff (uncharged)': 1
		}),
		outputItems: new Bank({
			'Holy sanguinesti staff': 1
		})
	},
	{
		name: 'Revert sanguinesti staff',
		inputItems: new Bank({
			'Sanguinesti staff': 1
		}),
		outputItems: new Bank({
			'Sanguinesti staff (uncharged)': 1
		})
	},
	{
		name: 'Revert holy sanguinesti staff',
		inputItems: new Bank({
			'Holy sanguinesti staff': 1
		}),
		outputItems: new Bank({
			'Holy sanguinesti staff (uncharged)': 1
		})
	},
	{
		name: 'Revert scythe of vitur',
		inputItems: new Bank({
			'Scythe of vitur': 1
		}),
		outputItems: new Bank({
			'Scythe of vitur (uncharged)': 1
		})
	},
	{
		name: 'Holy scythe of vitur',
		inputItems: new Bank({
			'Holy scythe of vitur (uncharged)': 1
		}),
		outputItems: new Bank({
			'Holy scythe of vitur': 1
		})
	},
	{
		name: 'Revert holy scythe of vitur',
		inputItems: new Bank({
			'Holy scythe of vitur': 1
		}),
		outputItems: new Bank({
			'Holy scythe of vitur (uncharged)': 1
		})
	},
	{
		name: 'Revert holy scythe of vitur (uncharged)',
		inputItems: new Bank({
			'Holy scythe of vitur (uncharged)': 1
		}),
		outputItems: new Bank({
			'Scythe of vitur (uncharged)': 1,
			'Holy ornament kit': 1
		})
	},
	{
		name: 'Sanguine scythe of vitur',
		inputItems: new Bank({
			'Sanguine scythe of vitur (uncharged)': 1
		}),
		outputItems: new Bank({
			'Sanguine scythe of vitur': 1
		})
	},
	{
		name: 'Revert sanguine scythe of vitur',
		inputItems: new Bank({
			'Sanguine scythe of vitur': 1
		}),
		outputItems: new Bank({
			'Sanguine scythe of vitur (uncharged)': 1
		})
	},
	{
		name: 'Sanguine scythe of vitur (uncharged)',
		inputItems: new Bank({
			'Scythe of vitur (uncharged)': 1,
			'Sanguine ornament kit': 1
		}),
		outputItems: new Bank({
			'Sanguine scythe of vitur (uncharged)': 1
		})
	},
	{
		name: 'Revert sanguine scythe of vitur (uncharged)',
		inputItems: new Bank({
			'Sanguine scythe of vitur (uncharged)': 1
		}),
		outputItems: new Bank({
			'Scythe of vitur (uncharged)': 1,
			'Sanguine ornament kit': 1
		})
	},
	{
		name: 'Holy scythe of vitur (uncharged)',
		inputItems: new Bank({
			'Scythe of vitur (uncharged)': 1,
			'Holy ornament kit': 1
		}),
		outputItems: new Bank({
			'Holy scythe of vitur (uncharged)': 1
		})
	},
	{
		name: 'Holy sanguinesti staff (uncharged)',
		inputItems: new Bank({
			'Sanguinesti staff (uncharged)': 1,
			'Holy ornament kit': 1
		}),
		outputItems: new Bank({
			'Holy sanguinesti staff (uncharged)': 1
		})
	},
	{
		name: 'Revert holy sanguinesti staff (uncharged)',
		inputItems: new Bank({
			'holy sanguinesti staff (uncharged)': 1
		}),
		outputItems: new Bank({
			'Sanguinesti staff (uncharged)': 1,
			'Holy ornament kit': 1
		})
	},
	{
		name: 'Avernic defender',
		inputItems: new Bank({
			'Dragon defender': 1,
			'Avernic defender hilt': 1
		}),
		outputItems: new Bank({
			'Avernic defender': 1
		})
	},
	{
		name: 'Revert avernic defender',
		inputItems: new Bank({
			'Avernic defender': 1
		}),
		outputItems: new Bank({
			'Dragon defender': 1
		})
	},
	{
		name: 'Holy ghrazi rapier',
		inputItems: new Bank({
			'Ghrazi rapier': 1,
			'Holy ornament kit': 1
		}),
		outputItems: new Bank({
			'Holy ghrazi rapier': 1
		})
	},
	{
		name: 'Revert holy ghrazi rapier',
		inputItems: new Bank({
			'Holy ghrazi rapier': 1
		}),
		outputItems: new Bank({
			'Ghrazi rapier': 1,
			'Holy ornament kit': 1
		})
	}
];

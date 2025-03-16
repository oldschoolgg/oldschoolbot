import { Bank } from 'oldschooljs';

import type { Createable } from '../createables';

export const sunMoonCreatables: Createable[] = [
    {
        name: 'Axe handle base',
        inputItems: new Bank().add('Dwarven bar').add('Volcanic shards'),
        outputItems: new Bank().add('Axe handle base')
    },
    {
        name: 'Axe handle',
        inputItems: new Bank()
            .add('Axe handle base')
            .add('Perfect chitin')
            .add('Ent hide', 10)
            .add('Athelas paste', 30),
        outputItems: new Bank().add('Axe handle')
    },
    {
        name: 'Axe of the high sungod (u)',
        inputItems: new Bank().add('Axe handle').add('Sun-god axe head'),
        outputItems: new Bank().add('Axe of the high sungod (u)')
    },
    {
        name: 'Axe of the high sungod',
        inputItems: new Bank().add('Axe of the high sungod (u)').add('Atomic energy', 2_000_000),
        outputItems: new Bank().add('Axe of the high sungod')
    },
    {
        name: 'Sun-God Axe',
        inputItems: new Bank()
            .add('Atomic energy', 1_000_000)
            .add('Elder logs', 100_000)
            .add('Axe of the high sungod'),
        outputItems: new Bank().add('Sun-god axe'),
    }
];

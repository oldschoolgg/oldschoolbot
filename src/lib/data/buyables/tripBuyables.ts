import { Bank } from 'oldschooljs';

import type { Buyable } from './buyables';

export const tripBuyables: Buyable[] = [
  {
    name: 'Copper ore',
    outputItems: new Bank().add('Copper ore'),
    gpCost: 4,
    quantityPerHour: 11000
  },
  {
    name: 'Tin ore',
    outputItems: new Bank().add('Tin ore'),
    gpCost: 4,
    quantityPerHour: 11000
  },
  {
    name: 'Iron ore',
    outputItems: new Bank().add('Iron ore'),
    gpCost: 25,
    quantityPerHour: 11000
  },
  {
    name: 'Mithril ore',
    outputItems: new Bank().add('Mithril ore'),
    gpCost: 243,
    quantityPerHour: 11000
  },
  {
    name: 'Silver ore',
    outputItems: new Bank().add('Silver ore'),
    gpCost: 112,
    quantityPerHour: 11000
  },
  {
    name: 'Gold ore',
    outputItems: new Bank().add('Gold ore'),
    gpCost: 225,
    quantityPerHour: 11000
  },
  {
    name: 'Coal',
    outputItems: new Bank().add('Coal'),
    gpCost: 67,
    quantityPerHour: 11000
  }
];

export default tripBuyables;

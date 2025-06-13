import { Bank } from 'oldschooljs';

import type { Buyable } from './buyables';

export const tripBuyables: Buyable[] = [
  {
    name: 'Arrow shaft',
    outputItems: new Bank().add('Arrow shaft'),
    gpCost: 1,
    quantityPerHour: 400_000,
    shopQuantity: 1000,
    changePer: 1
  },
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
  },
  {
    name: 'Blood rune',
    outputItems: new Bank().add('Blood rune'),
    gpCost: 400,
    quantityPerHour: 100_000,
    shopQuantity: 1000,
    changePer: 0.1
  },
  {
    name: 'Law rune',
    outputItems: new Bank().add('Law rune'),
    gpCost: 240,
    quantityPerHour: 100_000,
    shopQuantity: 1000,
    changePer: 0.1
  },
  {
    name: 'Soul rune',
    outputItems: new Bank().add('Soul rune'),
    gpCost: 300,
    quantityPerHour: 100_000,
    shopQuantity: 1000,
    changePer: 0.1
  },
  {
    name: 'Astral rune',
    outputItems: new Bank().add('Astral rune'),
    gpCost: 50,
    quantityPerHour: 100_000,
    shopQuantity: 1000,
    changePer: 0.1
  },
  {
    name: 'Death rune',
    outputItems: new Bank().add('Death rune'),
    gpCost: 180,
    quantityPerHour: 100_000,
    shopQuantity: 1000,
    changePer: 0.1
  },
  {
    name: 'Nature rune',
    outputItems: new Bank().add('Nature rune'),
    gpCost: 180,
    quantityPerHour: 100_000,
    shopQuantity: 1000,
    changePer: 0.1
  },
  {
    name: 'Chaos rune',
    outputItems: new Bank().add('Chaos rune'),
    gpCost: 90,
    quantityPerHour: 100_000,
    shopQuantity: 1000,
    changePer: 0.1
  }
];

export default tripBuyables;

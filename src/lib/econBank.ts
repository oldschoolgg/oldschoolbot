import { Bank } from 'oldschooljs';

import jsonEconBank from './econBank.json';

export const econBank = new Bank().add(jsonEconBank);

import { useRef } from 'react';

import { Bank } from '@/osrs/index.js';

export function useBank(initialBank?: Bank): Bank {
	const bankRef = useRef<Bank>(initialBank ?? new Bank());
	return bankRef.current;
}

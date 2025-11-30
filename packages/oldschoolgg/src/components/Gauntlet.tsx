import { useState } from 'react';

import { BankImage } from '@/components/BankImage/BankImage.js';
import { Button } from '@/components/ui/button.js';
import { LabelledSwitch } from '@/components/ui/LabelledSwitch.js';
import type { Bank } from '@/osrs/Bank.js';
import { Gauntlet } from '@/osrs/Gauntlet.js';

export const GauntletPage = () => {
	const [currentLoot, setLoot] = useState<Bank | null>(null);
	const [totalLoot, setTotalLoot] = useState<Bank | null>(null);
	const [corrupted, setCorrupted] = useState(false);
	const [kc, setKC] = useState(0);

	function doLoot() {
		const loot = Gauntlet({ died: false, type: corrupted ? 'corrupted' : 'normal' }) as any as Bank;
		setKC(kc + 1);
		setLoot(loot);
		setTotalLoot(loot.clone().add(totalLoot));
	}
	return (
		<div>
			<div className="mb-1 flex flex-col">
				<LabelledSwitch label="Corrupted" isChecked={corrupted} onCheckedChange={setCorrupted} />
				<div className="max-w-sm">
					<Button onClick={() => doLoot()}>{`Open ${corrupted ? 'Corrupted ' : ''}Gauntlet Chest`}</Button>
				</div>
			</div>
			<br />
			{currentLoot && totalLoot && (
				<div className="flex flex-col w-full max-w-full">
					<BankImage bank={currentLoot} title={`Loot`} showPrice={false} />
					<br />
					<BankImage bank={totalLoot} title={`Total Loot - ${kc} Chests`} showPrice={false} />
				</div>
			)}
		</div>
	);
};

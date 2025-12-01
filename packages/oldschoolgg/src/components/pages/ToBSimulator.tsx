import { useCallback, useState } from 'react';

import { BankImage } from '@/components/BankImage/BankImage.js';
import { Button } from '@/components/ui/button.js';
import { useBank } from '@/hooks/useBank.js';
import { TheatreOfBlood } from '@/osrs/TheatreOfBlood.js';

export const TOBSimulator = () => {
	const currentLoot = useBank();
	const totalLoot = useBank();
	const [kc, setKC] = useState(0);

	const doLoot = useCallback(() => {
		const loot = TheatreOfBlood.complete({
			hardMode: false,
			team: [
				{ id: '1', deaths: [] },
				{ id: '2', deaths: [] },
				{ id: '3', deaths: [] },
				{ id: '4', deaths: [] }
			]
		});
		setKC(kc + 1);
		currentLoot.clear().add(loot);
		totalLoot.add(loot);
	}, [kc, totalLoot]);

	return (
		<div>
			<Button onClick={doLoot}>Simulate ToB Raid</Button>

			<div className="flex flex-col w-full max-w-full">
				<div className="flex justify-around">
					<div className="w-6/12">
						<BankImage bank={currentLoot} title={`Loot`} showPrice={false} />
					</div>
				</div>
				<BankImage bank={totalLoot} title={`Total Loot - ${kc} KC`} showPrice={false} />
			</div>
		</div>
	);
};

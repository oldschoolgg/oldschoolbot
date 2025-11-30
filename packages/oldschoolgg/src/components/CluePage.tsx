import { useState } from 'react';

import { BankImage } from '@/components/BankImage/BankImage.js';
import { Button } from '@/components/ui/button.js';
import { Bank } from '@/osrs/Bank.js';
import type { ItemBank } from '@/osrs/types.ts';
import { toKMB } from '@/osrs/utils.js';
import { BeginnerCasket } from '../../../oldschooljs/src/simulation/clues/Beginner.js';
import { EasyCasket } from '../../../oldschooljs/src/simulation/clues/Easy.js';
import { EliteCasket } from '../../../oldschooljs/src/simulation/clues/Elite.js';
import { HardCasket } from '../../../oldschooljs/src/simulation/clues/Hard.js';
import { MasterCasket } from '../../../oldschooljs/src/simulation/clues/Master.js';
import { MediumCasket } from '../../../oldschooljs/src/simulation/clues/Medium.js';
import type LootTable from '../../../oldschooljs/src/structures/LootTable.js';

interface ClueTier {
	name: string;
	table: LootTable;
	casketImage: number;
}

const ClueTiers = [
	{
		name: 'Beginner',
		table: BeginnerCasket,
		casketImage: 23245
	},
	{
		name: 'Easy',
		table: EasyCasket,
		casketImage: 20543
	},
	{
		name: 'Medium',
		table: MediumCasket,
		casketImage: 20544
	},
	{
		name: 'Hard',
		table: HardCasket,
		casketImage: 20545
	},
	{
		name: 'Elite',
		table: EliteCasket,
		casketImage: 20546
	},
	{
		name: 'Master',
		table: MasterCasket,
		casketImage: 19836
	}
];

export function CluePage() {
	const [lastOpenedName, setLastOpenedName] = useState<string | null>(null);
	const [currentLoot, setCurrentLoot] = useState<ItemBank>({});
	const [quantity, setQuantity] = useState(1);

	const handleTierClick = (tier: ClueTier) => {
		setLastOpenedName(tier.name);
		const loot = tier.table.roll(quantity);
		setCurrentLoot(loot.toJSON());
	};

	return (
		<div>
			<div className="flex justify-around flex-col sm:flex-row">
				<div>
					<div className="flex w-full justify-around">
						{[1, 10, 100, 500].map(qty => (
							<Button
								key={qty}
								onClick={() => setQuantity(qty)}
								className={quantity === qty ? 'text-gold' : 'text-secondary'}
							>{`${qty}x`}</Button>
						))}
					</div>
					<div className="flex flex-row flex-wrap justify-center sm:flex-col gap-2 my-2">
						{ClueTiers.map(tier => (
							<div key={tier.name} className="w-5/12 sm:w-full select-none">
								<div onClick={() => handleTierClick(tier)}>
									<div className="flex flex-row p-4 bg-orange-300/10 hover:bg-orange-300/20 cursor-pointer rounded-lg">
										<div className="mr-3">
											<img
												src={`https://static.runelite.net/cache/item/icon/${tier.casketImage}.png`}
												alt=""
											/>
										</div>
										<div>
											<h4 className="font-medium">{tier.name}</h4>
											<p className="hidden sm:block text-xs text-secondary">
												Click to Open {quantity} {tier.name} Clue
												{quantity > 1 ? 's' : ''}
											</p>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="w-2/4" style={{ zoom: 1.1 }}>
					{Boolean(Object.keys(currentLoot).length) && (
						<BankImage
							showPrice={false}
							title={`Loot from ${quantity}x ${lastOpenedName} (Value: ${toKMB(new Bank(currentLoot).value())})`}
							bank={currentLoot}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

import { useState } from 'react';

import { BankImage } from '@/components/BankImage/BankImage.js';
import { Button } from '@/components/ui/button.js';
import { useBank } from '@/hooks/useBank.js';
import { Implings } from '@/osrs/index.js';

export const ImplingsSimulator = () => {
	const currentLoot = useBank();
	const totalLoot = useBank();
	const [lastOpenedName, setLastOpenedName] = useState<string | null>(null);
	const [openedCount, setOpenedCount] = useState<Record<string, number>>({});

	return (
		<div className="flex flex-col items-center gap-12">
			<Button
				onClick={() => {
					currentLoot.clear();
					totalLoot.clear();
					setLastOpenedName(null);
					setOpenedCount({});
				}}
				disabled={!totalLoot?.length}
			>
				Reset Loot
			</Button>

			<div className="flex flex-row max-w-2xl flex-wrap mx-auto gap-3">
				{Implings.map(_i => (
					<div
						key={_i.name}
						className="flex flex-col items-center justify-center relative cursor-pointer hover:bg-white/10 p-2 px-4"
						onClick={() => {
							const loot = _i.open();
							currentLoot.clear().add(loot);
							totalLoot.add(loot);
							setLastOpenedName(_i.name);
							setOpenedCount(prev => ({
								...prev,
								[_i.name]: (prev[_i.name] ?? 0) + 1
							}));
						}}
					>
						<img
							className="max-w-10 w-10"
							src={`https://cdn.oldschool.gg/icons/implings/${_i.name.split(' ')[0].toLowerCase()}.webp`}
						/>
						<p className="text-sm font-bold">{_i.name.replace(' impling', '')}</p>
					</div>
				))}
			</div>

			{currentLoot && totalLoot && (
				<div className="flex flex-col w-full max-w-full items-center">
					<div className="max-w-sm w-full">
						<BankImage bank={currentLoot} title={`Loot from ${lastOpenedName}`} showPrice={false} />
					</div>
					<br />
					<BankImage
						bank={totalLoot}
						title={`Total Loot From ${Object.entries(openedCount)
							.map(ent => `${ent[1]}x ${ent[0]}`)
							.join(' ')}`}
						showPrice={false}
					/>
				</div>
			)}
		</div>
	);
};

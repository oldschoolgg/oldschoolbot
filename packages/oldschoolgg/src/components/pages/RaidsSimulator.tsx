import { toKMB } from 'oldschooljs';
import { useCallback, useState } from 'react';

import { BankImage } from '@/components/BankImage/BankImage.js';
import { Button } from '@/components/ui/button.js';
import { Select } from '@/components/ui/Select.js';
import { ChambersOfXeric, type TeamMember } from '@/osrs/CoX.js';
import { Bank } from '@/osrs/index.js';

const RAID_TYPES = ['solo', 'team of 4'] as const;
type RaidType = (typeof RAID_TYPES)[number];

function makeRaidTeam(type: RaidType) {
	const team: TeamMember[] = [];
	const limit = type === 'solo' ? 1 : 4;
	for (let i = 0; i < limit; i++) {
		team.push({ personalPoints: 25_000, id: i.toString() });
	}
	return team;
}
interface Loot {
	loot: Bank;
	totalLoot: Bank;
	totalKC: number;
}

export const RaidsSimulatorPage = () => {
	const [type, setType] = useState<RaidType>('solo');
	const [loot, setLoot] = useState<Loot>({ loot: new Bank(), totalKC: 0, totalLoot: new Bank() });
	const [qty, setQty] = useState(1);
	const [points, setPoints] = useState(30_000);

	const team = makeRaidTeam(type);

	const handleRaidCompletion = useCallback(() => {
		const newLoot = new Bank();
		for (let i = 0; i < qty; i++) {
			const result = ChambersOfXeric.complete({
				team,
				challengeMode: false,
				timeToComplete: 1
			});
			newLoot.add(result['0']);
		}

		setLoot(prevLoot => {
			const newTotalLoot = prevLoot.totalLoot.clone();
			newTotalLoot.add(newLoot);
			return {
				loot: newLoot,
				totalKC: prevLoot.totalKC + qty,
				totalLoot: newTotalLoot
			};
		});
	}, [qty, team]);

	return (
		<div>
			<h1 className="text-3xl">Chambers of Xeric Simulator</h1>
			<p className="mb-5">
				Oldschool.gg's Raids/Chambers of Xeric simulator lets you simulate raids and see what loot your team
				would get, shown in a realistic image.
			</p>
			<div className="mt-8 flex flex-row justify-around flex-wrap">
				<div className="mb-4">
					<div className="my-4">
						<Select
							label="Team Size"
							value={type}
							options={RAID_TYPES.map(t => ({ label: t, value: t }))}
							onChange={value => {
								setType(value as RaidType);
								if (value === 'solo') setPoints(30_000);
								else setPoints(22_000);
							}}
						/>
						<br />
						<div>
							Points: <Button onClick={() => setPoints(Math.max(points - 1000, 1000))}>-</Button>
							<Button className={'hover:cursor-default'} onClick={() => {}}>
								{toKMB(points)}
							</Button>
							<Button onClick={() => setPoints(points + 1000)}>+</Button>
						</div>
						<br />
						<div>
							Kill Increment:{' '}
							{[1, 10, 100, 1000].map(i => (
								<Button key={i.toString()} name={i.toString()} onClick={() => setQty(i)}>
									{i}
								</Button>
							))}
						</div>
					</div>
					<Button onClick={handleRaidCompletion}>Complete Raid</Button>
					<Button
						onClick={() => {
							setLoot({ loot: new Bank(), totalKC: 0, totalLoot: new Bank() });
						}}
					>
						Reset
					</Button>
				</div>
			</div>

			<div>
				<BankImage
					showPrice={false}
					title={`Loot from ${qty}x Chambers of Xeric (Value: ${toKMB(loot.loot.value())})`}
					bank={loot.loot.toJSON()}
				/>

				<BankImage
					showPrice={false}
					title={`Total Loot from ${loot.totalKC}x Chambers of Xeric ${
						loot.totalKC >= 1 ? `(Average ${toKMB(loot.totalLoot.value() / loot.totalKC)} per raid)` : ''
					}`}
					bank={loot.totalLoot.toJSON()}
				/>
			</div>
		</div>
	);
};

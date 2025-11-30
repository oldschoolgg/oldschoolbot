import { useInterval } from '@mantine/hooks';
import { toTitleCase } from '@oldschoolgg/toolkit';
import type React from 'react';
import { useRef, useState } from 'react';

import { BankImage } from '@/components/BankImage/BankImage.js';
import { Modal } from '@/components/Modal/Modal.js';
import { Button } from '@/components/ui/button.js';
import { LabelledSwitch } from '@/components/ui/LabelledSwitch.js';
import { Bank } from '@/osrs/Bank.js';
import { Monsters } from '../../../oldschooljs/src/simulation/monsters/index.js';
import type { Monster } from '../../../oldschooljs/src/structures/Monster.js';

// @ts-expect-error
const sortedMonsters = Monsters.filter(mon => Boolean(mon.table))
	.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
	.array();

interface KillOptions {
	increment: number;
	autoKill: boolean;
}

const defaultKillOpts: KillOptions = {
	increment: 1,
	autoKill: false
};

export function getMonURL(id: number) {
	const effectiveID =
		{
			[Monsters.AbyssalSire.id]: 5889
		}[id] ?? id;

	return `/${effectiveID}.webp`;
}

const sortMethods = ['COMBAT LEVEL', 'ALPHABETICAL'] as const;
const sortFunctions = {
	ALPHABETICAL: (a: Monster, b: Monster) => a.name.localeCompare(b.name),
	'COMBAT LEVEL': (a: Monster, b: Monster) => (b.data?.combatLevel ?? 1) - (a.data?.combatLevel ?? 1)
} as const;

export const MonsterList = ({
	onClickItem,
	isOpen,
	setIsOpen,
	filter
}: {
	onClickItem: (monster: Monster) => void;
	isOpen: boolean;
	setIsOpen: any;
	filter?: (mon: Monster) => boolean;
}) => {
	const [search, setSearch] = useState('');
	const [sortMethod, setSortMethod] = useState(sortMethods[0]);
	if (!isOpen) return null;

	let monsters = sortedMonsters
		.filter(i => {
			if (search !== '') {
				return [i.name, ...i.aliases].some(str => str.toLowerCase().includes(search.toLowerCase()));
			}
			return true;
		})
		.sort(sortFunctions[sortMethod]);

	if (filter) {
		monsters = monsters.filter(filter);
	}

	return (
		<Modal title="Pick a Monster" isOpen={isOpen} onClose={() => setIsOpen(false)}>
			<div className="w-96">
				<div className="flex align-middle justify-around w-full flex-col items-start">
					<div className="mb-2">
						Search:{' '}
						<input
							autoFocus
							value={search}
							onChange={e => setSearch(e.target.value)}
							type="text"
							name="Search"
						/>
					</div>
					<div className="mb-2">
						Sort:{' '}
						<select
							style={{ marginBottom: 8 }}
							value={sortMethod}
							onChange={(e: any) => {
								setSortMethod(e.target.value);
							}}
						>
							{sortMethods.map(i => (
								<option value={i} key={i}>
									{toTitleCase(i)}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className="overflow-y-scroll overflow-x-visible max-h-96 h-96">
					{monsters.map(mon => (
						<div
							onClick={() => {
								onClickItem(mon);
								setIsOpen(false);
							}}
							key={mon.id}
							className="px-10 flex justify-between flex-row flex-nowrap items-center hover:bg-primary_dark hover:cursor-pointer"
						>
							<h6>{toTitleCase(mon.name)}</h6>
							<img
								style={{ maxWidth: 150, maxHeight: 150, padding: 15 }}
								height="100"
								alt=""
								src={getMonURL(mon.id)}
							/>
						</div>
					))}
				</div>
			</div>
		</Modal>
	);
};

export const LootSimulatorPage: React.FC = () => {
	const lootRef = useRef<Bank>(new Bank());
	const [currentKC, setCurrentKC] = useState(0);
	const [selMon, setSelMon] = useState<number | null>(null);
	const [killOpts, setKillOpts] = useState<KillOptions>(defaultKillOpts);
	const [monsterListOpen, setMonsterListOpen] = useState(false);
	const [showPrice, setShowPrices] = useState(false);

	const selectedMonster = selMon ? Monsters.get(selMon)! : Monsters.GeneralGraardor;

	function kill() {
		if (!selectedMonster) return;
		const newLoot = selectedMonster.kill(killOpts.increment, {});
		lootRef.current.add(newLoot);
		setCurrentKC(t => t + killOpts.increment);
	}

	useInterval(kill, killOpts.autoKill && !monsterListOpen ? 10 : 1000, {
		autoInvoke: false
	});

	return (
		<div>
			<div className="flex flex-row">
				<MonsterList
					onClickItem={mon => {
						setKillOpts({ ...killOpts, autoKill: false });
						setSelMon(mon.id);
						lootRef.current.clear();
						setCurrentKC(0);
					}}
					isOpen={monsterListOpen}
					setIsOpen={setMonsterListOpen}
				/>

				<div className="p-6 w-full h-full">
					<h1 className="text-3xl">Loot Simulator</h1>
					<p className="mb-5">
						If you like this and want to see more fun things made on the website, please consider supporting
						me on <a href="https://www.patreon.com/oldschoolgg">Patreon</a>.
					</p>
					<div className="flex flex-col flex-wrap justify-center items-center">
						<div className="flex flex-col sm:flex-row items-center justify-between max-w-lg">
							<div className="p-5">
								<div>
									<LabelledSwitch
										label="Auto Kill"
										isChecked={killOpts.autoKill}
										onCheckedChange={bool => setKillOpts({ ...killOpts, autoKill: bool })}
									/>
								</div>

								<div>
									<LabelledSwitch
										label="Show Prices"
										isChecked={showPrice}
										onCheckedChange={setShowPrices}
									/>
								</div>

								<div>
									Kill Increment:{' '}
									{[1, 10, 100, 1000].map(i => (
										<Button
											name={i.toString()}
											// textColor={killOpts.increment === i ? 'gold' : 'white'}
											className="bg-primary_main"
											onClick={() => {
												setKillOpts({
													...killOpts,
													increment: Math.max(1, i)
												});
											}}
										/>
									))}
								</div>
							</div>

							<div className="p-5 items-center flex flex-col">
								<p className="mb-2">{selectedMonster.name}</p>
								<img
									alt=""
									className="pb-5"
									height="auto"
									src={getMonURL(selectedMonster.id)}
									loading="lazy"
								/>
								<Button
									className="border border-gold"
									name="Pick Monster"
									onClick={e => {
										e.stopPropagation();
										setMonsterListOpen(true);
									}}
								/>
							</div>
						</div>
					</div>

					<div className="mt-5 flex justify-center">
						<Button
							className="bg-gold"
							onClick={kill}
							name={`Kill ${killOpts.increment} ${selectedMonster.name}`}
						/>

						<Button
							className="border border-gold text-gold"
							name="Reset Loot"
							onClick={() => {
								lootRef.current.clear();
								setCurrentKC(0);
							}}
						/>
					</div>

					<BankImage
						title={`Loot from ${currentKC.toLocaleString()}x ${selectedMonster.name}`}
						bank={lootRef.current}
						showPrice={showPrice}
					/>
				</div>
			</div>
		</div>
	);
};

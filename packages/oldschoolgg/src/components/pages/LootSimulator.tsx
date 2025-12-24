import { useInterval } from '@mantine/hooks';
import { toTitleCase } from '@oldschoolgg/toolkit';
import { useState } from 'react';

import { BankImage } from '@/components/BankImage/BankImage.js';
import { Button } from '@/components/ui/button.js';
import { LabelledSwitch } from '@/components/ui/LabelledSwitch.js';
import { Select } from '@/components/ui/Select.js';
import { useBank } from '@/hooks/useBank.js';
import { Monsters } from '@/osrs/index.js';

const sortedMonsters = Monsters.values
	.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
	.filter(_m => 'table' in _m && _m.table);

interface KillOptions {
	increment: number;
	autoKill: boolean;
}

const defaultKillOpts: KillOptions = {
	increment: 1,
	autoKill: false
};

export const LootSimulatorPage = () => {
	const bank = useBank();
	const [currentKC, setCurrentKC] = useState(0);
	const [selMon, setSelMon] = useState<number | null>(null);
	const [killOpts, setKillOpts] = useState<KillOptions>(defaultKillOpts);
	const [showPrice, setShowPrices] = useState(false);

	const selectedMonster = selMon ? Monsters.get(selMon)! : Monsters.GeneralGraardor;

	const monsterOptions = sortedMonsters.map(mon => ({
		label: toTitleCase(mon.name),
		value: mon.id.toString()
	}));

	function kill() {
		if (!selectedMonster) return;
		const newLoot = selectedMonster.kill(killOpts.increment, {});
		bank.add(newLoot);
		setCurrentKC(t => t + killOpts.increment);
	}

	const interval = useInterval(kill, 30, {
		autoInvoke: false
	});

	return (
		<div>
			<div className="flex flex-row">
				<div className="p-6 w-full h-full">
					<div className="flex flex-col items-center gap-6">
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full max-w-4xl">
							<div className="flex flex-col gap-4 flex-1">
								<div className="flex flex-col gap-3">
									<LabelledSwitch
										label="Auto Kill"
										isChecked={killOpts.autoKill}
										onCheckedChange={bool => {
											setKillOpts({ ...killOpts, autoKill: bool });
											interval.toggle();
										}}
									/>
									<LabelledSwitch
										label="Show Prices"
										isChecked={showPrice}
										onCheckedChange={setShowPrices}
									/>
								</div>

								<div className="flex flex-col gap-2">
									<label className="text-sm font-medium">Kill Increment</label>
									<div className="flex gap-2 flex-wrap">
										{[1, 10, 100, 1000].map(i => (
											<Button
												key={i}
												onClick={() => {
													setKillOpts({
														...killOpts,
														increment: Math.max(1, i)
													});
												}}
												variant={killOpts.increment === i ? 'default' : 'outline'}
											>
												{i}
											</Button>
										))}
									</div>
								</div>
							</div>

							<div className="flex flex-col items-center gap-3 p-4 rounded-lg min-w-64">
								<Select
									label="Monster"
									value={selectedMonster.id.toString()}
									options={monsterOptions}
									onChange={value => {
										setKillOpts({ ...killOpts, autoKill: false });
										setSelMon(Number(value));
										bank.clear();
										setCurrentKC(0);
									}}
								/>
							</div>
						</div>

						<div className="flex gap-3 flex-wrap justify-center">
							<Button className="bg-gold" onClick={kill}>
								Kill {killOpts.increment} {selectedMonster.name}
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									bank.clear();
									setCurrentKC(0);
								}}
							>
								Reset Loot
							</Button>
						</div>
					</div>

					<BankImage
						title={`Loot from ${currentKC.toLocaleString()}x ${selectedMonster.name}`}
						bank={bank}
						showPrice={showPrice}
					/>
				</div>
			</div>
		</div>
	);
};

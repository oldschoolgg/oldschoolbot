import { Component } from 'react';
import {Bank, BeginnerCasket, EasyCasket, EliteCasket, HardCasket, MasterCasket, MediumCasket, toKMB} from 'oldschooljs';

import type { ItemBank } from '@/osrs/types.ts';
import { SimpleCard } from '@/components/SimpleCard.tsx';
import { BankImage } from '@/components/BankImage/BankImage.tsx';
import { Button } from '@/components/Input/button.tsx';

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

interface CluePageState {
	fontLoaded: boolean;
	currentLoot: ItemBank;
	totalLoot: {
		Beginner: ItemBank;
		Easy: ItemBank;
		Medium: ItemBank;
		Hard: ItemBank;
		Elite: ItemBank;
		Master: ItemBank;
	};
	selectedLootDisplay: string;
	quantity: number;
}

export class CluePage extends Component<{}, CluePageState> {
	public state = {
		fontLoaded: false,
		currentLoot: {},
		totalLoot: {
			Beginner: {},
			Easy: {},
			Medium: {},
			Hard: {},
			Elite: {},
			Master: {}
		},
		selectedLootDisplay: 'Beginner',
		quantity: 1
	};

	public render() {
		return (
			<div>
				{/* <SEO
					title="Clue Simulator"
					keywords={['clue simulator', 'clue', 'medium', 'casket']}
					desc="Oldschool.gg's Clue Simulator lets you simulate opening clue caskets, to see what loot and items you would get, in a real image format."
				/> */}
				<div className="flex justify-around flex-col sm:flex-row">
					<div>
						<div className="flex w-full justify-around">
							{[1, 10, 100, 500].map((qty) => (
								<Button
									key={qty}
									onClick={() => this.setState({ quantity: qty })}
									className={
										this.state.quantity === qty ? 'text-gold' : 'text-secondary'
									}
								>{`${qty}x`}</Button>
							))}
						</div>
						<div className="flex flex-row flex-wrap justify-center sm:flex-col">
							{ClueTiers.map((tier) => (
								<div className="w-5/12 flex-shrink-0 sm:w-full select-none">
									<SimpleCard
										key={tier.name}
										onClick={() => {
											const loot = tier.table.roll(this.state.quantity);
											this.setState({
												currentLoot: loot.toJSON(),
												totalLoot: {
													...this.state.totalLoot,
													[tier.name]: new Bank(
														this.state.totalLoot[
															tier.name as keyof typeof this.state.totalLoot
														]
													).add(loot).toJSON()
												}
											});
										}}
									>
										<div className="flex flex-row">
											<div className="mr-3">
												<img
													src={`https://static.runelite.net/cache/item/icon/${tier.casketImage}.png`}
													alt=""
												/>
											</div>
											<div>
												<h4 className="text-gold font-medium">
													{tier.name}
												</h4>
												<p className="hidden sm:block text-xs text-secondary">
													Click to Open {this.state.quantity} {tier.name}{' '}
													Clue
													{this.state.quantity > 1 ? 's' : ''}
												</p>
											</div>
										</div>
									</SimpleCard>
								</div>
							))}
						</div>
					</div>
					<div className="w-2/4">
						{Boolean(Object.keys(this.state.currentLoot).length) && (
							<BankImage
								showPrice={false}
								title={`This loot is worth ${toKMB(
									new Bank(this.state.currentLoot).value()
								)}`}
								bank={this.state.currentLoot}
							/>
						)}
					</div>
				</div>
			</div>
		);
	}
}

import { writeFileSync } from 'node:fs';
import process from 'node:process';
import { Markdown, Tab, Tabs, toTitleCase } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';
import { omit } from 'remeda';

import '../src/lib/safeglobals';
import { ClueTiers } from '../src/lib/clues/clueTiers';
import { CombatAchievements } from '../src/lib/combat_achievements/combatAchievements';
import { COXMaxMageGear, COXMaxMeleeGear, COXMaxRangeGear, itemBoosts } from '../src/lib/data/cox';
import { wikiMonsters } from '../src/lib/minions/data/killableMonsters';
import { quests } from '../src/lib/minions/data/quests';
import { sorts } from '../src/lib/sorts';
import { clueGlobalBoosts, clueTierBoosts } from '../src/mahoji/commands/clue';
import { miningSnapshots } from './wiki/miningSnapshots.js';
import { updateAuthors } from './wiki/updateAuthors';
import { handleMarkdownEmbed } from './wiki/wikiScriptUtil';

function escapeItemName(str: string) {
	return str.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

const name = (id: number) => escapeItemName(Items.itemNameFromId(id)!);

function renderMonstersMarkdown() {
	const markdown = new Markdown();

	for (const monster of wikiMonsters) {
		const monstermd = new Markdown();
		monstermd.addLine(`## ${monster.name}`);

		const infoTab = new Tab().setTitle('Information').setContent(() => {
			const md = new Markdown();
			md.addLine(
				`- You can view the drops for this monster on the osrs wiki: [${monster.name}](https://oldschool.runescape.wiki/w/${encodeURIComponent(monster.name)})`
			);
			md.addLine(`- You can send your minion to kill this monster using: [[/k name:${monster.name}]]`);
			md.addLine(`- You can check your KC using: [[/minion kc name:${monster.name}]]`);
			md.addLine(`- You can check the KC leaderboard using: [[/lb kc monster\:${monster.name}]]`);
			md.addLine(`- You can check your collection log using: [[/cl name\\:${monster.name}]]`);
			md.addLine(`- You can check the collection log leaderboard using: [[/lb cl cl:${monster.name}]]`);

			if (monster.canBarrage) {
				md.addLine(`- You can barrage this monster [[/k name:${monster.name} method:barrage]]`);
			}
			if (monster.canCannon) {
				md.addLine(`- You can dwarf multicannon this monster [[/k name:${monster.name} method:cannon]]`);
			}
			if (monster.canChinning) {
				md.addLine(`- You can use chinchompas on this monster [[/k name:${monster.name} method:chinning]]`);
			}
			if (monster.slayerOnly) {
				md.addLine('- You can only kill this monster on a slayer task');
			}
			if (monster.existsInCatacombs) {
				md.addLine('- If on a slayer task, this monster can be killed in the catacombs');
			}
			if (monster.canBePked) {
				md.addLine(
					'- This monster is in the wilderness, and you can die to PKers when killing it. As such, you will always use your "wildy" gear setup when killing this monster.'
				);
			}

			return md.toString();
		});

		const costsTab = new Tab().setTitle('Costs').setContent(() => {
			const md = new Markdown();
			md.addLine(
				`- ${monster.healAmountNeeded ? `Requires food in your bank to kill, the amount needed is heavily reduced based on your gear/experience. ${monster.minimumHealAmount ? `You must have/use food that heals atleast ${monster.healAmountNeeded}HP` : ''}` : 'No Food Needed'}`
			);
			if (monster.itemCost) {
				const itemCostArray = Array.isArray(monster.itemCost) ? monster.itemCost : [monster.itemCost];
				const requiredItems = itemCostArray.filter(ic => !ic.optional);
				const optionalItems = itemCostArray.filter(ic => ic.optional);
				if (requiredItems.length > 0) {
					md.addLine('**Required Items**');
					for (const consumable of requiredItems) {
						const allConsumables = [consumable, ...[consumable.alternativeConsumables ?? []]].flat();
						md.addLine(
							`- ${allConsumables.map(c => `${c.itemCost.itemIDs.map(id => `[[${name(id)}]]`).join(' ')}`).join(' or ')}`
						);
					}
				}
				if (optionalItems.length > 0) {
					md.addLine('**Optional Items**');
					for (const consumable of optionalItems) {
						const allConsumables = [consumable, ...[consumable.alternativeConsumables ?? []]].flat();
						md.addLine(
							`- ${allConsumables.map(c => `${c.itemCost.itemIDs.map(id => `[[${name(id)}]]`).join(' ')}`).join(' or ')} (${consumable.boostPercent ?? 0}% boost)`
						);
					}
				}
			}

			if (monster.projectileUsage) {
				md.addLine('- Uses arrows/projectiles from your range gear');
			}

			return md.toString();
		});

		const requirementsTab = new Tab().setTitle('Requirements').setContent(() => {
			const requirementsMarkdown = new Markdown();

			if (monster.qpRequired) {
				requirementsMarkdown.addLine(`[[qp:${monster.qpRequired}]]`);
			}

			if (monster.levelRequirements) {
				requirementsMarkdown.addLine(
					Object.entries(monster.levelRequirements)
						.map(([skill, lvl]) => `[[${skill}:${lvl}]]`)
						.join(' ')
				);
			}

			if (monster.itemsRequired && monster.itemsRequired?.length > 0) {
				requirementsMarkdown.addLine('**Items Required**');
				for (const item of monster.itemsRequired) {
					if (Array.isArray(item)) {
						requirementsMarkdown.addLine(`- ${item.map(i => `[[${name(i)}]]`).join(' or ')}`);
					} else {
						requirementsMarkdown.addLine(`- [[${name(item)}]]`);
					}
				}
			}

			if (monster.requiredQuests) {
				requirementsMarkdown.addLine('**Required Quests**');
				for (const quest of monster.requiredQuests) {
					requirementsMarkdown.addLine(`- ${quests.find(q => q.id === quest)!.name}`);
				}
			}

			return requirementsMarkdown.toString();
		});

		const boostsTab = new Tab().setTitle('Boosts').setContent(() => {
			const boostsMarkdown = new Markdown();

			if (monster.itemInBankBoosts) {
				const bankBoosts = new Markdown();
				bankBoosts.setAccordion('Item in Bank Boosts');
				bankBoosts.addLine(
					'These boosts are applied from just being in your bank, and do not need to be equipped (but can also be equipped). The best boost you can use will automatically be used.'
				);
				for (const set of monster.itemInBankBoosts) {
					bankBoosts.addLine('You can have one of the following boosts:');
					for (const [item, boostPercent] of new Bank(set).items().sort(sorts.quantity)) {
						bankBoosts.addLine(`- ${boostPercent}% boost for [[${escapeItemName(item.name)}]]`);
					}
					bankBoosts.addLine('---');
				}
				boostsMarkdown.add(bankBoosts);
			}

			if (monster.equippedItemBoosts) {
				const bankBoosts = new Markdown();
				bankBoosts.setAccordion('Equipped Item Boosts');
				bankBoosts.addLine(
					'To get these boosts, you need the item equipped in the right setup. The best boost you can use will automatically be used.'
				);
				for (const set of monster.equippedItemBoosts) {
					bankBoosts.addLine(
						`${toTitleCase(set.gearSetup)} gear boosts${set.required ? ', it is **required** to have atleast one of these' : ''}:`
					);
					for (const item of set.items.sort((a, b) => b.boostPercent - a.boostPercent)) {
						bankBoosts.addLine(`- ${item.boostPercent}% boost for [[${name(item.itemID)}]]`);
					}
					bankBoosts.addLine('---');
				}
				boostsMarkdown.add(bankBoosts);
			}

			if (monster.degradeableItemUsage) {
				const bankBoosts = new Markdown();
				bankBoosts.setAccordion('Degradeable/Chargeable Item Boosts');
				bankBoosts.addLine('These boosts are for items which degrade or have charges.');
				for (const set of monster.degradeableItemUsage) {
					bankBoosts.addLine(
						`${toTitleCase(set.gearSetup)} gear boosts${set.required ? ', it is **required** to have atleast one of these' : ''}:`
					);
					for (const item of set.items.sort((a, b) => b.boostPercent - a.boostPercent)) {
						bankBoosts.addLine(`- ${item.boostPercent}% boost for [[${name(item.itemID)}]]`);
					}
					bankBoosts.addLine('---');
				}
				boostsMarkdown.add(bankBoosts);
			}

			if (monster.pohBoosts) {
				const pohBoosts = new Markdown();
				pohBoosts.setAccordion('POH Boosts');
				pohBoosts.addLine('These boosts are from having the right object built in your POH.');
				for (const [_pohSlot, boostGroup] of Object.entries(monster.pohBoosts).sort((a, b) =>
					a[0].localeCompare(b[0])
				)) {
					const mdSet = new Markdown();
					mdSet.addLine(`**${toTitleCase(_pohSlot)}**`);
					for (const [item, boostPercent] of Object.entries(boostGroup).sort((a, b) => b[1] - a[1])) {
						mdSet.addLine(`- ${boostPercent}% boost for ${item}`);
					}
					pohBoosts.add(mdSet);
				}
				pohBoosts.addLine('---');
				boostsMarkdown.add(pohBoosts);
			}

			return boostsMarkdown.toString();
		});
		const tabs = new Tabs([infoTab, costsTab, requirementsTab, boostsTab]);
		monstermd.add(tabs);
		monstermd.addLine('---');
		markdown.add(monstermd);
	}

	handleMarkdownEmbed('monsters', 'osb/monsters.mdx', markdown.toString());
}

function renderQuestsMarkdown() {
	const markdown = new Markdown();

	for (const quest of quests.sort((a, b) => a.name.localeCompare(b.name))) {
		const questMarkdown = new Markdown();
		questMarkdown.addLine(`## ${quest.name}`);
		questMarkdown.addLine(
			`You can send your minion to do this quest using [[/activities quest name:${quest.name}]]`
		);

		if (quest.skillReqs) {
			questMarkdown.addLine('### Skill Requirements');
			questMarkdown.addLine(
				`- Skills: ${Object.entries(quest.skillReqs)
					.map(([skill, lvl]) => `[[${skill}:${lvl}]]`)
					.join(' ')}`
			);
		}
		if (quest.ironmanSkillReqs) {
			questMarkdown.addLine('### Ironman Skill Requirements');
			questMarkdown.addLine(
				`${Object.entries(quest.ironmanSkillReqs)
					.map(([skill, lvl]) => `[[${skill}:${lvl}]]`)
					.join(' ')}`
			);
		}

		if (quest.prerequisitesQuests) {
			questMarkdown.addLine('### Required Quests');
			for (const req of quest.prerequisitesQuests) {
				questMarkdown.addLine(`- Must have finished ${quests.find(q => q.id === req)!.name}`);
			}
		}

		if (quest.combatLevelReq || quest.qpReq) {
			questMarkdown.addLine('### Other requirements');
			if (quest.combatLevelReq) {
				questMarkdown.addLine(`- Combat Level requirement: ${quest.combatLevelReq}`);
			}
			if (quest.qpReq) {
				questMarkdown.addLine(`- Quest Points requirement: [[qp:${quest.qpReq}]]`);
			}
		}

		if (quest.rewards) {
			questMarkdown.addLine('### Item Rewards');
			questMarkdown.addLine(
				quest.rewards
					.items()
					.map(([item]) => `[[${item.id}]]`)
					.join(' ')
			);
		}
		if (quest.skillsRewards) {
			questMarkdown.addLine('### XP Rewards');
			questMarkdown.addLine(
				Object.entries(quest.skillsRewards)
					.map(([skill, xp]) => `[[${skill}:${xp.toLocaleString()}]]`)
					.join(' ')
			);
		}

		markdown.add(questMarkdown);
	}

	handleMarkdownEmbed('quests', 'osb/quests.mdx', markdown.toString());
}

function rendeCoxMarkdown() {
	const markdown = new Markdown();

	markdown.addLine('## Gear');
	markdown.addLine('This is the best-in-slot gear you should use for CoX, substitute the next best items you have. ');
	for (const gear of [
		['mage', 'Magic Damage', COXMaxMageGear],
		['range', 'Ranged Strength', COXMaxRangeGear],
		['melee', 'Melee Strength', COXMaxMeleeGear]
	] as const) {
		markdown.addLine(`### ${toTitleCase(gear[0])}`);
		markdown.addLine(`For ${gear[0]}, use these items, or the next best '${gear[1]}' gear you have:`);
		markdown.addLine(
			`- ${gear[2]
				.allItems(false)
				.map(id => `[[${id}]]`)
				.join(' ')}`
		);
	}

	markdown.addLine('## Boosts');
	markdown.addLine(`Higher Kc makes raids faster. Here is the maximum kc that will give a boost:

| Difficulty | Solo Kc | Mass Kc |
| ---------- | ------- | ------- |
| Normal     | 250     | 400     |
| Challenge  | 75      | 100     |

`);
	for (const boostSet of itemBoosts) {
		markdown.addLine(
			`- ${boostSet
				.map(boost => {
					const messages: string[] = [];
					if (!boost.mustBeEquipped) {
						messages.push('Works from bank');
					}
					if (boost.mustBeCharged) {
						messages.push('Must be charged');
					}
					const msgStr = messages.length > 0 ? ` (${messages.join(', ')})` : '';
					return `${boost.boost}% boost for [[${boost.item.name}]]${msgStr}`;
				})
				.join(' or ')}`
		);
	}

	handleMarkdownEmbed('cox', 'osb/Raids/cox.mdx', markdown.toString());
}

function clueBoosts() {
	const markdown = new Markdown();

	markdown.addLine('### Global Boosts');
	markdown.add('These boosts apply to all clues.');
	for (const x of clueGlobalBoosts) {
		markdown.addLine(`- ${x.boost}`);
	}
	markdown.addLine('- You get a boost for having relevant stash units filled');
	markdown.addLine('- For Hard/Elite/Master, you get a boost for your attack/strength/ranged levels being higher');

	const clueTierBoostsEntries = Object.entries(clueTierBoosts);
	for (const clueTier of ClueTiers) {
		markdown.addLine(`### ${clueTier.name} Clues Boosts`);
		const entry = clueTierBoostsEntries.find(([key]) => key === clueTier.name)!;
		for (const boost of entry[1]) {
			markdown.addLine(`- ${boost.boost}`);
		}
	}

	handleMarkdownEmbed('clueboosts', 'osb/clues.mdx', markdown.toString());
}

function renderCombatAchievementsFile() {
	const finalJSON: any = {};
	for (const [tier, data] of Object.entries(CombatAchievements)) {
		finalJSON[tier] = {
			...omit(data, ['staticRewards', 'length']),
			tasks: data.tasks
				.map(t => {
					return {
						...t,
						requirements: undefined
					};
				})
				.sort((a, b) => a.id - b.id)
		};
	}
	writeFileSync('data/combat_achievements.json', JSON.stringify(finalJSON, null, 4));
}

async function wiki() {
	renderCombatAchievementsFile();
	renderQuestsMarkdown();
	rendeCoxMarkdown();
	clueBoosts();
	renderMonstersMarkdown();
	await updateAuthors();
	miningSnapshots();
	process.exit(0);
}

wiki();

import { Monsters } from 'oldschooljs';

import { Time } from './constants';

const killableMonsters = [
	{
		id: Monsters.Barrows.id,
		name: Monsters.Barrows.name,
		aliases: [],
		timeToFinish: Time.Minute * 4.15,
		table: Monsters.Barrows,
		emoji: '<:Dharoks_helm:403038864199122947>'
	},
	{
		id: Monsters.DagannothPrime.id,
		name: Monsters.DagannothPrime.name,
		aliases: ['prime'],
		timeToFinish: Time.Minute * 2.1,
		table: Monsters.DagannothPrime,
		emoji: '<:Pet_dagannoth_prime:324127376877289474>'
	},
	{
		id: Monsters.DagannothRex.id,
		name: Monsters.DagannothRex.name,
		aliases: ['rex'],
		timeToFinish: Time.Minute * 2.1,
		table: Monsters.DagannothRex,
		emoji: '<:Pet_dagannoth_rex:324127377091330049>'
	},
	{
		id: Monsters.DagannothSupreme.id,
		name: Monsters.DagannothSupreme.name,
		aliases: ['supreme'],
		timeToFinish: Time.Minute * 2,
		table: Monsters.DagannothSupreme,
		emoji: '<:Pet_dagannoth_supreme:324127377066164245>'
	},
	{
		id: Monsters.Cerberus.id,
		name: Monsters.Cerberus.name,
		aliases: ['cerb'],
		timeToFinish: Time.Minute * 2.35,
		table: Monsters.Cerberus,
		emoji: '<:Hellpuppy:324127376185491458>'
	},
	{
		id: Monsters.GiantMole.id,
		name: Monsters.GiantMole.name,
		aliases: ['mole'],
		timeToFinish: Time.Minute * 1.6,
		table: Monsters.GiantMole,
		emoji: '<:Baby_mole:324127375858204672>'
	},
	{
		id: Monsters.Vorkath.id,
		name: Monsters.Vorkath.name,
		aliases: ['vork'],
		timeToFinish: Time.Minute * 2.8,
		table: Monsters.Vorkath,
		emoji: '<:Vorki:400713309252222977>'
	},
	{
		id: Monsters.Zulrah.id,
		name: Monsters.Zulrah.name,
		aliases: ['snek', 'zul'],
		timeToFinish: Time.Minute * 2.8,
		table: Monsters.Zulrah,
		emoji: '<:Pet_snakeling:324127377816944642>'
	},
	{
		id: Monsters.GeneralGraardor.id,
		name: Monsters.GeneralGraardor.name,
		aliases: ['graardor', 'bandos', 'general'],
		timeToFinish: Time.Minute * 4.8,
		table: Monsters.GeneralGraardor,
		emoji: '<:Pet_general_graardor:324127377376673792>'
	},
	{
		id: Monsters.CommanderZilyana.id,
		name: Monsters.CommanderZilyana.name,
		aliases: ['sara', 'zily', 'saradomin', 'zilyana'],
		timeToFinish: Time.Minute * 4.8,
		table: Monsters.CommanderZilyana,
		emoji: '<:Pet_zilyana:324127378248957952>'
	},
	{
		id: Monsters.Kreearra.id,
		name: Monsters.Kreearra.name,
		aliases: ['arma', 'armadyl', 'kree'],
		timeToFinish: Time.Minute * 4.8,
		table: Monsters.Kreearra,
		emoji: '<:Pet_kreearra:324127377305239555>'
	},
	{
		id: Monsters.KrilTsutsaroth.id,
		name: Monsters.KrilTsutsaroth.name,
		aliases: ['kril', 'zammy', 'zamorak'],
		timeToFinish: Time.Minute * 4.8,
		table: Monsters.KrilTsutsaroth,
		emoji: '<:Pet_kril_tsutsaroth:324127377527406594>'
	},
	{
		id: Monsters.Man.id,
		name: Monsters.Man.name,
		aliases: ['men'],
		timeToFinish: Time.Second * 4.4,
		table: Monsters.Man,
		emoji: '🧍‍♂️'
	},
	{
		id: Monsters.Woman.id,
		name: Monsters.Woman.name,
		aliases: ['gril', 'women'],
		timeToFinish: Time.Second * 4.4,
		table: Monsters.Woman,
		emoji: '🧍‍♀️'
	},
	{
		id: Monsters.Goblin.id,
		name: Monsters.Goblin.name,
		aliases: ['goblin'],
		timeToFinish: Time.Second * 4.4,
		table: Monsters.Goblin,
		emoji: ''
	},
	{
		id: Monsters.Guard.id,
		name: Monsters.Guard.name,
		aliases: ['guards'],
		timeToFinish: Time.Second * 7.4,
		table: Monsters.Guard,
		emoji: ''
	}
];

export default killableMonsters;

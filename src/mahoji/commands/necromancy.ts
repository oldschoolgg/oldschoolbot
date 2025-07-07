// import { type CommandRunOptions, Table } from '@oldschoolgg/toolkit';
// import { ApplicationCommandOptionType } from 'discord.js';
// import { Time, reduceNumByPercent } from 'e';
// import { Bank, type ItemBank } from 'oldschooljs';

// import type { OSBMahojiCommand } from '../lib/util';

// export const necromancyCommand: OSBMahojiCommand = {
//     name: 'necromancy',
//     description: 'The necromancy skill.',
//     options: [
//         {
//             name: 'tools',
//             description: 'Various other tools and commands.',
//             type: ApplicationCommandOptionType.Subcommand,
//             options: [
//                 {
//                     type: ApplicationCommandOptionType.String,
//                     name: 'command',
//                     description: 'The command/tool you want to run.',
//                     required: true,
//                     choices: [
//                         {
//                             name: 'Material Groups',
//                             value: 'groups'
//                         },
//                         {
//                             name: 'Items Disassembled',
//                             value: 'items_disassembled'
//                         },
//                         {
//                             name: 'Materials Researched',
//                             value: 'materials_researched'
//                         },
//                         {
//                             name: 'Unlocked Blueprints/Inventions',
//                             value: 'unlocked_blueprints'
//                         },
//                         {
//                             name: 'XP Stats',
//                             value: 'xp'
//                         }
//                     ]
//                 }
//             ]
//         },
//         {
//             name: 'details',
//             description: 'See details and information on an Invention.',
//             type: ApplicationCommandOptionType.Subcommand,
//             options: [
//                 {
//                     type: ApplicationCommandOptionType.String,
//                     name: 'necromancy',
//                     description: 'The necromancy you want to check.',
//                     required: true,
//                     autocomplete: async value => {
//                         return Inventions.filter(i =>
//                             !value ? true : i.name.toLowerCase().includes(value.toLowerCase())
//                         )
//                             .map(i => ({ name: i.name, value: i.name }))
//                             .sort((a, b) => a.name.localeCompare(b.name));
//                     }
//                 }
//             ]
//         },
//     ],
//     run: async ({
//         userID,
//         options,
//         channelID,
//         interaction
//     }: CommandRunOptions<{
//         disassemble?: { name: string; quantity?: string };
//         research?: { material: MaterialType; quantity?: number };
//         invent?: { name: string; quantity?: number };
//         group?: { group: string };
//         materials?: {};
//         tools?: {
//             command: 'groups' | 'items_disassembled' | 'materials_researched' | 'unlocked_blueprints' | 'xp';
//         };
//         details?: { necromancy: string };
//     }>) => {
//         const user = await mUserFetch(userID);

//         return 'Invalid command.';
//     }
// };

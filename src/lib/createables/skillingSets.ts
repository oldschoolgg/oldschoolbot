import itemID from '../util/itemID';
import { Bank } from '../types';

interface Createable {
	name: string;
	outputItems: Bank;
	inputItems: Bank;
	smithingLevel?: number;
	addOutputToCollectionLog?: boolean;
	cantHaveItems: Bank;
	firemakingLevel?: number;
	craftingLevel?: number;
	prayerLevel?: number;
}
const SkillingSets: Createable[] = [
	{
		name: 'Graceful',
		inputItems: {
			[itemID('Mark of grace')]: 260
		},
		outputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1
		},
		cantHaveItems: {},
		addOutputToCollectionLog: true
	},
	{
		name: 'Graceful hood',
		inputItems: {
			[itemID('Mark of grace')]: 35
		},
		outputItems: {
			[itemID('Graceful hood')]: 1
		},
		cantHaveItems: {},
		addOutputToCollectionLog: true
	},
	{
		name: 'Graceful top',
		inputItems: {
			[itemID('Mark of grace')]: 55
		},
		outputItems: {
			[itemID('Graceful top')]: 1
		},
		cantHaveItems: {},
		addOutputToCollectionLog: true
	},
	{
		name: 'Graceful legs',
		inputItems: {
			[itemID('Mark of grace')]: 60
		},
		outputItems: {
			[itemID('Graceful legs')]: 1
		},
		cantHaveItems: {},
		addOutputToCollectionLog: true
	},
	{
		name: 'Graceful gloves',
		inputItems: {
			[itemID('Mark of grace')]: 30
		},
		outputItems: {
			[itemID('Graceful gloves')]: 1
		},
		cantHaveItems: {},
		addOutputToCollectionLog: true
	},
	{
		name: 'Graceful boots',
		inputItems: {
			[itemID('Mark of grace')]: 40
		},
		outputItems: {
			[itemID('Graceful boots')]: 1
		},
		cantHaveItems: {},
		addOutputToCollectionLog: true
	},
	{
		name: 'Graceful cape',
		inputItems: {
			[itemID('Mark of grace')]: 40
		},
		outputItems: {
			[itemID('Graceful cape')]: 1
		},
		cantHaveItems: {},
		addOutputToCollectionLog: true
	},
	/**
	 * Prospector outfit
	 */
	{
		name: 'Prospector helmet',
		addOutputToCollectionLog: true,
		outputItems: {
			[itemID('Prospector helmet')]: 1
		},
		inputItems: {
			[itemID('Golden nugget')]: 40
		},
		cantHaveItems: {}
	},
	{
		name: 'Prospector jacket',
		addOutputToCollectionLog: true,
		outputItems: {
			[itemID('Prospector jacket')]: 1
		},
		inputItems: {
			[itemID('Golden nugget')]: 60
		},
		cantHaveItems: {}
	},
	{
		name: 'Prospector legs',
		addOutputToCollectionLog: true,
		outputItems: {
			[itemID('Prospector legs')]: 1
		},
		inputItems: {
			[itemID('Golden nugget')]: 50
		},
		cantHaveItems: {}
	},
	{
		name: 'Prospector boots',
		addOutputToCollectionLog: true,
		outputItems: {
			[itemID('Prospector boots')]: 1
		},
		inputItems: {
			[itemID('Golden nugget')]: 30
		},
		cantHaveItems: {}
	},
	{
		name: 'Mining gloves',
		addOutputToCollectionLog: true,
		outputItems: {
			[itemID('Mining gloves')]: 1
		},
		inputItems: {
			[itemID('Unidentified minerals')]: 60
		},
		cantHaveItems: {}
	},
	{
		name: 'Superior mining gloves',
		addOutputToCollectionLog: true,
		outputItems: {
			[itemID('Superior mining gloves')]: 1
		},
		inputItems: {
			[itemID('Unidentified minerals')]: 120
		},
		cantHaveItems: {}
	},
	{
		name: 'Expert mining gloves',
		addOutputToCollectionLog: true,
		outputItems: {
			[itemID('Expert mining gloves')]: 1
		},
		inputItems: {
			[itemID('Superior mining gloves')]: 1,
			[itemID('Mining gloves')]: 1,
			[itemID('Unidentified minerals')]: 60
		},
		cantHaveItems: {}
	}
];

export default SkillingSets;

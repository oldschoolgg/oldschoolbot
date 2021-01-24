import { Creature } from '../../../types';
import birdSnaringCreatures from './birdSnaring';
import boxTrappingCreatures from './boxTrapping';
import butterflyNettingCreatures from './butterflyNetting';
import deadfallTrappingCreatures from './deadfallTrapping';
import falconryCreatures from './falconry';
import magicBoxTrappingCreatures from './magicBoxTrapping';
import netTrappingCreatures from './netTrapping';
import pitfallTrappingCreatures from './pitfallTrapping';
import trackingCreatures from './tracking';

const creatures: Creature[] = [
	...birdSnaringCreatures,
	...boxTrappingCreatures,
	...butterflyNettingCreatures,
	...deadfallTrappingCreatures,
	...falconryCreatures,
	...magicBoxTrappingCreatures,
	...netTrappingCreatures,
	...pitfallTrappingCreatures,
	...trackingCreatures
];

export default creatures;

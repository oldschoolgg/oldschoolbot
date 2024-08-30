import getOSItem from "../../../../lib/util/getOSItem";

export const dragonHunterWeapons =  [
{
item: getOSItem('Dragon hunter lance'),
attackStyle: 'melee',
boost: 15
},
{
item: getOSItem('Dragon hunter crossbow'),
attackStyle: 'ranged',
boost: 15
}
] as const;

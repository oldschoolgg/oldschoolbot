import { GearSetupTypes } from './../../gear/types';
import { SkillsEnum } from './../../skilling/types';
import { KlasaUser } from 'klasa';
import { UserSettings } from '../../settings/types/UserSettings';
import { KillableMonster } from '../types';
import { sumOfSetupStats } from '../../gear/functions/sumOfSetupStats';
import resolveGearTypeSetting from '../../gear/functions/resolveGearTypeSetting';

export default function meleeCalculator(monster: KillableMonster, user: KlasaUser) {
    // https://oldschool.runescape.wiki/w/Damage_per_second/Melee as source.
    const combatStyle = user.settings.get(UserSettings.Minion.MeleeCombatStyle);
//    const mon = killableMonsters.find(mon => mon.id === monsterID)!;
    const meleeWeapon = user.equippedWeapon(GearSetupTypes.Melee);
    const gearStats = sumOfSetupStats(user.settings.get(resolveGearTypeSetting(GearSetupTypes.Melee)));

    //Calculate effective strength level
    let effectiveStrLvl = Math.round(user.skillLevel(SkillsEnum.Strength) /*+ Strength boost: potions etc) * prayerbonus */) + 8;
    let attackStyle = '';
    let combatType = '';
    for (let stance of meleeWeapon!.weapon!.stances) {
        if (stance.combat_style.toLowerCase() === combatStyle) {
            attackStyle = stance.attack_style;
            combatType = stance.attack_type;
            break;
        }
    }

    if (attackStyle === 'aggresive') {
        effectiveStrLvl += 3;
    }
    if (attackStyle === 'controlled') {
        effectiveStrLvl += 1;
    }

    /* if wearing full melee voif
    effectiveStrLvl *= 1.1;
    */

    //Calculate max hit
    let maxHit = Math.round(((effectiveStrLvl * (gearStats.melee_strength + 64)) + 320) / 640);

    /* if wearing black mask / slayer helm or salve amulet DOSEN'T STACK
    maxHit *= 7/6
    */

    //Calculate effective attack level
    let effectiveAttackLvl = Math.round(user.skillLevel(SkillsEnum.Attack) /*+ Attack boost: potions etc) * prayerbonus */) + 8;

    if (attackStyle === 'aggresive') {
        effectiveAttackLvl += 3;
    }
    if (attackStyle === 'controlled') {
        effectiveAttackLvl += 1;
    }

    /* if wearing full melee voif
    effectiveAttackLvl *= 1.1;
    */

    //Calculate attack roll
    let attackRoll = 0;

    switch(combatType.toLowerCase()) {
        case 'stab':
            attackRoll = effectiveAttackLvl * (gearStats.attack_stab + 64);
          break;
        case 'slash':
            attackRoll = effectiveAttackLvl * (gearStats.attack_slash + 64);
           break;
        case 'crush':
            attackRoll = effectiveAttackLvl * (gearStats.attack_crush + 64);
           break;
      }

    /* if wearing black mask / slayer helm or salve amulet vs undead monster. DOSEN'T STACK
    attackRoll *= 7/6
    */

    attackRoll = Math.round(attackRoll);

    //Calculate Defence roll
    let defenceRoll = 0;

    switch(combatType.toLowerCase()) {
        case 'stab':
            defenceRoll *= (gearStats.attack_stab + 64);
          break;
        case 'slash':
            defenceRoll *= (gearStats.attack_slash + 64);
           break;
        case 'crush':
            defenceRoll *= (gearStats.attack_crush + 64);
           break;
      }

}
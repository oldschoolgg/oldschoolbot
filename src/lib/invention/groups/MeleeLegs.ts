import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const MeleeLegs: DisassemblySourceGroup = {
	name: 'MeleeLegs',
	items: [{ item: i("Black platelegs"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 8 }, ] } },{ item: i("Black platelegs (g)"), lvl: 25 },{ item: i("Black platelegs (t)"), lvl: 25 },{ item: i("Black plateskirt"), lvl: 25 },{ item: i("Black plateskirt (g)"), lvl: 25 },{ item: i("Black plateskirt (t)"), lvl: 25 },{ item: i("White platelegs"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 8 }, ] } },{ item: i("White plateskirt"), lvl: 25, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 8 }, ] } },{ item: i("Proselyte cuisse"), lvl: 30 },{ item: i("Proselyte tasset"), lvl: 30 },{ item: i("Bandos robe legs"), lvl: 40, special: { always: true, parts: [{ type: "fortunate", chance: 100, amount: 8 }, ] } },{ item: i("Rock-shell legs"), lvl: 50 },{ item: i("Rune platelegs (g)"), lvl: 50 },{ item: i("Rune platelegs (t)"), lvl: 50 },{ item: i("Rune plateskirt (g)"), lvl: 50 },{ item: i("Rune plateskirt (t)"), lvl: 50 },{ item: i("Granite legs"), lvl: 55 },{ item: i("Dragon platelegs"), lvl: 60 },{ item: i("Dragon plateskirt"), lvl: 60 },{ item: i("Bandos tassets"), lvl: 70, special: { always: true, parts: [{ type: "bandos", chance: 100, amount: 8 }, ] } },{ item: i("Dharok's platelegs"), lvl: 70, special: { always: false, parts: [{ type: "undead", chance: 100, amount: 8 }, ] } },{ item: i("Guthan's chainskirt"), lvl: 70, special: { always: false, parts: [{ type: "undead", chance: 100, amount: 8 }, ] } },{ item: i("Torag's platelegs"), lvl: 70, special: { always: false, parts: [{ type: "undead", chance: 100, amount: 8 }, ] } },{ item: i("Verac's plateskirt"), lvl: 70, special: { always: false, parts: [{ type: "undead", chance: 100, amount: 8 }, ] } },{ item: i("Statius's platelegs"), lvl: 78 },{ item: i("Vesta's plateskirt"), lvl: 78 },],
	parts: {},
  partQuantity: 8
};

export default MeleeLegs;

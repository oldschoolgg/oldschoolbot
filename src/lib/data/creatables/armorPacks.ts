import { Bank, type Item } from 'oldschooljs';

import getOSItem from '../../util/getOSItem';
import itemID from '../../util/itemID';
import type { Createable } from '../createables';

export const armorAndItemPacks: Createable[] = [
	// Melee armour sets
	// bronze
	{
		name: 'Unpack bronze set (lg)',
		inputItems: {
			[itemID('Bronze set (lg)')]: 1
		},
		outputItems: {
			[itemID('Bronze full helm')]: 1,
			[itemID('Bronze platebody')]: 1,
			[itemID('Bronze platelegs')]: 1,
			[itemID('Bronze kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze set (lg)',
		inputItems: {
			[itemID('Bronze full helm')]: 1,
			[itemID('Bronze platebody')]: 1,
			[itemID('Bronze platelegs')]: 1,
			[itemID('Bronze kiteshield')]: 1
		},
		outputItems: {
			[itemID('Bronze set (lg)')]: 1
		}
	},
	{
		name: 'Unpack bronze set (sk)',
		inputItems: {
			[itemID('Bronze set (sk)')]: 1
		},
		outputItems: {
			[itemID('Bronze full helm')]: 1,
			[itemID('Bronze platebody')]: 1,
			[itemID('Bronze plateskirt')]: 1,
			[itemID('Bronze kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze set (sk)',
		inputItems: {
			[itemID('Bronze full helm')]: 1,
			[itemID('Bronze platebody')]: 1,
			[itemID('Bronze plateskirt')]: 1,
			[itemID('Bronze kiteshield')]: 1
		},
		outputItems: {
			[itemID('Bronze set (sk)')]: 1
		}
	},
	{
		name: 'Unpack bronze trimmed set (lg)',
		inputItems: {
			[itemID('Bronze trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Bronze full helm (t)')]: 1,
			[itemID('Bronze platebody (t)')]: 1,
			[itemID('Bronze platelegs (t)')]: 1,
			[itemID('Bronze kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze trimmed set (lg)',
		inputItems: {
			[itemID('Bronze full helm (t)')]: 1,
			[itemID('Bronze platebody (t)')]: 1,
			[itemID('Bronze platelegs (t)')]: 1,
			[itemID('Bronze kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Bronze trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack bronze trimmed set (sk)',
		inputItems: {
			[itemID('Bronze trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Bronze full helm (t)')]: 1,
			[itemID('Bronze platebody (t)')]: 1,
			[itemID('Bronze plateskirt (t)')]: 1,
			[itemID('Bronze kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze trimmed set (sk)',
		inputItems: {
			[itemID('Bronze full helm (t)')]: 1,
			[itemID('Bronze platebody (t)')]: 1,
			[itemID('Bronze plateskirt (t)')]: 1,
			[itemID('Bronze kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Bronze trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Unpack bronze gold-trimmed set (lg)',
		inputItems: {
			[itemID('Bronze gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Bronze full helm (g)')]: 1,
			[itemID('Bronze platebody (g)')]: 1,
			[itemID('Bronze platelegs (g)')]: 1,
			[itemID('Bronze kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze gold-trimmed set (lg)',
		inputItems: {
			[itemID('Bronze full helm (g)')]: 1,
			[itemID('Bronze platebody (g)')]: 1,
			[itemID('Bronze platelegs (g)')]: 1,
			[itemID('Bronze kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Bronze gold-trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack bronze gold-trimmed set (sk)',
		inputItems: {
			[itemID('Bronze gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Bronze full helm (g)')]: 1,
			[itemID('Bronze platebody (g)')]: 1,
			[itemID('Bronze plateskirt (g)')]: 1,
			[itemID('Bronze kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze gold-trimmed set (sk)',
		inputItems: {
			[itemID('Bronze full helm (g)')]: 1,
			[itemID('Bronze platebody (g)')]: 1,
			[itemID('Bronze plateskirt (g)')]: 1,
			[itemID('Bronze kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Bronze gold-trimmed set (sk)')]: 1
		}
	},
	// iron
	{
		name: 'Unpack iron set (lg)',
		inputItems: {
			[itemID('Iron set (lg)')]: 1
		},
		outputItems: {
			[itemID('Iron full helm')]: 1,
			[itemID('Iron platebody')]: 1,
			[itemID('Iron platelegs')]: 1,
			[itemID('Iron kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Iron set (lg)',
		inputItems: {
			[itemID('Iron full helm')]: 1,
			[itemID('Iron platebody')]: 1,
			[itemID('Iron platelegs')]: 1,
			[itemID('Iron kiteshield')]: 1
		},
		outputItems: {
			[itemID('Iron set (lg)')]: 1
		}
	},
	{
		name: 'Unpack iron set (sk)',
		inputItems: {
			[itemID('Iron set (sk)')]: 1
		},
		outputItems: {
			[itemID('Iron full helm')]: 1,
			[itemID('Iron platebody')]: 1,
			[itemID('Iron plateskirt')]: 1,
			[itemID('Iron kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Iron set (sk)',
		inputItems: {
			[itemID('Iron full helm')]: 1,
			[itemID('Iron platebody')]: 1,
			[itemID('Iron plateskirt')]: 1,
			[itemID('Iron kiteshield')]: 1
		},
		outputItems: {
			[itemID('Iron set (sk)')]: 1
		}
	},
	{
		name: 'Unpack iron trimmed set (lg)',
		inputItems: {
			[itemID('Iron trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Iron full helm (t)')]: 1,
			[itemID('Iron platebody (t)')]: 1,
			[itemID('Iron platelegs (t)')]: 1,
			[itemID('Iron kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Iron trimmed set (lg)',
		inputItems: {
			[itemID('Iron full helm (t)')]: 1,
			[itemID('Iron platebody (t)')]: 1,
			[itemID('Iron platelegs (t)')]: 1,
			[itemID('Iron kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Iron trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack iron trimmed set (sk)',
		inputItems: {
			[itemID('Iron trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Iron full helm (t)')]: 1,
			[itemID('Iron platebody (t)')]: 1,
			[itemID('Iron plateskirt (t)')]: 1,
			[itemID('Iron kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Iron trimmed set (sk)',
		inputItems: {
			[itemID('Iron full helm (t)')]: 1,
			[itemID('Iron platebody (t)')]: 1,
			[itemID('Iron plateskirt (t)')]: 1,
			[itemID('Iron kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Iron trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Unpack iron gold-trimmed set (lg)',
		inputItems: {
			[itemID('Iron gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Iron full helm (g)')]: 1,
			[itemID('Iron platebody (g)')]: 1,
			[itemID('Iron platelegs (g)')]: 1,
			[itemID('Iron kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Iron gold-trimmed set (lg)',
		inputItems: {
			[itemID('Iron full helm (g)')]: 1,
			[itemID('Iron platebody (g)')]: 1,
			[itemID('Iron platelegs (g)')]: 1,
			[itemID('Iron kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Iron gold-trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack iron gold-trimmed set (sk)',
		inputItems: {
			[itemID('Iron gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Iron full helm (g)')]: 1,
			[itemID('Iron platebody (g)')]: 1,
			[itemID('Iron plateskirt (g)')]: 1,
			[itemID('Iron kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Iron gold-trimmed set (sk)',
		inputItems: {
			[itemID('Iron full helm (g)')]: 1,
			[itemID('Iron platebody (g)')]: 1,
			[itemID('Iron plateskirt (g)')]: 1,
			[itemID('Iron kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Iron gold-trimmed set (sk)')]: 1
		}
	},
	// steel
	{
		name: 'Unpack steel set (lg)',
		inputItems: {
			[itemID('Steel set (lg)')]: 1
		},
		outputItems: {
			[itemID('Steel full helm')]: 1,
			[itemID('Steel platebody')]: 1,
			[itemID('Steel platelegs')]: 1,
			[itemID('Steel kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Steel set (lg)',
		inputItems: {
			[itemID('Steel full helm')]: 1,
			[itemID('Steel platebody')]: 1,
			[itemID('Steel platelegs')]: 1,
			[itemID('Steel kiteshield')]: 1
		},
		outputItems: {
			[itemID('Steel set (lg)')]: 1
		}
	},
	{
		name: 'Unpack steel set (sk)',
		inputItems: {
			[itemID('Steel set (sk)')]: 1
		},
		outputItems: {
			[itemID('Steel full helm')]: 1,
			[itemID('Steel platebody')]: 1,
			[itemID('Steel plateskirt')]: 1,
			[itemID('Steel kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Steel set (sk)',
		inputItems: {
			[itemID('Steel full helm')]: 1,
			[itemID('Steel platebody')]: 1,
			[itemID('Steel plateskirt')]: 1,
			[itemID('Steel kiteshield')]: 1
		},
		outputItems: {
			[itemID('Steel set (sk)')]: 1
		}
	},
	{
		name: 'Unpack steel trimmed set (lg)',
		inputItems: {
			[itemID('Steel trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Steel full helm (t)')]: 1,
			[itemID('Steel platebody (t)')]: 1,
			[itemID('Steel platelegs (t)')]: 1,
			[itemID('Steel kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Steel trimmed set (lg)',
		inputItems: {
			[itemID('Steel full helm (t)')]: 1,
			[itemID('Steel platebody (t)')]: 1,
			[itemID('Steel platelegs (t)')]: 1,
			[itemID('Steel kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Steel trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack steel trimmed set (sk)',
		inputItems: {
			[itemID('Steel trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Steel full helm (t)')]: 1,
			[itemID('Steel platebody (t)')]: 1,
			[itemID('Steel plateskirt (t)')]: 1,
			[itemID('Steel kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Steel trimmed set (sk)',
		inputItems: {
			[itemID('Steel full helm (t)')]: 1,
			[itemID('Steel platebody (t)')]: 1,
			[itemID('Steel plateskirt (t)')]: 1,
			[itemID('Steel kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Steel trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Unpack steel gold-trimmed set (lg)',
		inputItems: {
			[itemID('Steel gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Steel full helm (g)')]: 1,
			[itemID('Steel platebody (g)')]: 1,
			[itemID('Steel platelegs (g)')]: 1,
			[itemID('Steel kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Steel gold-trimmed set (lg)',
		inputItems: {
			[itemID('Steel full helm (g)')]: 1,
			[itemID('Steel platebody (g)')]: 1,
			[itemID('Steel platelegs (g)')]: 1,
			[itemID('Steel kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Steel gold-trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack steel gold-trimmed set (sk)',
		inputItems: {
			[itemID('Steel gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Steel full helm (g)')]: 1,
			[itemID('Steel platebody (g)')]: 1,
			[itemID('Steel plateskirt (g)')]: 1,
			[itemID('Steel kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Steel gold-trimmed set (sk)',
		inputItems: {
			[itemID('Steel full helm (g)')]: 1,
			[itemID('Steel platebody (g)')]: 1,
			[itemID('Steel plateskirt (g)')]: 1,
			[itemID('Steel kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Steel gold-trimmed set (sk)')]: 1
		}
	},
	// black
	{
		name: 'Unpack black set (lg)',
		inputItems: {
			[itemID('Black set (lg)')]: 1
		},
		outputItems: {
			[itemID('Black full helm')]: 1,
			[itemID('Black platebody')]: 1,
			[itemID('Black platelegs')]: 1,
			[itemID('Black kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Black set (lg)',
		inputItems: {
			[itemID('Black full helm')]: 1,
			[itemID('Black platebody')]: 1,
			[itemID('Black platelegs')]: 1,
			[itemID('Black kiteshield')]: 1
		},
		outputItems: {
			[itemID('Black set (lg)')]: 1
		}
	},
	{
		name: 'Unpack black set (sk)',
		inputItems: {
			[itemID('Black set (sk)')]: 1
		},
		outputItems: {
			[itemID('Black full helm')]: 1,
			[itemID('Black platebody')]: 1,
			[itemID('Black plateskirt')]: 1,
			[itemID('Black kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Black set (sk)',
		inputItems: {
			[itemID('Black full helm')]: 1,
			[itemID('Black platebody')]: 1,
			[itemID('Black plateskirt')]: 1,
			[itemID('Black kiteshield')]: 1
		},
		outputItems: {
			[itemID('Black set (sk)')]: 1
		}
	},
	{
		name: 'Unpack black trimmed set (lg)',
		inputItems: {
			[itemID('Black trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Black full helm (t)')]: 1,
			[itemID('Black platebody (t)')]: 1,
			[itemID('Black platelegs (t)')]: 1,
			[itemID('Black kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Black trimmed set (lg)',
		inputItems: {
			[itemID('Black full helm (t)')]: 1,
			[itemID('Black platebody (t)')]: 1,
			[itemID('Black platelegs (t)')]: 1,
			[itemID('Black kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Black trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack black trimmed set (sk)',
		inputItems: {
			[itemID('Black trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Black full helm (t)')]: 1,
			[itemID('Black platebody (t)')]: 1,
			[itemID('Black plateskirt (t)')]: 1,
			[itemID('Black kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Black trimmed set (sk)',
		inputItems: {
			[itemID('Black full helm (t)')]: 1,
			[itemID('Black platebody (t)')]: 1,
			[itemID('Black plateskirt (t)')]: 1,
			[itemID('Black kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Black trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Unpack black gold-trimmed set (lg)',
		inputItems: {
			[itemID('Black gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Black full helm (g)')]: 1,
			[itemID('Black platebody (g)')]: 1,
			[itemID('Black platelegs (g)')]: 1,
			[itemID('Black kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Black gold-trimmed set (lg)',
		inputItems: {
			[itemID('Black full helm (g)')]: 1,
			[itemID('Black platebody (g)')]: 1,
			[itemID('Black platelegs (g)')]: 1,
			[itemID('Black kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Black gold-trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack black gold-trimmed set (sk)',
		inputItems: {
			[itemID('Black gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Black full helm (g)')]: 1,
			[itemID('Black platebody (g)')]: 1,
			[itemID('Black plateskirt (g)')]: 1,
			[itemID('Black kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Black gold-trimmed set (sk)',
		inputItems: {
			[itemID('Black full helm (g)')]: 1,
			[itemID('Black platebody (g)')]: 1,
			[itemID('Black plateskirt (g)')]: 1,
			[itemID('Black kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Black gold-trimmed set (sk)')]: 1
		}
	},
	// mithril
	{
		name: 'Unpack mithril set (lg)',
		inputItems: {
			[itemID('Mithril set (lg)')]: 1
		},
		outputItems: {
			[itemID('Mithril full helm')]: 1,
			[itemID('Mithril platebody')]: 1,
			[itemID('Mithril platelegs')]: 1,
			[itemID('Mithril kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Mithril set (lg)',
		inputItems: {
			[itemID('Mithril full helm')]: 1,
			[itemID('Mithril platebody')]: 1,
			[itemID('Mithril platelegs')]: 1,
			[itemID('Mithril kiteshield')]: 1
		},
		outputItems: {
			[itemID('Mithril set (lg)')]: 1
		}
	},
	{
		name: 'Unpack mithril set (sk)',
		inputItems: {
			[itemID('Mithril set (sk)')]: 1
		},
		outputItems: {
			[itemID('Mithril full helm')]: 1,
			[itemID('Mithril platebody')]: 1,
			[itemID('Mithril plateskirt')]: 1,
			[itemID('Mithril kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Mithril set (sk)',
		inputItems: {
			[itemID('Mithril full helm')]: 1,
			[itemID('Mithril platebody')]: 1,
			[itemID('Mithril plateskirt')]: 1,
			[itemID('Mithril kiteshield')]: 1
		},
		outputItems: {
			[itemID('Mithril set (sk)')]: 1
		}
	},
	{
		name: 'Unpack mithril trimmed set (lg)',
		inputItems: {
			[itemID('Mithril trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Mithril full helm (t)')]: 1,
			[itemID('Mithril platebody (t)')]: 1,
			[itemID('Mithril platelegs (t)')]: 1,
			[itemID('Mithril kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mithril trimmed set (lg)',
		inputItems: {
			[itemID('Mithril full helm (t)')]: 1,
			[itemID('Mithril platebody (t)')]: 1,
			[itemID('Mithril platelegs (t)')]: 1,
			[itemID('Mithril kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Mithril trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack mithril trimmed set (sk)',
		inputItems: {
			[itemID('Mithril trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Mithril full helm (t)')]: 1,
			[itemID('Mithril platebody (t)')]: 1,
			[itemID('Mithril plateskirt (t)')]: 1,
			[itemID('Mithril kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mithril trimmed set (sk)',
		inputItems: {
			[itemID('Mithril full helm (t)')]: 1,
			[itemID('Mithril platebody (t)')]: 1,
			[itemID('Mithril plateskirt (t)')]: 1,
			[itemID('Mithril kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Mithril trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Unpack mithril gold-trimmed set (lg)',
		inputItems: {
			[itemID('Mithril gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Mithril full helm (g)')]: 1,
			[itemID('Mithril platebody (g)')]: 1,
			[itemID('Mithril platelegs (g)')]: 1,
			[itemID('Mithril kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mithril gold-trimmed set (lg)',
		inputItems: {
			[itemID('Mithril full helm (g)')]: 1,
			[itemID('Mithril platebody (g)')]: 1,
			[itemID('Mithril platelegs (g)')]: 1,
			[itemID('Mithril kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Mithril gold-trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack mithril gold-trimmed set (sk)',
		inputItems: {
			[itemID('Mithril gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Mithril full helm (g)')]: 1,
			[itemID('Mithril platebody (g)')]: 1,
			[itemID('Mithril plateskirt (g)')]: 1,
			[itemID('Mithril kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mithril gold-trimmed set (sk)',
		inputItems: {
			[itemID('Mithril full helm (g)')]: 1,
			[itemID('Mithril platebody (g)')]: 1,
			[itemID('Mithril plateskirt (g)')]: 1,
			[itemID('Mithril kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Mithril gold-trimmed set (sk)')]: 1
		}
	},
	// adamant
	{
		name: 'Unpack adamant set (lg)',
		inputItems: {
			[itemID('Adamant set (lg)')]: 1
		},
		outputItems: {
			[itemID('Adamant full helm')]: 1,
			[itemID('Adamant platebody')]: 1,
			[itemID('Adamant platelegs')]: 1,
			[itemID('Adamant kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Adamant set (lg)',
		inputItems: {
			[itemID('Adamant full helm')]: 1,
			[itemID('Adamant platebody')]: 1,
			[itemID('Adamant platelegs')]: 1,
			[itemID('Adamant kiteshield')]: 1
		},
		outputItems: {
			[itemID('Adamant set (lg)')]: 1
		}
	},
	{
		name: 'Unpack adamant set (sk)',
		inputItems: {
			[itemID('Adamant set (sk)')]: 1
		},
		outputItems: {
			[itemID('Adamant full helm')]: 1,
			[itemID('Adamant platebody')]: 1,
			[itemID('Adamant plateskirt')]: 1,
			[itemID('Adamant kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Adamant set (sk)',
		inputItems: {
			[itemID('Adamant full helm')]: 1,
			[itemID('Adamant platebody')]: 1,
			[itemID('Adamant plateskirt')]: 1,
			[itemID('Adamant kiteshield')]: 1
		},
		outputItems: {
			[itemID('Adamant set (sk)')]: 1
		}
	},
	{
		name: 'Unpack adamant trimmed set (lg)',
		inputItems: {
			[itemID('Adamant trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Adamant full helm (t)')]: 1,
			[itemID('Adamant platebody (t)')]: 1,
			[itemID('Adamant platelegs (t)')]: 1,
			[itemID('Adamant kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Adamant trimmed set (lg)',
		inputItems: {
			[itemID('Adamant full helm (t)')]: 1,
			[itemID('Adamant platebody (t)')]: 1,
			[itemID('Adamant platelegs (t)')]: 1,
			[itemID('Adamant kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Adamant trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack adamant trimmed set (sk)',
		inputItems: {
			[itemID('Adamant trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Adamant full helm (t)')]: 1,
			[itemID('Adamant platebody (t)')]: 1,
			[itemID('Adamant plateskirt (t)')]: 1,
			[itemID('Adamant kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Adamant trimmed set (sk)',
		inputItems: {
			[itemID('Adamant full helm (t)')]: 1,
			[itemID('Adamant platebody (t)')]: 1,
			[itemID('Adamant plateskirt (t)')]: 1,
			[itemID('Adamant kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Adamant trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Unpack adamant gold-trimmed set (lg)',
		inputItems: {
			[itemID('Adamant gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Adamant full helm (g)')]: 1,
			[itemID('Adamant platebody (g)')]: 1,
			[itemID('Adamant platelegs (g)')]: 1,
			[itemID('Adamant kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Adamant gold-trimmed set (lg)',
		inputItems: {
			[itemID('Adamant full helm (g)')]: 1,
			[itemID('Adamant platebody (g)')]: 1,
			[itemID('Adamant platelegs (g)')]: 1,
			[itemID('Adamant kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Adamant gold-trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack adamant gold-trimmed set (sk)',
		inputItems: {
			[itemID('Adamant gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Adamant full helm (g)')]: 1,
			[itemID('Adamant platebody (g)')]: 1,
			[itemID('Adamant plateskirt (g)')]: 1,
			[itemID('Adamant kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Adamant gold-trimmed set (sk)',
		inputItems: {
			[itemID('Adamant full helm (g)')]: 1,
			[itemID('Adamant platebody (g)')]: 1,
			[itemID('Adamant plateskirt (g)')]: 1,
			[itemID('Adamant kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Adamant gold-trimmed set (sk)')]: 1
		}
	},
	// rune
	{
		name: 'Unpack rune armour set (lg)',
		inputItems: {
			[itemID('Rune armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Rune full helm')]: 1,
			[itemID('Rune platebody')]: 1,
			[itemID('Rune platelegs')]: 1,
			[itemID('Rune kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Rune armour set (lg)',
		inputItems: {
			[itemID('Rune full helm')]: 1,
			[itemID('Rune platebody')]: 1,
			[itemID('Rune platelegs')]: 1,
			[itemID('Rune kiteshield')]: 1
		},
		outputItems: {
			[itemID('Rune armour set (lg)')]: 1
		}
	},
	{
		name: 'Unpack rune armour set (sk)',
		inputItems: {
			[itemID('Rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Rune full helm')]: 1,
			[itemID('Rune platebody')]: 1,
			[itemID('Rune plateskirt')]: 1,
			[itemID('Rune kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Rune armour set (sk)',
		inputItems: {
			[itemID('Rune full helm')]: 1,
			[itemID('Rune platebody')]: 1,
			[itemID('Rune plateskirt')]: 1,
			[itemID('Rune kiteshield')]: 1
		},
		outputItems: {
			[itemID('Rune armour set (sk)')]: 1
		}
	},
	{
		name: 'Unpack rune trimmed set (lg)',
		inputItems: {
			[itemID('Rune trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Rune full helm (t)')]: 1,
			[itemID('Rune platebody (t)')]: 1,
			[itemID('Rune platelegs (t)')]: 1,
			[itemID('Rune kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Rune trimmed set (lg)',
		inputItems: {
			[itemID('Rune full helm (t)')]: 1,
			[itemID('Rune platebody (t)')]: 1,
			[itemID('Rune platelegs (t)')]: 1,
			[itemID('Rune kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Rune trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack rune trimmed set (sk)',
		inputItems: {
			[itemID('Rune trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Rune full helm (t)')]: 1,
			[itemID('Rune platebody (t)')]: 1,
			[itemID('Rune plateskirt (t)')]: 1,
			[itemID('Rune kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Rune trimmed set (sk)',
		inputItems: {
			[itemID('Rune full helm (t)')]: 1,
			[itemID('Rune platebody (t)')]: 1,
			[itemID('Rune plateskirt (t)')]: 1,
			[itemID('Rune kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Rune trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Unpack rune gold-trimmed set (lg)',
		inputItems: {
			[itemID('Rune gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Rune full helm (g)')]: 1,
			[itemID('Rune platebody (g)')]: 1,
			[itemID('Rune platelegs (g)')]: 1,
			[itemID('Rune kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Rune gold-trimmed set (lg)',
		inputItems: {
			[itemID('Rune full helm (g)')]: 1,
			[itemID('Rune platebody (g)')]: 1,
			[itemID('Rune platelegs (g)')]: 1,
			[itemID('Rune kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Rune gold-trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Unpack rune gold-trimmed set (sk)',
		inputItems: {
			[itemID('Rune gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Rune full helm (g)')]: 1,
			[itemID('Rune platebody (g)')]: 1,
			[itemID('Rune plateskirt (g)')]: 1,
			[itemID('Rune kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Rune gold-trimmed set (sk)',
		inputItems: {
			[itemID('Rune full helm (g)')]: 1,
			[itemID('Rune platebody (g)')]: 1,
			[itemID('Rune plateskirt (g)')]: 1,
			[itemID('Rune kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Rune gold-trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Unpack gilded armour set (lg)',
		inputItems: {
			[itemID('Gilded armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Gilded full helm')]: 1,
			[itemID('Gilded platebody')]: 1,
			[itemID('Gilded platelegs')]: 1,
			[itemID('Gilded kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Gilded armour set (lg)',
		inputItems: {
			[itemID('Gilded full helm')]: 1,
			[itemID('Gilded platebody')]: 1,
			[itemID('Gilded platelegs')]: 1,
			[itemID('Gilded kiteshield')]: 1
		},
		outputItems: {
			[itemID('Gilded armour set (lg)')]: 1
		}
	},
	{
		name: 'Unpack gilded armour set (sk)',
		inputItems: {
			[itemID('Gilded armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Gilded full helm')]: 1,
			[itemID('Gilded platebody')]: 1,
			[itemID('Gilded plateskirt')]: 1,
			[itemID('Gilded kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Gilded armour set (sk)',
		inputItems: {
			[itemID('Gilded full helm')]: 1,
			[itemID('Gilded platebody')]: 1,
			[itemID('Gilded plateskirt')]: 1,
			[itemID('Gilded kiteshield')]: 1
		},
		outputItems: {
			[itemID('Gilded armour set (sk)')]: 1
		}
	},
	// rune god armours
	{
		name: 'Unpack guthix armour set (lg)',
		inputItems: {
			[itemID('Guthix armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Guthix full helm')]: 1,
			[itemID('Guthix platebody')]: 1,
			[itemID('Guthix platelegs')]: 1,
			[itemID('Guthix kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Guthix armour set (lg)',
		inputItems: {
			[itemID('Guthix full helm')]: 1,
			[itemID('Guthix platebody')]: 1,
			[itemID('Guthix platelegs')]: 1,
			[itemID('Guthix kiteshield')]: 1
		},
		outputItems: {
			[itemID('Guthix armour set (lg)')]: 1
		}
	},
	{
		name: 'Unpack guthix armour set (sk)',
		inputItems: {
			[itemID('Guthix armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Guthix full helm')]: 1,
			[itemID('Guthix platebody')]: 1,
			[itemID('Guthix plateskirt')]: 1,
			[itemID('Guthix kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Guthix armour set (sk)',
		inputItems: {
			[itemID('Guthix full helm')]: 1,
			[itemID('Guthix platebody')]: 1,
			[itemID('Guthix plateskirt')]: 1,
			[itemID('Guthix kiteshield')]: 1
		},
		outputItems: {
			[itemID('Guthix armour set (sk)')]: 1
		}
	},
	{
		name: 'Unpack saradomin armour set (lg)',
		inputItems: {
			[itemID('Saradomin armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Saradomin full helm')]: 1,
			[itemID('Saradomin platebody')]: 1,
			[itemID('Saradomin platelegs')]: 1,
			[itemID('Saradomin kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Saradomin armour set (lg)',
		inputItems: {
			[itemID('Saradomin full helm')]: 1,
			[itemID('Saradomin platebody')]: 1,
			[itemID('Saradomin platelegs')]: 1,
			[itemID('Saradomin kiteshield')]: 1
		},
		outputItems: {
			[itemID('Saradomin armour set (lg)')]: 1
		}
	},
	{
		name: 'Unpack saradomin armour set (sk)',
		inputItems: {
			[itemID('Saradomin armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Saradomin full helm')]: 1,
			[itemID('Saradomin platebody')]: 1,
			[itemID('Saradomin plateskirt')]: 1,
			[itemID('Saradomin kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Saradomin armour set (sk)',
		inputItems: {
			[itemID('Saradomin full helm')]: 1,
			[itemID('Saradomin platebody')]: 1,
			[itemID('Saradomin plateskirt')]: 1,
			[itemID('Saradomin kiteshield')]: 1
		},
		outputItems: {
			[itemID('Saradomin armour set (sk)')]: 1
		}
	},
	{
		name: 'Unpack zamorak armour set (lg)',
		inputItems: {
			[itemID('Zamorak armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Zamorak full helm')]: 1,
			[itemID('Zamorak platebody')]: 1,
			[itemID('Zamorak platelegs')]: 1,
			[itemID('Zamorak kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Zamorak armour set (lg)',
		inputItems: {
			[itemID('Zamorak full helm')]: 1,
			[itemID('Zamorak platebody')]: 1,
			[itemID('Zamorak platelegs')]: 1,
			[itemID('Zamorak kiteshield')]: 1
		},
		outputItems: {
			[itemID('Zamorak armour set (lg)')]: 1
		}
	},
	{
		name: 'Unpack zamorak armour set (sk)',
		inputItems: {
			[itemID('Zamorak armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Zamorak full helm')]: 1,
			[itemID('Zamorak platebody')]: 1,
			[itemID('Zamorak plateskirt')]: 1,
			[itemID('Zamorak kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Zamorak armour set (sk)',
		inputItems: {
			[itemID('Zamorak full helm')]: 1,
			[itemID('Zamorak platebody')]: 1,
			[itemID('Zamorak plateskirt')]: 1,
			[itemID('Zamorak kiteshield')]: 1
		},
		outputItems: {
			[itemID('Zamorak armour set (sk)')]: 1
		}
	},
	{
		name: 'Unpack ancient rune armour set (lg)',
		inputItems: {
			[itemID('Ancient rune armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Ancient full helm')]: 1,
			[itemID('Ancient platebody')]: 1,
			[itemID('Ancient platelegs')]: 1,
			[itemID('Ancient kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Ancient rune armour set (lg)',
		inputItems: {
			[itemID('Ancient full helm')]: 1,
			[itemID('Ancient platebody')]: 1,
			[itemID('Ancient platelegs')]: 1,
			[itemID('Ancient kiteshield')]: 1
		},
		outputItems: {
			[itemID('Ancient rune armour set (lg)')]: 1
		}
	},
	{
		name: 'Unpack ancient rune armour set (sk)',
		inputItems: {
			[itemID('Ancient rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Ancient full helm')]: 1,
			[itemID('Ancient platebody')]: 1,
			[itemID('Ancient plateskirt')]: 1,
			[itemID('Ancient kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Ancient rune armour set (sk)',
		inputItems: {
			[itemID('Ancient full helm')]: 1,
			[itemID('Ancient platebody')]: 1,
			[itemID('Ancient plateskirt')]: 1,
			[itemID('Ancient kiteshield')]: 1
		},
		outputItems: {
			[itemID('Ancient rune armour set (sk)')]: 1
		}
	},
	{
		name: 'Unpack armadyl rune armour set (lg)',
		inputItems: {
			[itemID('Armadyl rune armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Armadyl full helm')]: 1,
			[itemID('Armadyl platebody')]: 1,
			[itemID('Armadyl platelegs')]: 1,
			[itemID('Armadyl kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Armadyl rune armour set (lg)',
		inputItems: {
			[itemID('Armadyl full helm')]: 1,
			[itemID('Armadyl platebody')]: 1,
			[itemID('Armadyl platelegs')]: 1,
			[itemID('Armadyl kiteshield')]: 1
		},
		outputItems: {
			[itemID('Armadyl rune armour set (lg)')]: 1
		}
	},
	{
		name: 'Unpack armadyl rune armour set (sk)',
		inputItems: {
			[itemID('Armadyl rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Armadyl full helm')]: 1,
			[itemID('Armadyl platebody')]: 1,
			[itemID('Armadyl plateskirt')]: 1,
			[itemID('Armadyl kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Armadyl rune armour set (sk)',
		inputItems: {
			[itemID('Armadyl full helm')]: 1,
			[itemID('Armadyl platebody')]: 1,
			[itemID('Armadyl plateskirt')]: 1,
			[itemID('Armadyl kiteshield')]: 1
		},
		outputItems: {
			[itemID('Armadyl rune armour set (sk)')]: 1
		}
	},
	{
		name: 'Unpack bandos rune armour set (lg)',
		inputItems: {
			[itemID('Bandos rune armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Bandos full helm')]: 1,
			[itemID('Bandos platebody')]: 1,
			[itemID('Bandos platelegs')]: 1,
			[itemID('Bandos kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Bandos rune armour set (lg)',
		inputItems: {
			[itemID('Bandos full helm')]: 1,
			[itemID('Bandos platebody')]: 1,
			[itemID('Bandos platelegs')]: 1,
			[itemID('Bandos kiteshield')]: 1
		},
		outputItems: {
			[itemID('Bandos rune armour set (lg)')]: 1
		}
	},
	{
		name: 'Unpack bandos rune armour set (sk)',
		inputItems: {
			[itemID('Bandos rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Bandos full helm')]: 1,
			[itemID('Bandos platebody')]: 1,
			[itemID('Bandos plateskirt')]: 1,
			[itemID('Bandos kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Bandos rune armour set (sk)',
		inputItems: {
			[itemID('Bandos full helm')]: 1,
			[itemID('Bandos platebody')]: 1,
			[itemID('Bandos plateskirt')]: 1,
			[itemID('Bandos kiteshield')]: 1
		},
		outputItems: {
			[itemID('Bandos rune armour set (sk)')]: 1
		}
	},
	// dragon
	{
		name: 'Unpack dragon armour set (lg)',
		inputItems: {
			[itemID('Dragon armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Dragon full helm')]: 1,
			[itemID('Dragon platebody')]: 1,
			[itemID('Dragon platelegs')]: 1,
			[itemID('Dragon kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Dragon armour set (lg)',
		inputItems: {
			[itemID('Dragon full helm')]: 1,
			[itemID('Dragon platebody')]: 1,
			[itemID('Dragon platelegs')]: 1,
			[itemID('Dragon kiteshield')]: 1
		},
		outputItems: {
			[itemID('Dragon armour set (lg)')]: 1
		}
	},
	{
		name: 'Unpack dragon armour set (sk)',
		inputItems: {
			[itemID('Dragon armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Dragon full helm')]: 1,
			[itemID('Dragon platebody')]: 1,
			[itemID('Dragon plateskirt')]: 1,
			[itemID('Dragon kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Dragon armour set (sk)',
		inputItems: {
			[itemID('Dragon full helm')]: 1,
			[itemID('Dragon platebody')]: 1,
			[itemID('Dragon plateskirt')]: 1,
			[itemID('Dragon kiteshield')]: 1
		},
		outputItems: {
			[itemID('Dragon armour set (sk)')]: 1
		}
	},
	// barrows
	{
		name: "Unpack verac's armour set",
		inputItems: {
			[itemID("Verac's armour set")]: 1
		},
		outputItems: {
			[itemID("Verac's helm")]: 1,
			[itemID("Verac's brassard")]: 1,
			[itemID("Verac's plateskirt")]: 1,
			[itemID("Verac's flail")]: 1
		},
		noCl: true
	},
	{
		name: "Verac's armour set",
		inputItems: {
			[itemID("Verac's helm")]: 1,
			[itemID("Verac's brassard")]: 1,
			[itemID("Verac's plateskirt")]: 1,
			[itemID("Verac's flail")]: 1
		},
		outputItems: {
			[itemID("Verac's armour set")]: 1
		}
	},
	{
		name: "Unpack dharok's armour set",
		inputItems: {
			[itemID("Dharok's armour set")]: 1
		},
		outputItems: {
			[itemID("Dharok's helm")]: 1,
			[itemID("Dharok's platebody")]: 1,
			[itemID("Dharok's platelegs")]: 1,
			[itemID("Dharok's greataxe")]: 1
		},
		noCl: true
	},
	{
		name: "Dharok's armour set",
		inputItems: {
			[itemID("Dharok's helm")]: 1,
			[itemID("Dharok's platebody")]: 1,
			[itemID("Dharok's platelegs")]: 1,
			[itemID("Dharok's greataxe")]: 1
		},
		outputItems: {
			[itemID("Dharok's armour set")]: 1
		}
	},
	{
		name: "Unpack guthan's armour set",
		inputItems: {
			[itemID("Guthan's armour set")]: 1
		},
		outputItems: {
			[itemID("Guthan's helm")]: 1,
			[itemID("Guthan's platebody")]: 1,
			[itemID("Guthan's chainskirt")]: 1,
			[itemID("Guthan's warspear")]: 1
		},
		noCl: true
	},
	{
		name: "Guthan's armour set",
		inputItems: {
			[itemID("Guthan's helm")]: 1,
			[itemID("Guthan's platebody")]: 1,
			[itemID("Guthan's chainskirt")]: 1,
			[itemID("Guthan's warspear")]: 1
		},
		outputItems: {
			[itemID("Guthan's armour set")]: 1
		}
	},
	{
		name: "Unpack ahrim's armour set",
		inputItems: {
			[itemID("Ahrim's armour set")]: 1
		},
		outputItems: {
			[itemID("Ahrim's hood")]: 1,
			[itemID("Ahrim's robetop")]: 1,
			[itemID("Ahrim's robeskirt")]: 1,
			[itemID("Ahrim's staff")]: 1
		},
		noCl: true
	},
	{
		name: "Ahrim's armour set",
		inputItems: {
			[itemID("Ahrim's hood")]: 1,
			[itemID("Ahrim's robetop")]: 1,
			[itemID("Ahrim's robeskirt")]: 1,
			[itemID("Ahrim's staff")]: 1
		},
		outputItems: {
			[itemID("Ahrim's armour set")]: 1
		}
	},
	{
		name: "Unpack torag's armour set",
		inputItems: {
			[itemID("Torag's armour set")]: 1
		},
		outputItems: {
			[itemID("Torag's helm")]: 1,
			[itemID("Torag's platebody")]: 1,
			[itemID("Torag's platelegs")]: 1,
			[itemID("Torag's hammers")]: 1
		},
		noCl: true
	},
	{
		name: "Torag's armour set",
		inputItems: {
			[itemID("Torag's helm")]: 1,
			[itemID("Torag's platebody")]: 1,
			[itemID("Torag's platelegs")]: 1,
			[itemID("Torag's hammers")]: 1
		},
		outputItems: {
			[itemID("Torag's armour set")]: 1
		}
	},
	{
		name: "Unpack karil's armour set",
		inputItems: {
			[itemID("Karil's armour set")]: 1
		},
		outputItems: {
			[itemID("Karil's coif")]: 1,
			[itemID("Karil's leathertop")]: 1,
			[itemID("Karil's leatherskirt")]: 1,
			[itemID("Karil's crossbow")]: 1
		},
		noCl: true
	},
	{
		name: "Karil's armour set",
		inputItems: {
			[itemID("Karil's coif")]: 1,
			[itemID("Karil's leathertop")]: 1,
			[itemID("Karil's leatherskirt")]: 1,
			[itemID("Karil's crossbow")]: 1
		},
		outputItems: {
			[itemID("Karil's armour set")]: 1
		}
	},
	// inquisitor
	{
		name: "Unpack inquisitor's armour set",
		inputItems: {
			[itemID("Inquisitor's armour set")]: 1
		},
		outputItems: {
			[itemID("Inquisitor's great helm")]: 1,
			[itemID("Inquisitor's hauberk")]: 1,
			[itemID("Inquisitor's plateskirt")]: 1
		},
		noCl: true
	},
	{
		name: "Inquisitor's armour set",
		inputItems: {
			[itemID("Inquisitor's great helm")]: 1,
			[itemID("Inquisitor's hauberk")]: 1,
			[itemID("Inquisitor's plateskirt")]: 1
		},
		outputItems: {
			[itemID("Inquisitor's armour set")]: 1
		}
	},
	// justiciar
	{
		name: 'Unpack justiciar armour set',
		inputItems: {
			[itemID('Justiciar armour set')]: 1
		},
		outputItems: {
			[itemID('Justiciar faceguard')]: 1,
			[itemID('Justiciar chestguard')]: 1,
			[itemID('Justiciar legguards')]: 1
		},
		noCl: true
	},
	{
		name: 'Justiciar armour set',
		inputItems: {
			[itemID('Justiciar faceguard')]: 1,
			[itemID('Justiciar chestguard')]: 1,
			[itemID('Justiciar legguards')]: 1
		},
		outputItems: {
			[itemID('Justiciar armour set')]: 1
		}
	},
	// obsidian
	{
		name: 'Unpack obsidian armour set',
		inputItems: {
			[itemID('Obsidian armour set')]: 1
		},
		outputItems: {
			[itemID('Obsidian helmet')]: 1,
			[itemID('Obsidian platebody')]: 1,
			[itemID('Obsidian platelegs')]: 1
		},
		noCl: true
	},
	{
		name: 'Obsidian armour set',
		inputItems: {
			[itemID('Obsidian helmet')]: 1,
			[itemID('Obsidian platebody')]: 1,
			[itemID('Obsidian platelegs')]: 1
		},
		outputItems: {
			[itemID('Obsidian armour set')]: 1
		}
	},
	// dragonstone
	{
		name: 'Unpack dragonstone armour set',
		inputItems: {
			[itemID('Dragonstone armour set')]: 1
		},
		outputItems: {
			[itemID('Dragonstone full helm')]: 1,
			[itemID('Dragonstone platebody')]: 1,
			[itemID('Dragonstone platelegs')]: 1,
			[itemID('Dragonstone gauntlets')]: 1,
			[itemID('Dragonstone boots')]: 1
		},
		noCl: true
	},
	{
		name: 'Dragonstone armour set',
		inputItems: {
			[itemID('Dragonstone full helm')]: 1,
			[itemID('Dragonstone platebody')]: 1,
			[itemID('Dragonstone platelegs')]: 1,
			[itemID('Dragonstone gauntlets')]: 1,
			[itemID('Dragonstone boots')]: 1
		},
		outputItems: {
			[itemID('Dragonstone armour set')]: 1
		}
	},
	// temple knight
	{
		name: 'Unpack initiate harness m',
		inputItems: {
			[itemID('Initiate harness m')]: 1
		},
		outputItems: {
			[itemID('Initiate sallet')]: 1,
			[itemID('Initiate hauberk')]: 1,
			[itemID('Initiate cuisse')]: 1
		},
		noCl: true
	},
	{
		name: 'Initiate harness m',
		inputItems: {
			[itemID('Initiate sallet')]: 1,
			[itemID('Initiate hauberk')]: 1,
			[itemID('Initiate cuisse')]: 1
		},
		outputItems: {
			[itemID('Initiate harness m')]: 1
		}
	},
	{
		name: 'Unpack proselyte harness m',
		inputItems: {
			[itemID('Proselyte harness m')]: 1
		},
		outputItems: {
			[itemID('Proselyte sallet')]: 1,
			[itemID('Proselyte hauberk')]: 1,
			[itemID('Proselyte cuisse')]: 1
		},
		noCl: true
	},
	{
		name: 'Proselyte harness m',
		inputItems: {
			[itemID('Proselyte sallet')]: 1,
			[itemID('Proselyte hauberk')]: 1,
			[itemID('Proselyte cuisse')]: 1
		},
		outputItems: {
			[itemID('Proselyte harness m')]: 1
		}
	},
	{
		name: 'Unpack proselyte harness f',
		inputItems: {
			[itemID('Proselyte harness f')]: 1
		},
		outputItems: {
			[itemID('Proselyte sallet')]: 1,
			[itemID('Proselyte hauberk')]: 1,
			[itemID('Proselyte tasset')]: 1
		},
		noCl: true
	},
	{
		name: 'Proselyte harness f',
		inputItems: {
			[itemID('Proselyte sallet')]: 1,
			[itemID('Proselyte hauberk')]: 1,
			[itemID('Proselyte tasset')]: 1
		},
		outputItems: {
			[itemID('Proselyte harness f')]: 1
		}
	},
	// range sets
	// dragonhide
	{
		name: 'Unpack green dragonhide set',
		inputItems: {
			[itemID('Green dragonhide set')]: 1
		},
		outputItems: {
			[itemID("Green d'hide body")]: 1,
			[itemID("Green d'hide chaps")]: 1,
			[itemID("Green d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'Green dragonhide set',
		inputItems: {
			[itemID("Green d'hide body")]: 1,
			[itemID("Green d'hide chaps")]: 1,
			[itemID("Green d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('Green dragonhide set')]: 1
		}
	},
	{
		name: 'Unpack blue dragonhide set',
		inputItems: {
			[itemID('Blue dragonhide set')]: 1
		},
		outputItems: {
			[itemID("Blue d'hide body")]: 1,
			[itemID("Blue d'hide chaps")]: 1,
			[itemID("Blue d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'Blue dragonhide set',
		inputItems: {
			[itemID("Blue d'hide body")]: 1,
			[itemID("Blue d'hide chaps")]: 1,
			[itemID("Blue d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('Blue dragonhide set')]: 1
		}
	},
	{
		name: 'Unpack red dragonhide set',
		inputItems: {
			[itemID('Red dragonhide set')]: 1
		},
		outputItems: {
			[itemID("Red d'hide body")]: 1,
			[itemID("Red d'hide chaps")]: 1,
			[itemID("Red d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'Red dragonhide set',
		inputItems: {
			[itemID("Red d'hide body")]: 1,
			[itemID("Red d'hide chaps")]: 1,
			[itemID("Red d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('Red dragonhide set')]: 1
		}
	},
	{
		name: 'Unpack black dragonhide set',
		inputItems: {
			[itemID('Black dragonhide set')]: 1
		},
		outputItems: {
			[itemID("Black d'hide body")]: 1,
			[itemID("Black d'hide chaps")]: 1,
			[itemID("Black d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'Black dragonhide set',
		inputItems: {
			[itemID("Black d'hide body")]: 1,
			[itemID("Black d'hide chaps")]: 1,
			[itemID("Black d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('Black dragonhide set')]: 1
		}
	},
	{
		name: 'Unpack gilded dragonhide set',
		inputItems: {
			[itemID('Gilded dragonhide set')]: 1
		},
		outputItems: {
			[itemID("Gilded d'hide body")]: 1,
			[itemID("Gilded d'hide chaps")]: 1,
			[itemID("Gilded d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'Gilded dragonhide set',
		inputItems: {
			[itemID("Gilded d'hide body")]: 1,
			[itemID("Gilded d'hide chaps")]: 1,
			[itemID("Gilded d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('Gilded dragonhide set')]: 1
		}
	},
	// blessed dragonhide
	{
		name: 'Unpack guthix dragonhide set',
		inputItems: {
			[itemID('Guthix dragonhide set')]: 1
		},
		outputItems: {
			[itemID('Guthix coif')]: 1,
			[itemID("Guthix d'hide body")]: 1,
			[itemID('Guthix chaps')]: 1,
			[itemID('Guthix bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'Guthix dragonhide set',
		inputItems: {
			[itemID('Guthix coif')]: 1,
			[itemID("Guthix d'hide body")]: 1,
			[itemID('Guthix chaps')]: 1,
			[itemID('Guthix bracers')]: 1
		},
		outputItems: {
			[itemID('Guthix dragonhide set')]: 1
		}
	},
	{
		name: 'Unpack saradomin dragonhide set',
		inputItems: {
			[itemID('Saradomin dragonhide set')]: 1
		},
		outputItems: {
			[itemID('Saradomin coif')]: 1,
			[itemID("Saradomin d'hide body")]: 1,
			[itemID('Saradomin chaps')]: 1,
			[itemID('Saradomin bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'Saradomin dragonhide set',
		inputItems: {
			[itemID('Saradomin coif')]: 1,
			[itemID("Saradomin d'hide body")]: 1,
			[itemID('Saradomin chaps')]: 1,
			[itemID('Saradomin bracers')]: 1
		},
		outputItems: {
			[itemID('Saradomin dragonhide set')]: 1
		}
	},
	{
		name: 'Unpack zamorak dragonhide set',
		inputItems: {
			[itemID('Zamorak dragonhide set')]: 1
		},
		outputItems: {
			[itemID('Zamorak coif')]: 1,
			[itemID("Zamorak d'hide body")]: 1,
			[itemID('Zamorak chaps')]: 1,
			[itemID('Zamorak bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'Zamorak dragonhide set',
		inputItems: {
			[itemID('Zamorak coif')]: 1,
			[itemID("Zamorak d'hide body")]: 1,
			[itemID('Zamorak chaps')]: 1,
			[itemID('Zamorak bracers')]: 1
		},
		outputItems: {
			[itemID('Zamorak dragonhide set')]: 1
		}
	},
	{
		name: 'Unpack ancient dragonhide set',
		inputItems: {
			[itemID('Ancient dragonhide set')]: 1
		},
		outputItems: {
			[itemID('Ancient coif')]: 1,
			[itemID("Ancient d'hide body")]: 1,
			[itemID('Ancient chaps')]: 1,
			[itemID('Ancient bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'Ancient dragonhide set',
		inputItems: {
			[itemID('Ancient coif')]: 1,
			[itemID("Ancient d'hide body")]: 1,
			[itemID('Ancient chaps')]: 1,
			[itemID('Ancient bracers')]: 1
		},
		outputItems: {
			[itemID('Ancient dragonhide set')]: 1
		}
	},
	{
		name: 'Unpack armadyl dragonhide set',
		inputItems: {
			[itemID('Armadyl dragonhide set')]: 1
		},
		outputItems: {
			[itemID('Armadyl coif')]: 1,
			[itemID("Armadyl d'hide body")]: 1,
			[itemID('Armadyl chaps')]: 1,
			[itemID('Armadyl bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'Armadyl dragonhide set',
		inputItems: {
			[itemID('Armadyl coif')]: 1,
			[itemID("Armadyl d'hide body")]: 1,
			[itemID('Armadyl chaps')]: 1,
			[itemID('Armadyl bracers')]: 1
		},
		outputItems: {
			[itemID('Armadyl dragonhide set')]: 1
		}
	},
	{
		name: 'Unpack bandos dragonhide set',
		inputItems: {
			[itemID('Bandos dragonhide set')]: 1
		},
		outputItems: {
			[itemID('Bandos coif')]: 1,
			[itemID("Bandos d'hide body")]: 1,
			[itemID('Bandos chaps')]: 1,
			[itemID('Bandos bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'Bandos dragonhide set',
		inputItems: {
			[itemID('Bandos coif')]: 1,
			[itemID("Bandos d'hide body")]: 1,
			[itemID('Bandos chaps')]: 1,
			[itemID('Bandos bracers')]: 1
		},
		outputItems: {
			[itemID('Bandos dragonhide set')]: 1
		}
	},
	// mage sets
	{
		name: 'Unpack mystic set (blue)',
		inputItems: {
			[itemID('Mystic set (blue)')]: 1
		},
		outputItems: {
			[itemID('Mystic hat')]: 1,
			[itemID('Mystic robe top')]: 1,
			[itemID('Mystic robe bottom')]: 1,
			[itemID('Mystic gloves')]: 1,
			[itemID('Mystic boots')]: 1
		},
		noCl: true
	},
	{
		name: 'Mystic set (blue)',
		inputItems: {
			[itemID('Mystic hat')]: 1,
			[itemID('Mystic robe top')]: 1,
			[itemID('Mystic robe bottom')]: 1,
			[itemID('Mystic gloves')]: 1,
			[itemID('Mystic boots')]: 1
		},
		outputItems: {
			[itemID('Mystic set (blue)')]: 1
		}
	},
	{
		name: 'Unpack mystic set (dark)',
		inputItems: {
			[itemID('Mystic set (dark)')]: 1
		},
		outputItems: {
			[itemID('Mystic hat (dark)')]: 1,
			[itemID('Mystic robe top (dark)')]: 1,
			[itemID('Mystic robe bottom (dark)')]: 1,
			[itemID('Mystic gloves (dark)')]: 1,
			[itemID('Mystic boots (dark)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mystic set (dark)',
		inputItems: {
			[itemID('Mystic hat (dark)')]: 1,
			[itemID('Mystic robe top (dark)')]: 1,
			[itemID('Mystic robe bottom (dark)')]: 1,
			[itemID('Mystic gloves (dark)')]: 1,
			[itemID('Mystic boots (dark)')]: 1
		},
		outputItems: {
			[itemID('Mystic set (dark)')]: 1
		}
	},
	{
		name: 'Unpack mystic set (light)',
		inputItems: {
			[itemID('Mystic set (light)')]: 1
		},
		outputItems: {
			[itemID('Mystic hat (light)')]: 1,
			[itemID('Mystic robe top (light)')]: 1,
			[itemID('Mystic robe bottom (light)')]: 1,
			[itemID('Mystic gloves (light)')]: 1,
			[itemID('Mystic boots (light)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mystic set (light)',
		inputItems: {
			[itemID('Mystic hat (light)')]: 1,
			[itemID('Mystic robe top (light)')]: 1,
			[itemID('Mystic robe bottom (light)')]: 1,
			[itemID('Mystic gloves (light)')]: 1,
			[itemID('Mystic boots (light)')]: 1
		},
		outputItems: {
			[itemID('Mystic set (light)')]: 1
		}
	},
	{
		name: 'Unpack mystic set (dusk)',
		inputItems: {
			[itemID('Mystic set (dusk)')]: 1
		},
		outputItems: {
			[itemID('Mystic hat (dusk)')]: 1,
			[itemID('Mystic robe top (dusk)')]: 1,
			[itemID('Mystic robe bottom (dusk)')]: 1,
			[itemID('Mystic gloves (dusk)')]: 1,
			[itemID('Mystic boots (dusk)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mystic set (dusk)',
		inputItems: {
			[itemID('Mystic hat (dusk)')]: 1,
			[itemID('Mystic robe top (dusk)')]: 1,
			[itemID('Mystic robe bottom (dusk)')]: 1,
			[itemID('Mystic gloves (dusk)')]: 1,
			[itemID('Mystic boots (dusk)')]: 1
		},
		outputItems: {
			[itemID('Mystic set (dusk)')]: 1
		}
	},
	{
		name: 'Unpack ancestral robes set',
		inputItems: {
			[itemID('Ancestral robes set')]: 1
		},
		outputItems: {
			[itemID('Ancestral hat')]: 1,
			[itemID('Ancestral robe top')]: 1,
			[itemID('Ancestral robe bottom')]: 1
		},
		noCl: true
	},
	{
		name: 'Ancestral robes set',
		inputItems: {
			[itemID('Ancestral hat')]: 1,
			[itemID('Ancestral robe top')]: 1,
			[itemID('Ancestral robe bottom')]: 1
		},
		outputItems: {
			[itemID('Ancestral robes set')]: 1
		}
	},
	// god books
	{
		name: 'Unpack book of balance page set',
		inputItems: {
			[itemID('Book of balance page set')]: 1
		},
		outputItems: {
			[itemID('Guthix page 1')]: 1,
			[itemID('Guthix page 2')]: 1,
			[itemID('Guthix page 3')]: 1,
			[itemID('Guthix page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'Book of balance page set',
		inputItems: {
			[itemID('Guthix page 1')]: 1,
			[itemID('Guthix page 2')]: 1,
			[itemID('Guthix page 3')]: 1,
			[itemID('Guthix page 4')]: 1
		},
		outputItems: {
			[itemID('Book of balance page set')]: 1
		}
	},
	{
		name: 'Unpack holy book page set',
		inputItems: {
			[itemID('Holy book page set')]: 1
		},
		outputItems: {
			[itemID('Saradomin page 1')]: 1,
			[itemID('Saradomin page 2')]: 1,
			[itemID('Saradomin page 3')]: 1,
			[itemID('Saradomin page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'Holy book page set',
		inputItems: {
			[itemID('Saradomin page 1')]: 1,
			[itemID('Saradomin page 2')]: 1,
			[itemID('Saradomin page 3')]: 1,
			[itemID('Saradomin page 4')]: 1
		},
		outputItems: {
			[itemID('Holy book page set')]: 1
		}
	},
	{
		name: 'Unpack unholy book page set',
		inputItems: {
			[itemID('Unholy book page set')]: 1
		},
		outputItems: {
			[itemID('Zamorak page 1')]: 1,
			[itemID('Zamorak page 2')]: 1,
			[itemID('Zamorak page 3')]: 1,
			[itemID('Zamorak page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'Unholy book page set',
		inputItems: {
			[itemID('Zamorak page 1')]: 1,
			[itemID('Zamorak page 2')]: 1,
			[itemID('Zamorak page 3')]: 1,
			[itemID('Zamorak page 4')]: 1
		},
		outputItems: {
			[itemID('Unholy book page set')]: 1
		}
	},
	{
		name: 'Unpack book of darkness page set',
		inputItems: {
			[itemID('Book of darkness page set')]: 1
		},
		outputItems: {
			[itemID('Ancient page 1')]: 1,
			[itemID('Ancient page 2')]: 1,
			[itemID('Ancient page 3')]: 1,
			[itemID('Ancient page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'Book of darkness page set',
		inputItems: {
			[itemID('Ancient page 1')]: 1,
			[itemID('Ancient page 2')]: 1,
			[itemID('Ancient page 3')]: 1,
			[itemID('Ancient page 4')]: 1
		},
		outputItems: {
			[itemID('Book of darkness page set')]: 1
		}
	},
	{
		name: 'Unpack book of law page set',
		inputItems: {
			[itemID('Book of law page set')]: 1
		},
		outputItems: {
			[itemID('Armadyl page 1')]: 1,
			[itemID('Armadyl page 2')]: 1,
			[itemID('Armadyl page 3')]: 1,
			[itemID('Armadyl page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'Book of law page set',
		inputItems: {
			[itemID('Armadyl page 1')]: 1,
			[itemID('Armadyl page 2')]: 1,
			[itemID('Armadyl page 3')]: 1,
			[itemID('Armadyl page 4')]: 1
		},
		outputItems: {
			[itemID('Book of law page set')]: 1
		}
	},
	{
		name: 'Unpack book of war page set',
		inputItems: {
			[itemID('Book of war page set')]: 1
		},
		outputItems: {
			[itemID('Bandos page 1')]: 1,
			[itemID('Bandos page 2')]: 1,
			[itemID('Bandos page 3')]: 1,
			[itemID('Bandos page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'Book of war page set',
		inputItems: {
			[itemID('Bandos page 1')]: 1,
			[itemID('Bandos page 2')]: 1,
			[itemID('Bandos page 3')]: 1,
			[itemID('Bandos page 4')]: 1
		},
		outputItems: {
			[itemID('Book of war page set')]: 1
		}
	},
	// holiday
	{
		name: 'Unpack partyhat set',
		inputItems: {
			[itemID('Partyhat set')]: 1
		},
		outputItems: {
			[itemID('Red partyhat')]: 1,
			[itemID('Yellow partyhat')]: 1,
			[itemID('Green partyhat')]: 1,
			[itemID('Blue partyhat')]: 1,
			[itemID('Purple partyhat')]: 1,
			[itemID('White partyhat')]: 1
		},
		noCl: true
	},
	{
		name: 'Partyhat set',
		inputItems: {
			[itemID('Red partyhat')]: 1,
			[itemID('Yellow partyhat')]: 1,
			[itemID('Green partyhat')]: 1,
			[itemID('Blue partyhat')]: 1,
			[itemID('Purple partyhat')]: 1,
			[itemID('White partyhat')]: 1
		},
		outputItems: {
			[itemID('Partyhat set')]: 1
		}
	},
	{
		name: 'Unpack halloween mask set',
		inputItems: {
			[itemID('Halloween mask set')]: 1
		},
		outputItems: {
			[itemID('Red halloween mask')]: 1,
			[itemID('Green halloween mask')]: 1,
			[itemID('Blue halloween mask')]: 1
		},
		noCl: true
	},
	{
		name: 'Halloween mask set',
		inputItems: {
			[itemID('Red halloween mask')]: 1,
			[itemID('Green halloween mask')]: 1,
			[itemID('Blue halloween mask')]: 1
		},
		outputItems: {
			[itemID('Halloween mask set')]: 1
		}
	},
	// misc
	{
		name: 'Unpack combat potion set',
		inputItems: {
			[itemID('Combat potion set')]: 1
		},
		outputItems: {
			[itemID('Attack potion(4)')]: 1,
			[itemID('Strength potion(4)')]: 1,
			[itemID('Defence potion(4)')]: 1
		},
		noCl: true
	},
	{
		name: 'Combat potion set',
		inputItems: {
			[itemID('Attack potion(4)')]: 1,
			[itemID('Strength potion(4)')]: 1,
			[itemID('Defence potion(4)')]: 1
		},
		outputItems: {
			[itemID('Combat potion set')]: 1
		}
	},
	{
		name: 'Unpack super potion set',
		inputItems: {
			[itemID('Super potion set')]: 1
		},
		outputItems: {
			[itemID('Super attack(4)')]: 1,
			[itemID('Super strength(4)')]: 1,
			[itemID('Super defence(4)')]: 1
		},
		noCl: true
	},
	{
		name: 'Super potion set',
		inputItems: {
			[itemID('Super attack(4)')]: 1,
			[itemID('Super strength(4)')]: 1,
			[itemID('Super defence(4)')]: 1
		},
		outputItems: {
			[itemID('Super potion set')]: 1
		}
	},
	{
		name: 'Unpack dwarf cannon set',
		inputItems: {
			[itemID('Dwarf cannon set')]: 1
		},
		outputItems: {
			[itemID('Cannon barrels')]: 1,
			[itemID('Cannon base')]: 1,
			[itemID('Cannon furnace')]: 1,
			[itemID('Cannon stand')]: 1
		},
		noCl: true
	},
	{
		name: 'Dwarf cannon set',
		inputItems: {
			[itemID('Cannon barrels')]: 1,
			[itemID('Cannon base')]: 1,
			[itemID('Cannon furnace')]: 1,
			[itemID('Cannon stand')]: 1
		},
		outputItems: {
			[itemID('Dwarf cannon set')]: 1
		}
	}
];

const armorSetsSrc: { unpacked: Bank; packed: Item }[] = [
	{
		unpacked: new Bank().add("Dagon'hai hat").add("Dagon'hai robe top").add("Dagon'hai robe bottom"),
		packed: getOSItem("Dagon'hai robes set")
	},
	{
		unpacked: new Bank().add('Masori mask (f)').add('Masori body (f)').add('Masori chaps (f)'),
		packed: getOSItem('Masori armour set (f)')
	},
	{
		unpacked: new Bank().add('Sunfire fanatic helm').add('Sunfire fanatic cuirass').add('Sunfire fanatic chausses'),
		packed: getOSItem('Sunfire fanatic armour set')
	}
];

for (const set of armorSetsSrc) {
	armorAndItemPacks.push({
		name: set.packed.name,
		inputItems: set.unpacked,
		outputItems: new Bank().add(set.packed.id, 1),
		type: 'pack'
	});
	armorAndItemPacks.push({
		name: `Unpack ${set.packed.name}`,
		inputItems: new Bank().add(set.packed.id, 1),
		outputItems: set.unpacked,
		type: 'unpack',
		noCl: true
	});
}

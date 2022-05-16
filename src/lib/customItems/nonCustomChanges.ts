import getOSItem from '../util/getOSItem';
import { setDataOfNonCustomItem } from './util';

setDataOfNonCustomItem(getOSItem('Seed pack'), {
	customItemData: {
		isSuperUntradeable: true,
		cantDropFromMysteryBoxes: true
	}
});

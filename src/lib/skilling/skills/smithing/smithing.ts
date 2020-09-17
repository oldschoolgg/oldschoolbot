import { Emoji } from '../../../constants';
import { SkillsEnum, SmithedBar } from '../../types';
import Adamant from './adamant';
import Bronze from './bronze';
import Iron from './iron';
import Mithril from './mithril';
import Rune from './rune';
import Steel from './steel';

const smithedBars: SmithedBar[] = [...Bronze, ...Iron, ...Steel, ...Mithril, ...Adamant, ...Rune];

const Smithing = {
	aliases: ['smithing'],
	SmithedBars: smithedBars,
	id: SkillsEnum.Smithing,
	emoji: Emoji.Smithing
};

export default Smithing;

import { SkillsEnum, SmithedBar } from '../types';
import { Emoji } from '../../constants';
import Bronze from './smithing/bronze';
import Iron from './smithing/iron';
import Steel from './smithing/steel';
import Mithril from './smithing/mithril';
import Adamant from './smithing/adamant';
import Rune from './smithing/rune';

const smithedBars: SmithedBar[] = [...Bronze, ...Iron, ...Steel, ...Mithril, ...Adamant, ...Rune];

const Smith = {
	SmithedBars: smithedBars,
	id: SkillsEnum.Smithing,
	emoji: Emoji.Smithing
};

export default Smith;

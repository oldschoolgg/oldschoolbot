import { SkillsEnum, SmithedBar } from '../../types';
import { Emoji } from '../../../constants';
import Bronze from './bronze';
import Iron from './iron';
import Steel from './steel';
import Mithril from './mithril';
import Adamant from './adamant';
import Rune from './rune';

const smithedBars: SmithedBar[] = [...Bronze, ...Iron, ...Steel, ...Mithril, ...Adamant, ...Rune];

const Smith = {
	SmithedBars: smithedBars,
	id: SkillsEnum.Smithing,
	emoji: Emoji.Smithing
};

export default Smith;

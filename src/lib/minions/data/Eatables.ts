import { Cookables } from '../../skilling/skills/cooking';

export const Eatables = Cookables.filter(item => item.healAmount).reverse();

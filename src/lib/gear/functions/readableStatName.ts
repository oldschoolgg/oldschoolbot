import { toTitleCase } from '../../util';

export default function readableStatName(slot: string) {
	return toTitleCase(slot.replace('_', ' '));
}

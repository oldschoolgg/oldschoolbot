import type { FlatKickMessage } from '@worp/universal/types';

type MessageCallback = (msg: FlatKickMessage) => void;

class MessageEmitter {
	private listeners = new Set<MessageCallback>();

	subscribe(callback: MessageCallback) {
		this.listeners.add(callback);
		return () => this.listeners.delete(callback);
	}

	emit(message: FlatKickMessage) {
		for (const cb of this.listeners) {
			cb(message);
		}
	}
}

export const messageEmitter = new MessageEmitter();

import { randArrItem, randInt } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { InteractionID } from '@/lib/InteractionID.js';

export const DEGEN_TIMEOUT = Time.Minute * 30;
export const DEGEN_ROLL_CHANCE = 30;

const initialOfferLines = [
	`🐋 A degenerate gambler skids to a halt. "Ooh, I see you have a whale card. Care to trade for my amazing, wonderful, does-everything whale pet?"`,
	`🐋 A twitchy gambler points at your pack. "Hold on. Is that a whale card? Friend, I would make you an unbelievable whale-related offer for that."`,
	`🐋 A degenerate gambler gasps. "Wait, that's a whale card, isn't it? Perfect. I just so happen to own the finest whale pet alive."`
] as const;

const convincingLines = [
	`🐋 "This whale pet doubles loot. Not sometimes. Emotionally."`,
	`🎰 "It knows the exact moment to stop gambling. I've just never listened to it."`,
	`✨ "It's basically a max cape with fins, but friend-shaped."`,
	`🧠 "It gives financial advice. Real financial advice. Not gambler financial advice."`,
	`🏃 "You can send it on birdhouse runs. It hates birds, but it still does them."`,
	`🔮 "It can smell rare drops. Third age, jars, pets, all of it. Through walls."`,
	`📜 "It already solved every clue in Gielinor, it just likes to stay humble."`,
	`🐳 "This is not some normal whale pet. This is a premium, artisan, boutique whale pet."`,
	`💼 "Very low maintenance. Barely haunted anymore."`,
	`🪙 "It prints money. Metaphorically. Usually."`,
	`🌊 "It used to belong to royalty. Possibly sea royalty, but royalty all the same."`,
	`🛠️ "It can do construction. Excellent taste in wallpapers."`,
	`🫡 "It comes pre-loyal. Won't even question your leadership."`,
	`📈 "Its resale value is astronomical. Assuming you were insane enough to part with it."`
] as const;

const declineLines = [
	`🐋 He clutches his chest. "You'll regret turning down the greatest whale deal of your life."`,
	`🙄 He mutters something about visionless investors and shuffles away.`,
	`🎰 He squints at you. "Fine. Keep your card. Some people are afraid of opportunity."`,
	`🐳 He sighs dramatically. "Another masterpiece, unappreciated in its time."`,
	`🫠 He backs off, still insisting the whale pet was worth at least three kingdoms.`
] as const;

const missingCardLines = [
	`🐋 He squints at your empty hands. "No whale card? Then we have nothing to discuss."`,
	`🤨 He pats your pockets for a second, realizes the card is gone, and loses interest immediately.`,
	`🎰 "You spent the card already?" he groans. "Now what am I supposed to obsess over?"`
] as const;

const scamLines = [
	`🏃 The moment the card touches his hand, he bolts. That was not a trade. That was just theft with branding.`,
	`💨 He snatches your Whale card, yells "pleasure doing business!" and disappears at alarming speed.`,
	`🎰 He inspects the card, nods approvingly, and runs like he's late for another bad decision.`,
	`🫠 He thanks you warmly, then vanishes into the distance with absolutely no whale pet involved.`,
	`🐋 The degenerate gambler grabs the card, salutes you, and flees. You have been catastrophically overmatched.`
] as const;

const wubufuLines = [
	`🐋 He produces a rotund blue pet with a proud grin. Huh. That is almost definitely Wubufu. You receive Wubufu.`,
	`✨ With great ceremony, he unveils Wubufu. From far away, in dim light, it is extremely convincing. You receive Wubufu.`,
	`🐳 He hands you a whale pet and refuses eye contact. The tiny tag says Wubufu. You receive Wubufu.`,
	`🎁 He presents what appears to be the bargain-bin cousin of greatness. Still, it is yours now. You receive Wubufu.`,
	`👀 He swears this one is "basically Wubbles". It is, in fact, Wubufu. You receive Wubufu.`
] as const;

const wubblesLines = [
	`🐋 He produces a rotund blue pet with a trembling grin. Wait... that actually is Wubbles. You receive Wubbles.`,
	`✨ With great ceremony, he unveils Wubbles. Somehow, against all reason, the real thing is right there. You receive Wubbles.`,
	`🐳 He hands you a whale pet and looks genuinely emotional. This one really is Wubbles. You receive Wubbles.`,
	`🎁 He presents pure, improbable greatness. No knock-off, no gimmick, just Wubbles. You receive Wubbles.`,
	`👀 He swears this is "the authentic article," and for once he is telling the truth. You receive Wubbles.`
] as const;

export type ParsedWhaleTradeInteraction = {
	userID: string;
	expiresAt: number;
};

export function buildWhaleTradeInteractionID(userID: string, expiresAt: number) {
	return `${InteractionID.Commands.WhaleTrade}_${userID}_${expiresAt}`;
}

export function parseWhaleTradeInteractionID(id: string): ParsedWhaleTradeInteraction | null {
	const prefix = `${InteractionID.Commands.WhaleTrade}_`;
	if (!id.startsWith(prefix)) return null;
	const [userID, expiresAtRaw] = id.slice(prefix.length).split('_');
	const expiresAt = Number(expiresAtRaw);
	if (!userID || !Number.isFinite(expiresAt)) return null;
	return {
		userID,
		expiresAt
	};
}

export function getWhaleTradeInitialOffer() {
	return randArrItem(initialOfferLines);
}

export function getWhaleTradePitch(fake?: boolean) {
	const msg = randArrItem(convincingLines);
	return `${msg}\n\nAre you sure you want to give this guy your Whale card${fake ? ` *(He might not know if it's fake...)*` : ''}`;
}

export function getWhaleTradeDeclineLine() {
	return randArrItem(declineLines);
}

export function getWhaleTradeMissingCardLine() {
	return randArrItem(missingCardLines);
}

export function rollWhaleTradeResult(user: MUser, fake?: boolean) {
	let roll = randInt(1, 100);
	if (!fake) {
		if (!user.cl.has('Wubbles')) {
			if (user.cl.amount('The whale card') === 1) {
				roll = 100;
			} else if (user.bank.amount('The whale card') <= 1) {
				roll = 100;
			} else {
				roll *= 2;
			}
		}
	}

	if (roll <= 30) {
		return {
			type: 'scam' as const,
			loot: new Bank(),
			message: randArrItem(scamLines)
		};
	}
	if (roll <= 80) {
		return {
			type: 'wubufu' as const,
			loot: new Bank().add('Wubufu'),
			message: randArrItem(wubufuLines)
		};
	}
	return {
		type: 'wubbles' as const,
		loot: new Bank().add('Wubbles'),
		message: randArrItem(wubblesLines)
	};
}

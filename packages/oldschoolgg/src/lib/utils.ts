export function cn(...classes: (string | undefined | false)[]) {
	return classes.filter(Boolean).join(' ');
}

export type TimeAgoOptions = {
	now?: Date | number;
	maxUnits?: number; // 1 => "5 days ago", 2 => "5 days, 3 hours ago"
	numeric?: Intl.RelativeTimeFormatNumeric; // "always" | "auto"
	locale?: string;
};

const UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
	{ unit: "year", ms: 365.25 * 24 * 60 * 60 * 1000 },
	{ unit: "month", ms: 30.4375 * 24 * 60 * 60 * 1000 },
	{ unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
	{ unit: "day", ms: 24 * 60 * 60 * 1000 },
	{ unit: "hour", ms: 60 * 60 * 1000 },
	{ unit: "minute", ms: 60 * 1000 },
	{ unit: "second", ms: 1000 },
];

export function timeAgo(
	date: Date | number,
	opts: TimeAgoOptions = {}
): string {
	const nowMs = opts.now instanceof Date ? opts.now.getTime() : (opts.now ?? Date.now());
	const dateMs = date instanceof Date ? date.getTime() : date;

	if (!Number.isFinite(dateMs)) throw new TypeError("Invalid date");
	if (!Number.isFinite(nowMs)) throw new TypeError("Invalid now");

	const maxUnits = Math.max(1, Math.floor(opts.maxUnits ?? 1));
	const rtf = new Intl.RelativeTimeFormat(opts.locale, {
		numeric: opts.numeric ?? "always",
	});

	let diffMs = dateMs - nowMs;
	const parts: string[] = [];

	for (const { unit, ms } of UNITS) {
		if (parts.length >= maxUnits) break;

		const value = diffMs / ms;
		const whole = value < 0 ? Math.ceil(value) : Math.floor(value);
		if (whole === 0) continue;

		if (parts.length === 0) {
			parts.push(rtf.format(whole, unit));
		} else {
			const abs = Math.abs(whole);
			parts.push(`${abs} ${unit}${abs === 1 ? "" : "s"}`);
		}

		diffMs -= whole * ms;
	}

	if (parts.length === 0) return rtf.format(0, "second");
	if (parts.length === 1) return parts[0];

	const isPast = dateMs < nowMs;
	return isPast ? `${parts.join(", ")} ago` : `in ${parts.join(", ")}`;
}

import type { GlobalState } from '@/lib/api.js';

interface UserProfileLinkProps {
	user: GlobalState['user'];
}

export default function UserProfileLink({ user }: UserProfileLinkProps) {
	if (!user) return null;

	const avatarUrl = user.avatar
		? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`
		: `https://cdn.discordapp.com/embed/avatars/${(BigInt(user.id) >> 22n) % 5n}.png`;

	return (
		<a
			href={`/account`}
			data-astro-prefetch="tap"
			className="flex items-center gap-2 transition-all bg-neutral-500/10 hover:bg-neutral-500/20 px-4 py-2 rounded-lg"
		>
			<span>{user.global_name || user.username || 'User'}</span>
			<img
				src={avatarUrl}
				alt={`${user.global_name || user.username}'s avatar`}
				className="w-7 h-7 rounded-full"
			/>
		</a>
	);
}

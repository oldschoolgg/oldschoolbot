import type { GlobalState } from "@/lib/api.js";

interface UserProfileLinkProps {
	user: GlobalState["user"];
}

export default function UserProfileLink({ user }: UserProfileLinkProps) {
	if (!user) return null;

	const avatarUrl = user.avatar
		? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`
		: `https://cdn.discordapp.com/embed/avatars/${(BigInt(user.id) >> 22n) % 5n}.png`;

	return (
		<a
			href={`/user/${user.id}`}
			data-astro-prefetch="tap"
			className="flex items-center gap-2 transition-all hover:brightness-120"
		>
			<span>{user.global_name || user.username || "User"}</span>
			<img
				src={avatarUrl}
				alt={`${user.global_name || user.username}'s avatar`}
				className="w-4 h-4 rounded-full"
			/>
		</a>
	);
}

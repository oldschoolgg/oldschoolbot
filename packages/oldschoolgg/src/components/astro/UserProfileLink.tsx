import { memo, useEffect, useMemo, useRef, useState } from 'react';

import type { GlobalState } from '@/lib/api.js';
import { api } from '@/lib/api.js';

interface UserProfileLinkProps {
	user: GlobalState['user'];
}

interface AccountLink {
	label?: string;
	href?: string;
	onClick?: () => void;
	requiresStaff?: boolean;
	isDivider?: boolean;
}

function UserProfileLink({ user }: UserProfileLinkProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 1024);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleLogout = async () => {
		await api.logOut();
	};

	const accountLinks: AccountLink[] = useMemo(
		() => [
			{ label: 'Minions', href: '/account/minion' },
			{ label: 'Two', href: '/account/two' },
			{ label: 'Staff', href: '/account/staff', requiresStaff: true },
			{ label: 'Economy Transactions', href: '/account/staff/economy-transactions', requiresStaff: true },
			{ isDivider: true },
			{ label: 'Log Out', onClick: handleLogout }
		],
		[]
	);

	const avatarUrl = user?.avatar
		? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`
		: user
			? `https://cdn.discordapp.com/embed/avatars/${(BigInt(user.id) >> 22n) % 5n}.png`
			: '';

	const isStaff = user?.bits.includes(1) || user?.bits.includes(2);

	const visibleLinks = useMemo(
		() => accountLinks.filter(link => !link.requiresStaff || isStaff),
		[accountLinks, isStaff]
	);

	if (!user) {
		return (
			<a data-astro-prefetch="tap" href="/login" className="transition-all hover:brightness-120">
				Login
			</a>
		);
	}

	if (isMobile) {
		return (
			<div className="flex flex-col gap-3 w-full">
				<div className="flex items-center justify-center gap-2 py-2">
					<span className="font-semibold">{user.global_name || user.username || 'User'}</span>
					<img
						src={avatarUrl}
						alt={`${user.global_name || user.username}'s avatar`}
						className="w-7 h-7 rounded-full"
					/>
				</div>
				<div className="flex flex-col gap-2 w-full">
					{visibleLinks.map((link, index) =>
						link.isDivider ? (
							<div key={index} className="w-full border-t border-neutral-700 my-1" />
						) : link.onClick ? (
							<button
								key={index}
								onClick={link.onClick}
								className="w-full text-center py-2 px-4 rounded-lg transition-all bg-neutral-500/10 hover:bg-neutral-500/20 font-semibold"
							>
								{link.label}
							</button>
						) : (
							<a
								key={index}
								href={link.href}
								data-astro-prefetch="tap"
								className="w-full text-center py-2 px-4 rounded-lg transition-all bg-neutral-500/10 hover:bg-neutral-500/20 font-semibold"
							>
								{link.label}
							</a>
						)
					)}
				</div>
			</div>
		);
	}

	return (
		<div ref={dropdownRef} className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 transition-all bg-neutral-500/10 hover:bg-neutral-500/20 px-4 py-2 rounded-lg cursor-pointer"
			>
				<span>{user.global_name || user.username || 'User'}</span>
				<img
					src={avatarUrl}
					alt={`${user.global_name || user.username}'s avatar`}
					className="w-7 h-7 rounded-full"
				/>
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg overflow-hidden z-50 border border-neutral-700">
					{visibleLinks.map((link, index) =>
						link.isDivider ? (
							<div key={index} className="border-t border-neutral-700" />
						) : link.onClick ? (
							<button
								key={index}
								onClick={link.onClick}
								className="block w-full text-left px-4 py-3 hover:bg-neutral-700 transition-colors"
							>
								{link.label}
							</button>
						) : (
							<a
								key={index}
								href={link.href}
								data-astro-prefetch="tap"
								className="block px-4 py-3 hover:bg-neutral-700 transition-colors"
							>
								{link.label}
							</a>
						)
					)}
				</div>
			)}
		</div>
	);
}

export default memo(UserProfileLink);

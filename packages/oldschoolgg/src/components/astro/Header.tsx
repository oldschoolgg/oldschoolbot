import { useState } from 'react';

import { globalState } from '@/lib/api.js';
import NavLinks from './NavLinks.js';
import UserProfileLink from './UserProfileLink.js';

interface LinkChild {
	label: string;
	href: string;
	color?: string;
}

interface Link {
	label: string;
	href?: string;
	color?: string;
	children?: LinkChild[];
}

const links: Link[] = [{ label: 'Wiki', href: 'https://wiki.oldschool.gg/' }];

export default function Header() {
	const state = globalState();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="w-full py-4 text-white">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
				<nav className="flex items-center justify-between">
					<a href="/">
						<h1 className="text-5xl font-semibold">Oldschool.gg</h1>
					</a>

					<button
						className="lg:hidden p-2 hover:opacity-70 transition-opacity"
						aria-label="Toggle menu"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</button>

					<div className="hidden lg:flex items-center gap-8 font-semibold">
						<NavLinks links={links} />
						<UserProfileLink user={state.user} />
					</div>
				</nav>

				{mobileMenuOpen && (
					<div className="lg:hidden mt-6 pb-4 border-t border-neutral-700 pt-6">
						<div className="flex flex-col gap-6">
							<div className="flex flex-col gap-3">
								<NavLinks links={links} mobile={true} />
							</div>
							<div className="border-t border-neutral-700 pt-4">
								<UserProfileLink user={state.user} />
							</div>
						</div>
					</div>
				)}
			</div>
		</header>
	);
}

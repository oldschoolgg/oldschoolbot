import { ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';

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

interface NavLinksProps {
	mobile?: boolean;
	links: Link[];
}

const isExternalLink = (href: string) => {
	return href.startsWith('http://') || href.startsWith('https://');
};

const getLinkAttrs = (href: string) => ({
	target: isExternalLink(href) ? '_blank' : undefined,
	rel: isExternalLink(href) ? 'noopener noreferrer' : undefined
});

export default function NavLinks({ mobile = false, links }: NavLinksProps) {
	const [openDropdowns, setOpenDropdowns] = useState<Set<number>>(new Set());

	const toggleDropdown = (index: number) => {
		setOpenDropdowns(prev => {
			const newSet = new Set(prev);
			if (newSet.has(index)) {
				newSet.delete(index);
			} else {
				if (!mobile) {
					newSet.clear();
				}
				newSet.add(index);
			}
			return newSet;
		});
	};

	const hoverClass = 'transition-all hover:brightness-120';
	const dropdownButtonClass = mobile
		? `flex items-center justify-between w-full py-2 px-4 rounded-lg bg-neutral-500/10 hover:bg-neutral-500/20 font-semibold ${hoverClass}`
		: `flex items-center gap-1 ${hoverClass}`;
	const dropdownMenuClass = mobile
		? 'mobile-dropdown-menu pl-4 mt-2 gap-2'
		: 'absolute top-full left-0 mt-2 w-58 rounded-lg border-main bg-primary shadow-lg animate-fadeIn';
	const linkClass = mobile
		? `flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-neutral-500/10 hover:bg-neutral-500/20 font-semibold ${hoverClass}`
		: `flex items-center gap-2 px-4 py-3 ${hoverClass}`;

	return (
		<>
			{links.map((link, index) =>
				link.children ? (
					<div
						key={index}
						className={mobile ? 'mobile-dropdown' : 'relative dropdown cursor-pointer'}
						style={link.color ? { color: link.color } : undefined}
					>
						<button className={dropdownButtonClass} onClick={() => toggleDropdown(index)}>
							{link.label}
							<div
								className={
									mobile
										? `transition-transform duration-300 ${openDropdowns.has(index) ? 'rotate-180' : ''}`
										: undefined
								}
							>
								<ChevronDown />
							</div>
						</button>
						<div
							className={`${dropdownMenuClass} ${openDropdowns.has(index) ? (mobile ? 'flex flex-col' : '') : 'hidden'}`}
						>
							{link.children.map((child, childIndex) => (
								<a
									key={childIndex}
									href={child.href}
									className={linkClass}
									style={child.color ? { color: child.color } : undefined}
									{...getLinkAttrs(child.href)}
								>
									{child.label}
									{isExternalLink(child.href) && <ExternalLink size={16} />}
								</a>
							))}
						</div>
					</div>
				) : (
					<a
						key={index}
						data-astro-prefetch="tap"
						href={link.href}
						className={`flex items-center gap-1.5 ${hoverClass}`}
						style={link.color ? { color: link.color } : undefined}
						{...getLinkAttrs(link.href!)}
					>
						{link.label}
						{isExternalLink(link.href!) && <ExternalLink size={16} />}
					</a>
				)
			)}
		</>
	);
}

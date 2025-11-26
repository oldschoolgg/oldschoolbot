import {
	BotIcon,
	CaptionsIcon,
	ClockIcon,
	CloudSunRainIcon,
	Grid2x2Icon,
	LecternIcon,
	MessageSquareIcon,
	MessagesSquareIcon,
	SettingsIcon
} from 'lucide-react';
import type React from 'react';

export type RouteItem = {
	icon: React.ReactNode;
	title: string;
	url: string;
	disabled?: boolean;
	openUrl?: string;
};

export const routes: (
	| {
			title: string;
			icon: any;
			items: RouteItem[];
			openUrl?: string;
	  }
	| RouteItem
)[] = [
	{
		icon: <SettingsIcon className="h-5" />,
		title: 'Settings',
		url: '/dashboard/:slug'
	},
	{
		icon: <Grid2x2Icon className="h-5" />,
		title: 'Standalone Widgets',
		url: '/widgets',
		openUrl: '/widgets'
	},
	{
		title: 'Overlay',
		icon: <BotIcon className="h-5" />,
		items: [
			{
				icon: <MessagesSquareIcon className="h-5" />,
				title: 'Discord Highlights',
				url: '/dashboard/:slug/discord-highlights'
			},
			{
				icon: <MessageSquareIcon className="h-5" />,
				title: 'Kick Chat',
				url: '/dashboard/:slug/kick_chat'
			},
			{
				icon: <CloudSunRainIcon className="h-5" />,
				title: 'Weather',
				url: '/dashboard/:slug/weather'
			},
			{
				icon: <ClockIcon className="h-5" />,
				title: 'Time',
				url: '/dashboard/:slug/time'
			}
		]
	},
	{
		icon: <CaptionsIcon className="h-5" />,
		title: 'Custom Commands',
		url: '/dashboard/:slug/custom-commands'
	},
	{
		icon: <LecternIcon className="h-5" />,
		title: 'Polls',
		url: '/dashboard/:slug/polls'
	}
];

export const flatRoutes = routes.reduce<RouteItem[]>((acc, item) => {
	if ('items' in item) {
		return [...acc, ...item.items];
	} else {
		return [...acc, item];
	}
}, []);

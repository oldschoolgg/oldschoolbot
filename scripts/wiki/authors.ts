interface Author {
	gitIDs: string[];
	displayName: string;
	avatar?: string;
}

export const authors: Author[] = [
	{ gitIDs: ['gc'], displayName: 'Magnaboy', avatar: 'https://cdn.oldschool.gg/avatars/gc.gif' },
	{ gitIDs: ['nwjgit'], displayName: 'Jonesey', avatar: 'https://cdn.oldschool.gg/avatars/nwjgit.jpg' },
	{ gitIDs: ['Arodab'], displayName: 'Arodab', avatar: 'https://cdn.oldschool.gg/avatars/Arodab.webp' },
	{
		gitIDs: ['DaughtersOfNyx'],
		displayName: 'Keres',
		avatar: 'https://cdn.oldschool.gg/avatars/DaughtersOfNyx.webp'
	},
	{ gitIDs: ['TastyPumPum'], displayName: 'TastyPumPum', avatar: 'https://cdn.oldschool.gg/avatars/tasty.webp' },
	{ gitIDs: ['00justas'], displayName: 'Justas' },
	{ gitIDs: ['themrrobert'], displayName: 'Cyr', avatar: 'https://cdn.oldschool.gg/avatars/cyr.webp' },
	{ gitIDs: ['DayV-git'], displayName: 'DayV', avatar: 'https://cdn.oldschool.gg/avatars/dayv.webp' },
	{ gitIDs: ['Felris'], displayName: 'Felris', avatar: 'https://cdn.oldschool.gg/avatars/felris.webp' },
	{ gitIDs: ['Lajnux'], displayName: 'Fishy', avatar: 'https://cdn.oldschool.gg/avatars/fishy.webp' },
	{
		gitIDs: ['DarkWorldsArtist'],
		displayName: 'DarkWorldsArtist',
		avatar: 'https://cdn.oldschool.gg/avatars/dark.webp'
	},
	{ gitIDs: ['Luunae'], displayName: 'Luunae' },
	{
		gitIDs: ['wontonstrips'],
		displayName: 'wontonstrips',
		avatar: 'https://cdn.oldschool.gg/avatars/wontonstrips.webp'
	},
	{ gitIDs: ['Porfet'], displayName: 'Porfet', avatar: 'https://cdn.oldschool.gg/avatars/Porfet.webp' },
	{ gitIDs: ['NotShin'], displayName: 'NotShin', avatar: 'https://cdn.oldschool.gg/avatars/NotShin.webp' },
	{
		gitIDs: ['badgehunter'],
		displayName: 'badgehunter',
		avatar: 'https://cdn.oldschool.gg/avatars/badgehunter.webp'
	},
	{ gitIDs: ['code1100'], displayName: 'code1100', avatar: 'https://cdn.oldschool.gg/avatars/code1100.webp' },
	{ gitIDs: ['JustDavyy'], displayName: 'JustDavyy', avatar: 'https://cdn.oldschool.gg/avatars/JustDavyy.webp' },
	{ gitIDs: ['chrisjeng', 'chris jeng'], displayName: 'Chris Jeng' }
];

export const authorsMap = new Map<string, Author>();

for (const author of authors) {
	authorsMap.set(author.displayName.toLowerCase(), author);
	for (const gitID of author.gitIDs) {
		authorsMap.set(gitID, author);
	}
}

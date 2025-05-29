interface Author {
	gitIDs: string[];
	displayName: string;
	avatar?: string;
}

const authors: Author[] = [
	{ gitIDs: ['gc'], displayName: 'Magnaboy', avatar: 'https://cdn.oldschool.gg/avatars/gc.gif' },
	{ gitIDs: ['nwjgit'], displayName: 'Jonesey', avatar: 'https://cdn.oldschool.gg/avatars/nwjgit.jpg' },
	{ gitIDs: ['Arodab'], displayName: 'Arodab' },
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
	{ gitIDs: ['wontonstrips'], displayName: 'wontonstrips' }
];

export const authorsMap = new Map<string, Author>();

for (const author of authors) {
	authorsMap.set(author.displayName.toLowerCase(), author);
	for (const gitID of author.gitIDs) {
		authorsMap.set(gitID, author);
	}
}

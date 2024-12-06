interface Author {
	gitIDs: string[];
	displayName: string;
	avatar?: string;
}

const authors: Author[] = [
	{ gitIDs: ['gc'], displayName: 'Magnaboy', avatar: 'gc.gif' },
	{ gitIDs: ['nwjgit'], displayName: 'Jonesey', avatar: 'nwjgit.jpg' },
	{ gitIDs: ['Arodab'], displayName: 'Arodab' },
	{ gitIDs: ['DaughtersOfNyx'], displayName: 'Keres', avatar: 'DaughtersOfNyx.webp' },
	{ gitIDs: ['TastyPumPum'], displayName: 'TastyPumPum', avatar: 'tasty.webp' },
	{ gitIDs: ['00justas'], displayName: 'Justas' },
	{ gitIDs: ['themrrobert'], displayName: 'Cyr' },
	{ gitIDs: ['DayV-git'], displayName: 'DayV', avatar: 'dayv.webp' },
	{ gitIDs: ['Felris'], displayName: 'Felris', avatar: 'felris.webp' },
	{ gitIDs: ['Lajnux'], displayName: 'Fishy', avatar: 'fishy.webp' },
	{ gitIDs: ['DarkWorldsArtist'], displayName: 'DarkWorldsArtist', avatar: 'dark.webp' },
	{ gitIDs: ['Luunae'], displayName: 'Luunae' }
];

export const authorsMap = new Map<string, Author>();

for (const author of authors) {
	authorsMap.set(author.displayName.toLowerCase(), author);
	for (const gitID of author.gitIDs) {
		authorsMap.set(gitID, author);
	}
}

import { blacklistCommand } from "@/commands/blacklist.js";
import { linkCommand } from "@/commands/link.js";
import { pingableRolesCommand } from "@/commands/pingableroles.js";
import { reactCommand } from "@/commands/react.js";
import { tagCommand } from "@/commands/tag.js";
import { toolsCommand } from "@/commands/tools.js";
import { triviaCommand } from "@/commands/trivia.js";

export const allCommands: RoboChimpCommand[] = [
	blacklistCommand,
	pingableRolesCommand,
	reactCommand,
	tagCommand,
	toolsCommand,
	triviaCommand,
	linkCommand
];

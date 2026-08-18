import { userMention } from '@oldschoolgg/discord';
import { noOp } from '@oldschoolgg/toolkit';

import { Channel, globalConfig } from '@/lib/constants.js';

export type AuditFile = {
	name: string;
	buffer: Buffer;
};

export type ArgData = { data:string, name?: string };

export function makeArgAuditFiles(arg1?: string, arg2?: string): AuditFile[] | undefined;
export function makeArgAuditFiles(argData1?: ArgData, argData2?: ArgData): AuditFile[] | undefined;
export function makeArgAuditFiles(ObjOrString1?: string | ArgData, ObjOrString2?: string | ArgData): AuditFile[] | undefined {
	if (!ObjOrString1 && !ObjOrString2) return undefined;
	const files: AuditFile[] = [];

	if (ObjOrString1) {
		if (typeof ObjOrString1 === 'string') {
			files.push({name: 'arg1.txt', buffer: Buffer.from(ObjOrString1)});
		} else {
			files.push({name: ObjOrString1.name ?? 'arg1.txt', buffer: Buffer.from(ObjOrString1.data)});
		}
	}
	if (ObjOrString2) {
		if (typeof ObjOrString2 === 'string') {
			files.push({name: 'arg2.txt', buffer: Buffer.from(ObjOrString2)});
		}else {
			files.push({name: ObjOrString2.name ?? 'arg2.txt', buffer: Buffer.from(ObjOrString2.data)});
		}
	}
	return files;
}

export async function dmCyrAudit(content: string, files?: AuditFile[]) {
	await globalClient
		.sendDm(globalConfig.adminUserIDs[0], {
			content,
			files
		})
		.catch(noOp);
}

export async function sendCyrCriticalBotLog(title: string, body: string, files?: AuditFile[]) {
	const cyrID = globalConfig.adminUserIDs[0];
	await globalClient
		.sendMessage(Channel.BotLogs, {
			content: `# **${title}**\n${userMention(cyrID)} ${body}`,
			files,
			allowedMentions: { users: [cyrID] }
		})
		.catch(noOp);
}

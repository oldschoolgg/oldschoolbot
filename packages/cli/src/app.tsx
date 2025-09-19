import { spawn } from 'node:child_process';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import type React from 'react';
import { useEffect, useState } from 'react';

type Command = { cmd: string | string[]; desc: string };
type CommandGroup = Command | Command[];

type Stage = {
	name: string;
	commands: CommandGroup[];
};

const stages: Stage[] = [
	// {
	// 	name: 'Stage 1',
	// 	commands: [
	// 		{ cmd: 'pnpm install', desc: 'Installing dependencies...' },
	// 		{ cmd: 'prisma db push', desc: 'Pushing Prisma schema...' },
	// 		{ cmd: 'pnpm generate:robochimp', desc: 'Generating RoboChimp...' },
	// 		{ cmd: 'pnpm build:packages', desc: 'Building packages...' }
	// 	]
	// },
	{
		name: 'Stage 2',
		commands: [
			[
				['Rendering commands file', 'renderCommandsFile.ts'],
				['Rendering monsters file', 'monstersJson.ts'],
				['Rendering creatables file', 'creatables.ts']
			].map(script => ({
				cmd: `pnpm tsx --tsconfig scripts/tsconfig.json scripts/${script[1]}`,
				desc: script[0]
			})),
			{ cmd: 'pnpm build', desc: 'Building project...' }
		]
	},
	{
		name: 'Stage 3',
		commands: [
			{
				cmd: [
					'prettier --use-tabs --write "**/*.json" && biome check --write --unsafe --diagnostic-level=error',
					'prettier --use-tabs --write "**/*.{yaml,yml,css,html}"',
					'prisma format --schema ./prisma/robochimp.prisma && prisma format --schema ./prisma/schema.prisma'
				],
				desc: 'Linting code...'
			},
			{ cmd: 'pnpm --stream -r test', desc: 'Running tests...' }
		]
	}
];

function runSingleCommand(cmd: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const p = spawn(cmd, { shell: true, stdio: ['inherit', 'pipe', 'pipe'] });

		let stderr = '';
		let stdout = '';

		p.stdout.on('data', d => {
			console.log(d.toString());
			stdout += d.toString();
		});
		p.stderr.on('data', d => {
			stderr += d.toString();
		});

		p.on('close', code => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Command failed: ${cmd}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`));
			}
		});
	});
}

function run(c: Command) {
	if (Array.isArray(c.cmd)) {
		return Promise.all(c.cmd.map(cmd => runSingleCommand(cmd))).then(() => null);
	}
	return runSingleCommand(c.cmd);
}

export const Root: React.FC = () => {
	const [stageIndex, setStageIndex] = useState(0);
	const [cmdIndex, setCmdIndex] = useState(0);
	const [status, setStatus] = useState<'running' | 'done' | 'error'>('running');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				for (let i = 0; i < stages.length; i++) {
					setStageIndex(i);
					for (let j = 0; j < stages[i]!.commands.length; j++) {
						setCmdIndex(j);
						const cmdGroup = stages[i]!.commands[j]!;
						if (Array.isArray(cmdGroup)) {
							await Promise.all(cmdGroup.map(c => run(c)));
						} else {
							await run(cmdGroup);
						}
					}
				}
				setStatus('done');
			} catch (err) {
				setError(String(err));
				setStatus('error');
			}
		})();
	}, []);

	return (
		<Box flexDirection="column">
			<Text>Dev script</Text>
			{stages.map((s, i) => (
				<Box key={s.name} flexDirection="column" marginLeft={2}>
					<Text>
						{i === stageIndex ? '▶' : ' '} {s.name}
					</Text>
					{s.commands.map((c, j) => {
						const active = i === stageIndex && j === cmdIndex && status === 'running';
						const finished = i < stageIndex || (i === stageIndex && j < cmdIndex);

						const cmds = Array.isArray(c) ? c : [c];

						return (
							<Box key={j} flexDirection="column" marginLeft={2}>
								{cmds.map(inner => (
									<Box key={inner.cmd.toString()}>
										{active && !finished && (
											<Text color="yellow">
												<Spinner type="dots" /> {inner.desc}
											</Text>
										)}
										{finished && <Text color="green">✔ {inner.desc}</Text>}
										{!active && !finished && <Text> {inner.desc}</Text>}
									</Box>
								))}
							</Box>
						);
					})}
				</Box>
			))}
			{status === 'done' && <Text color="green">✅ All done</Text>}
			{status === 'error' && (
				<Box flexDirection="column">
					<Text color="red">❌ Error occurred</Text>
					<Text>{error}</Text>
				</Box>
			)}
		</Box>
	);
};

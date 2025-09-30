import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
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

type Timings = Record<string, number>;

const ALL_PACKAGE_NAMES: string[] = readdirSync('packages').filter(
	name => !['test-dashboard', 'robochimp', 'cli'].includes(name)
);

const stages: Stage[] = [
	{
		name: 'Stage 1',
		commands: [
			{ cmd: 'pnpm install', desc: 'Installing dependencies...' },
			{ cmd: 'prisma db push', desc: 'Pushing Prisma schema...' },
			{ cmd: 'pnpm generate:robochimp', desc: 'Generating RoboChimp...' },
			{ cmd: 'pnpm build:packages', desc: 'Building packages...' }
		]
	},
	{
		name: 'Stage 2',
		commands: [
			[
				['Rendering commands file', 'renderCommandsFile.ts'],
				['Rendering monsters file', 'monstersJson.ts'],
				['Rendering creatables file', 'creatables.ts']
				// ['Rendering skilling data files', 'dataFiles.ts']
			].map(script => ({
				cmd: `pnpm tsx --tsconfig scripts/tsconfig.json scripts/${script[1]}`,
				desc: script[0]
			})),
			ALL_PACKAGE_NAMES.map(pkg => ({ cmd: `pnpm --filter ${pkg} build`, desc: `Building ${pkg}...` })),
			{ cmd: 'tsx esbuild.mts', desc: 'Building bot...' }
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
				desc: 'Formatting code...'
			},
			[
				...ALL_PACKAGE_NAMES.map(pkg => ({
					cmd: `pnpm --filter ${pkg} test`,
					desc: `Running tests in ${pkg}...`
				})),
				{ cmd: 'pnpm test', desc: 'Running bot tests...' }
			]
		]
	}
];

function runSingleCommand(cmd: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const p = spawn(cmd, { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });

		let stderr = '';
		let stdout = '';

		p.stdout.on('data', d => {
			stdout += d.toString();
			console.log(d.toString());
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

function run(c: Command, timings: Timings) {
	const start = performance.now();
	if (Array.isArray(c.cmd)) {
		return Promise.all(c.cmd.map(cmd => runSingleCommand(cmd))).then(() => {
			timings[c.desc] = performance.now() - start;
		});
	}
	return runSingleCommand(c.cmd).then(() => {
		timings[c.desc] = performance.now() - start;
	});
}

export const Root: React.FC = () => {
	const [stageIndex, setStageIndex] = useState(0);
	const [cmdIndex, setCmdIndex] = useState(0);
	const [status, setStatus] = useState<'running' | 'done' | 'error'>('running');
	const [error, setError] = useState<string | null>(null);
	const [timings, setTimings] = useState<Timings>({});
	const [_tick, setTick] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies:-
	useEffect(() => {
		const interval = setInterval(() => setTick(t => t + 1), 500);
		(async () => {
			try {
				for (let i = 0; i < stages.length; i++) {
					setStageIndex(i);
					for (let j = 0; j < stages[i]!.commands.length; j++) {
						setCmdIndex(j);
						const cmdGroup = stages[i]!.commands[j]!;
						if (Array.isArray(cmdGroup)) {
							await Promise.all(cmdGroup.map(c => run(c, timings)));
						} else {
							await run(cmdGroup, timings);
						}
						setTimings(t => ({ ...t, ...timings }));
					}
				}
				setStatus('done');
			} catch (err) {
				setError(String(err));
				setStatus('error');
			} finally {
				clearInterval(interval);
			}
		})();
	}, []);

	return (
		<Box flexDirection="column">
			<Text>Old School Bot</Text>
			{stages.map((s, i) => {
				const isCurrentStage = i === stageIndex;
				return (
					<Box key={s.name} flexDirection="column" marginLeft={2} display={!isCurrentStage ? 'none' : 'flex'}>
						<Text>
							{isCurrentStage ? '▶' : ' '} {s.name}
						</Text>
						{s.commands.map((c, j) => {
							const active = i === stageIndex && j === cmdIndex && status === 'running';
							const finished = i < stageIndex || (i === stageIndex && j < cmdIndex) || status === 'done';

							const cmds = Array.isArray(c) ? c : [c];

							return (
								<Box key={j} flexDirection="column" marginLeft={2}>
									{cmds.map(inner => {
										const elapsed = timings[inner.desc];
										const secs = elapsed ? (elapsed / 1000).toFixed(1) : null;

										return (
											<Box key={inner.cmd.toString()}>
												{active && !finished && (
													<Text color="yellow">
														<Spinner type="dots" /> {inner.desc}
													</Text>
												)}
												{finished && (
													<Text color="green">
														✔ Finished {inner.desc} in {secs}s
													</Text>
												)}
												{!active && !finished && <Text> {inner.desc}</Text>}
											</Box>
										);
									})}
								</Box>
							);
						})}
					</Box>
				);
			})}
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

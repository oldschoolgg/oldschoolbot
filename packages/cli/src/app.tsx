import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import type React from 'react';
import { useEffect, useState } from 'react';

type Command = { cmd: string | string[]; desc: string; condition?: boolean };
type CommandGroup = Command | Command[];

type Stage = {
	name: string;
	commands: CommandGroup[];
};

type Timings = Record<string, number>;
type Skips = Record<string, true>;

const ALL_PACKAGE_NAMES: string[] = readdirSync('packages').filter(
	name => !['test-dashboard', 'robochimp', 'cli', 'oldschoolgg'].includes(name)
);

const isUsingRealPostgres = process.env.USE_REAL_PG === '1';

// const isWikiBuild = process.argv.includes('--wiki');

const stages: Stage[] = [
	{
		name: 'Stage 1',
		commands: [
			{ cmd: 'pnpm install', desc: 'Installing dependencies...' },
			{ cmd: 'prisma db push', desc: 'Pushing Prisma schema...', condition: isUsingRealPostgres },
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
				['Rendering creatables file', 'creatables.ts'],
				['Rendering skilling data files', 'dataFiles.ts']
				// ['Wiki: Rendering monsters markdown', 'wiki/renderMonsters.ts'],
				// ['Wiki: Rendering trip buyables', 'wiki/tripBuyables.ts'],
				// ['Wiki: Rendering quests markdown', 'wiki/renderQuests.ts'],
				// ...(isWikiBuild
				// 	? [
				// 			['Wiki: Rendering mining snapshots', 'wiki/miningSnapshots.ts'],
				// 			['Wiki: Rendering authors', 'wiki/updateAuthors.ts']
				// 		]
				// 	: [])
			].map(script => ({
				cmd: `pnpm tsx --tsconfig scripts/tsconfig.json scripts/${script[1]}`,
				desc: script[0]
			})),
			{ cmd: 'tsx esbuild.mts', desc: 'Building bot...' }
		]
	},
	{
		name: 'Stage 3',
		commands: [
			{
				cmd: [
					'biome check --write --diagnostic-level=error',
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
				{ cmd: 'pnpm test:lint', desc: 'Running lint bot test...' },
				{ cmd: 'pnpm test:types', desc: 'Running types bot test...' },
				{ cmd: 'pnpm test:unit', desc: 'Running bot unit tests...' }
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
		});
		p.stderr.on('data', d => {
			stderr += d.toString();
		});

		p.on('close', code => {
			if (code === 0) resolve();
			else reject(new Error(`Command failed: ${cmd}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`));
		});
	});
}

function run(c: Command, timings: Timings, skipped: Skips) {
	if (c.condition === false) {
		skipped[c.desc] = true;
		if (timings[c.desc] === undefined) timings[c.desc] = 0;
		return Promise.resolve();
	}
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

const secs = (ms?: number) => (typeof ms === 'number' ? (ms / 1000).toFixed(1) : null);

export const Root: React.FC = () => {
	const [stageIndex, setStageIndex] = useState(0);
	const [cmdIndex, setCmdIndex] = useState(0);
	const [status, setStatus] = useState<'running' | 'done' | 'error'>('running');
	const [error, setError] = useState<string | null>(null);
	const [timings, setTimings] = useState<Timings>({});
	const [skipped, setSkipped] = useState<Skips>({});
	const [stageTimings, setStageTimings] = useState<Record<string, number>>({});
	const [_tick, setTick] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies:-
	useEffect(() => {
		const interval = setInterval(() => setTick(t => t + 1), 500);
		(async () => {
			try {
				for (let i = 0; i < stages.length; i++) {
					setStageIndex(i);
					const stageStart = performance.now();
					for (let j = 0; j < stages[i]!.commands.length; j++) {
						setCmdIndex(j);
						const cmdGroup = stages[i]!.commands[j]!;
						if (Array.isArray(cmdGroup)) await Promise.all(cmdGroup.map(c => run(c, timings, skipped)));
						else await run(cmdGroup, timings, skipped);
						setTimings(t => ({ ...t, ...timings }));
						setSkipped(s => ({ ...s, ...skipped }));
					}
					const stageElapsed = performance.now() - stageStart;
					setStageTimings(st => ({ ...st, [stages[i]!.name]: stageElapsed }));
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

	const renderStage = (s: Stage, i: number) => {
		const isCurrent = i === stageIndex && status === 'running';
		const isDone = stageTimings[s.name] !== undefined || (status === 'done' && i < stageIndex);
		const headerIcon = isCurrent ? '▶' : isDone ? '✔' : ' ';
		const stageSecs = secs(stageTimings[s.name]);

		return (
			<Box key={s.name} flexDirection="column">
				<Text color={isDone ? 'green' : isCurrent ? 'yellow' : undefined}>
					{headerIcon} {s.name} {isDone && stageSecs ? `(${stageSecs}s)` : ''}
				</Text>

				{s.commands.map((c, j) => {
					const active = i === stageIndex && j === cmdIndex && status === 'running';
					const finished = i < stageIndex || (i === stageIndex && j < cmdIndex) || status === 'done';
					const cmds = Array.isArray(c) ? c : [c];

					return (
						<Box key={`${s.name}-${j}`} flexDirection="column" marginLeft={4}>
							{cmds.map(inner => {
								const isSkipped = !!skipped[inner.desc];
								const elapsed = timings[inner.desc];
								const t = secs(elapsed);

								return (
									<Box key={inner.cmd.toString()}>
										{isSkipped && <Text color="gray">{inner.desc} (skipped)</Text>}
										{!isSkipped && active && !finished && (
											<Text color="yellow">
												<Spinner type="dots" /> {inner.desc}
											</Text>
										)}
										{!isSkipped && finished && (
											<Text color="green">
												✔ {inner.desc}
												{t ? ` (${t}s)` : ''}
											</Text>
										)}
										{!isSkipped && !active && !finished && <Text>{inner.desc}</Text>}
									</Box>
								);
							})}
						</Box>
					);
				})}
			</Box>
		);
	};

	return (
		<Box flexDirection="column">
			<Text>Old School Bot</Text>

			{status === 'running'
				? renderStage(stages[stageIndex]!, stageIndex)
				: stages.map((s, i) => renderStage(s, i))}

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

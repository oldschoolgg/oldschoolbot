import { exec } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import type React from 'react';
import { useEffect, useState } from 'react';

type Command = { cmd?: string | string[]; fn?: () => Promise<unknown> | unknown; desc: string; condition?: boolean };
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

const isWikiBuild = process.argv.includes('--wiki');

const runScriptFn = (fnName: string) => `pnpm cli:script ${fnName}`;

type Script = { desc: string; cmd: string };
const scripts: Script[] = [
	{ desc: 'Rendering commands file', cmd: runScriptFn('renderCommandsFile') },
	{ desc: 'Rendering monsters file', cmd: runScriptFn('createMonstersJson') },
	{ desc: 'Rendering creatables file', cmd: runScriptFn('renderCreatablesFile') },
	{ desc: 'Rendering skilling data files', cmd: runScriptFn('renderDataFiles') },
	{ desc: 'Wiki: Rendering clue boosts', cmd: runScriptFn('clueBoosts') },
	{ desc: 'Wiki: Rendering monsters markdown', cmd: runScriptFn('renderMonstersMarkdown') },
	{ desc: 'Wiki: Rendering cox markdown', cmd: runScriptFn('renderCoxMarkdown') },
	{ desc: 'Wiki: Rendering trip buyables', cmd: runScriptFn('renderTripBuyables') },
	{ desc: 'Wiki: Rendering quests markdown', cmd: runScriptFn('renderQuestsMarkdown') },
	...(isWikiBuild
		? [
				{
					desc: 'Wiki: Rendering fishing snapshots',
					cmd: runScriptFn('renderFishingXpHrTable')
				},
				{
					desc: 'Wiki: Rendering mining snapshots',
					cmd: runScriptFn('renderMiningXpHrTable')
				},
				{ desc: 'Wiki: Rendering authors', cmd: runScriptFn('updateAuthors') }
			]
		: [])
];

const stages: Stage[] = [
	{
		name: 'Stage 1',
		commands: [
			{ cmd: 'pnpm install', desc: 'Installing dependencies...' },
			[
				{ cmd: 'prisma db push', desc: 'Pushing Prisma schema...', condition: isUsingRealPostgres },
				{ cmd: 'pnpm generate:robochimp', desc: 'Generating RoboChimp...' },
				{ cmd: 'prisma generate', desc: 'Generating Prisma Client...', condition: isUsingRealPostgres },
				{ cmd: 'pnpm build:packages', desc: 'Building packages...' }
			]
		]
	},
	{
		name: 'Stage 2',
		commands: [
			[
				...scripts.map(s => ({
					cmd: s.cmd,
					desc: s.desc
				})),
				{ cmd: 'tsx esbuild.mts', desc: 'Building bot...' },
				{
					cmd: ['biome check --write --diagnostic-level=error'],
					desc: 'Formatting code with biome...'
				},
				{
					cmd: [
						'concurrently "prettier --use-tabs --write \'**/*.{yaml,yml,css,html}\'" "prisma format --schema ./prisma/robochimp.prisma" "prisma format --schema ./prisma/schema.prisma"'
					],
					desc: 'Formatting code...'
				}
			]
		]
	},
	{
		name: 'Stage 3',
		commands: [
			[
				{
					cmd: `pnpm -r ${ALL_PACKAGE_NAMES.map(pkg => `--filter ${pkg}`).join(' ')} test:unit`,
					desc: `Running packages tests in ${ALL_PACKAGE_NAMES.join(', ')}...`
				}
			],
			[
				{
					cmd: ['pnpm test:lint'],
					desc: 'Running formatting tests...'
				},
				{ cmd: 'pnpm test:types', desc: 'Running types bot test...' },
				{ cmd: 'pnpm test:unit', desc: 'Running bot unit tests...' }
			]
		]
	}
];

function runSingleCommand(cmd: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const p = exec(cmd);

		let stderr = '';
		let stdout = '';

		p.stdout?.on('data', (d: string) => {
			stdout += d;
		});
		p.stderr?.on('data', (d: string) => {
			stderr += d;
		});

		p.on('error', (err: Error) => {
			reject(new Error(`Failed to start command: ${cmd}\n\n${err.message}`));
		});

		p.on('close', (code: number | null) => {
			if (code === 0) {
				resolve();
			} else reject(new Error(`Command failed: ${cmd}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`));
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
	if (c.fn) {
		return Promise.resolve(c.fn()).then(() => {
			timings[c.desc] = performance.now() - start;
		});
	}
	if (Array.isArray(c.cmd)) {
		return Promise.all(c.cmd.map(cmd => runSingleCommand(cmd))).then(() => {
			timings[c.desc] = performance.now() - start;
		});
	}
	return runSingleCommand(c.cmd!).then(() => {
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
									<Box key={inner.desc}>
										{isSkipped && <Text color="gray">{inner.desc} (skipped)</Text>}
										{!isSkipped && active && !finished && (
											<Text color="yellow">
												<Spinner type="dots" /> {inner.desc}
											</Text>
										)}
										{!isSkipped && finished && (
											<Text color="green">
												✔ {inner.desc}
												{t ? (elapsed < 200 ? ` (${Math.floor(elapsed)}ms)` : ` (${t}s)`) : ''}
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

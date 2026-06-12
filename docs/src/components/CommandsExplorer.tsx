import { useEffect, useMemo, useState } from 'preact/hooks';

import {
	type CommandNode,
	formatChoiceDisplay,
	getNodeSearchText,
	normalizeExample,
	toAnchorId
} from './commandsExplorerUtils.js';

type CommandsExplorerProps = {
	nodes: CommandNode[];
	introText: string;
	totalLabel: string;
	totalCommands: number;
	generatedAt?: string;
};

type NodeCardProps = {
	node: CommandNode;
	level: number;
	isVisible: (path: string) => boolean;
	isExpanded: (path: string) => boolean;
	onToggle: (path: string) => void;
};

function CommandNodeCard({ node, level, isVisible, isExpanded, onToggle }: NodeCardProps) {
	const headingLevel = Math.max(2, Math.min(level, 6));
	const headingText = `/${node.path}`;
	const headingId = toAnchorId(node.path);
	const isTopLevel = level === 2;

	const optionsCount = node.options.length;
	const subcommandsCount = node.subcommands.length;
	const examplesCount = node.examples?.length ?? 0;
	const hasDetails = optionsCount > 0 || examplesCount > 0 || subcommandsCount > 0;
	const expanded = hasDetails && isExpanded(node.path);

	if (!isVisible(node.path)) return null;

	const detailSections = [
		optionsCount > 0 ? 'Options' : null,
		examplesCount > 0 ? 'Examples' : null,
		subcommandsCount > 0 ? 'Subcommands' : null
	]
		.filter((section): section is string => Boolean(section))
		.join(' . ');

	const sortedOptions = [...node.options].sort((a, b) => Number(b.required) - Number(a.required));
	const showChoicesColumn = node.options.some(option => (option.choices?.length ?? 0) > 0);
	const showMinColumn = node.options.some(option => option.min != null);
	const showMaxColumn = node.options.some(option => option.max != null);

	return (
		<section
			data-command-node
			data-path={node.path}
			data-anchor-id={headingId}
			data-top-level={isTopLevel ? 'true' : 'false'}
		>
			<div className={`command-card ${isTopLevel ? 'command-card-top' : 'command-card-sub'}`}>
				<div className={`command-header ${hasDetails ? 'command-header-clickable' : ''}`}>
					<div className="command-header-text">
						{headingLevel === 2 && (
							<h2>
								<button
									id={headingId}
									className="command-heading-copy discord_command_copy"
									data-command={headingText}
									type="button"
									aria-label="Copy command"
								>
									{headingText}
								</button>
							</h2>
						)}
						{headingLevel === 3 && (
							<h3>
								<button
									id={headingId}
									className="command-heading-copy discord_command_copy"
									data-command={headingText}
									type="button"
									aria-label="Copy command"
								>
									{headingText}
								</button>
							</h3>
						)}
						{headingLevel === 4 && (
							<h4>
								<button
									id={headingId}
									className="command-heading-copy discord_command_copy"
									data-command={headingText}
									type="button"
									aria-label="Copy command"
								>
									{headingText}
								</button>
							</h4>
						)}
						{headingLevel === 5 && (
							<h5>
								<button
									id={headingId}
									className="command-heading-copy discord_command_copy"
									data-command={headingText}
									type="button"
									aria-label="Copy command"
								>
									{headingText}
								</button>
							</h5>
						)}
						{headingLevel === 6 && (
							<h6>
								<button
									id={headingId}
									className="command-heading-copy discord_command_copy"
									data-command={headingText}
									type="button"
									aria-label="Copy command"
								>
									{headingText}
								</button>
							</h6>
						)}
						<p className="command-description">{node.description}</p>
						{hasDetails && detailSections && <p className="command-detail-hint">{detailSections}</p>}
					</div>
					{hasDetails && (
						<button
							type="button"
							className="command-toggle-pill"
							onClick={() => onToggle(node.path)}
							aria-expanded={expanded}
							aria-controls={`${headingId}-details`}
						>
							{expanded ? 'Collapse' : 'Expand'}
						</button>
					)}
				</div>

				{hasDetails && expanded && (
					<div id={`${headingId}-details`} data-command-details>
						{optionsCount > 0 && (
							<>
								<h3>Options</h3>
								<table className="command-options-table">
									<thead>
										<tr>
											<th>Name</th>
											<th>Type</th>
											<th>Required</th>
											<th>Description</th>
											{showChoicesColumn && <th>Choices</th>}
											{showMinColumn && <th>Min</th>}
											{showMaxColumn && <th>Max</th>}
										</tr>
									</thead>
									<tbody>
										{sortedOptions.map(option => (
											<tr key={`${node.path}:${option.name}`}>
												<td>
													<code>{option.name}</code>
												</td>
												<td>
													<code>{option.type}</code>
												</td>
												<td>{option.required ? 'Yes' : 'No'}</td>
												<td>{option.description}</td>
												{showChoicesColumn && (
													<td>
														{option.choices?.length ? (
															<div className="command-choice-list">
																{option.choices.map(choice => (
																	<code
																		key={`${node.path}:${option.name}:${choice.name}:${String(choice.value)}`}
																		className="command-choice"
																	>
																		{formatChoiceDisplay(choice)}
																	</code>
																))}
															</div>
														) : (
															''
														)}
													</td>
												)}
												{showMinColumn && <td>{option.min ?? ''}</td>}
												{showMaxColumn && <td>{option.max ?? ''}</td>}
											</tr>
										))}
									</tbody>
								</table>
							</>
						)}

						{examplesCount > 0 && (
							<>
								<h3>Examples</h3>
								<ul>
									{(node.examples ?? []).map(example => {
										const command = normalizeExample(example);
										return (
											<li key={`${node.path}:example:${command}`}>
												<button
													className="discord_command_copy"
													data-command={command}
													type="button"
													aria-label="Copy command"
												>
													{command}
												</button>
											</li>
										);
									})}
								</ul>
							</>
						)}

						{subcommandsCount > 0 && (
							<div data-command-children>
								<h3>Subcommands</h3>
								{node.subcommands.map(subcommand => (
									<CommandNodeCard
										key={subcommand.path}
										node={subcommand}
										level={Math.min(level + 1, 6)}
										isVisible={isVisible}
										isExpanded={isExpanded}
										onToggle={onToggle}
									/>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</section>
	);
}

export function CommandsExplorer({ nodes, introText, totalLabel, totalCommands, generatedAt }: CommandsExplorerProps) {
	const [filterText, setFilterText] = useState('');
	const [manualExpandedPaths, setManualExpandedPaths] = useState<Set<string>>(new Set());

	const nodeIndex = useMemo(() => {
		const allNodes: CommandNode[] = [];
		const parentByPath = new Map<string, string | null>();
		const searchTextByPath = new Map<string, string>();
		const pathByAnchor = new Map<string, string>();

		const walk = (node: CommandNode, parentPath: string | null) => {
			allNodes.push(node);
			parentByPath.set(node.path, parentPath);
			searchTextByPath.set(node.path, getNodeSearchText(node));
			pathByAnchor.set(toAnchorId(node.path), node.path);
			for (const subcommand of node.subcommands) {
				walk(subcommand, node.path);
			}
		};

		for (const node of nodes) {
			walk(node, null);
		}

		return { allNodes, parentByPath, searchTextByPath, pathByAnchor };
	}, [nodes]);

	const normalizedFilter = filterText.trim().toLowerCase();
	const hasFilter = normalizedFilter.length > 0;

	const visiblePaths = useMemo(() => {
		if (!hasFilter) {
			return new Set(nodeIndex.allNodes.map(node => node.path));
		}

		const visible = new Set<string>();
		for (const node of nodeIndex.allNodes) {
			const searchText = nodeIndex.searchTextByPath.get(node.path) ?? '';
			if (!searchText.includes(normalizedFilter)) continue;

			visible.add(node.path);
			let currentPath: string | null | undefined = node.path;
			while (currentPath) {
				const parentPath = nodeIndex.parentByPath.get(currentPath);
				if (!parentPath) break;
				visible.add(parentPath);
				currentPath = parentPath;
			}
		}
		return visible;
	}, [hasFilter, nodeIndex, normalizedFilter]);

	const autoExpandedPaths = useMemo(() => {
		if (!hasFilter) return new Set<string>();
		return new Set(visiblePaths);
	}, [hasFilter, visiblePaths]);

	const resultsCount = useMemo(() => {
		if (!hasFilter) return 0;
		let count = 0;
		for (const node of nodeIndex.allNodes) {
			const searchText = nodeIndex.searchTextByPath.get(node.path) ?? '';
			if (searchText.includes(normalizedFilter)) {
				count += 1;
			}
		}
		return count;
	}, [hasFilter, nodeIndex, normalizedFilter]);

	const isVisible = (path: string) => visiblePaths.has(path);
	const isExpanded = (path: string) => manualExpandedPaths.has(path) || autoExpandedPaths.has(path);

	const togglePath = (path: string) => {
		setManualExpandedPaths(prev => {
			const next = new Set(prev);
			if (next.has(path)) {
				next.delete(path);
			} else {
				next.add(path);
			}
			return next;
		});
	};

	const expandPathAndParents = (path: string) => {
		setManualExpandedPaths(prev => {
			const next = new Set(prev);
			let currentPath: string | null | undefined = path;
			while (currentPath) {
				next.add(currentPath);
				currentPath = nodeIndex.parentByPath.get(currentPath);
			}
			return next;
		});
	};

	useEffect(() => {
		const expandForHash = () => {
			const hashValue = decodeURIComponent(window.location.hash.replace(/^#/, '')).trim().toLowerCase();
			if (!hashValue) return;
			const path = nodeIndex.pathByAnchor.get(hashValue);
			if (!path) return;
			expandPathAndParents(path);
		};

		expandForHash();
		window.addEventListener('hashchange', expandForHash);
		return () => window.removeEventListener('hashchange', expandForHash);
	}, [nodeIndex.pathByAnchor]);

	return (
		<section data-commands-root>
			<div className="commands-controls">
				<div className="commands-control-row">
					<label htmlFor="command-filter">
						<strong>Search commands</strong>
					</label>
					<div className="commands-input-row">
						<input
							id="command-filter"
							type="search"
							className="input commands-input"
							value={filterText}
							onInput={e => setFilterText(e.currentTarget.value)}
							placeholder="Search by command, path, description, option, or choice..."
						/>
						{hasFilter && (
							<button type="button" className="button commands-clear" onClick={() => setFilterText('')}>
								Clear
							</button>
						)}
					</div>
					{hasFilter && (
						<p>
							{resultsCount} result{resultsCount === 1 ? '' : 's'}
						</p>
					)}
				</div>

				<div className="commands-control-row">
					<label htmlFor="command-jump">
						<strong>Jump to command</strong>
					</label>
					<select
						id="command-jump"
						className="input commands-select"
						onChange={e => {
							const anchor = String(e.currentTarget.value ?? '')
								.trim()
								.toLowerCase();
							if (!anchor) return;
							const path = nodeIndex.pathByAnchor.get(anchor);
							if (!path) return;
							expandPathAndParents(path);
							window.location.hash = anchor;
							e.currentTarget.value = '';
						}}
					>
						<option value="">Select a command...</option>
						{nodeIndex.allNodes.map(command => (
							<option key={command.path} value={toAnchorId(command.path)}>
								/{command.path}
							</option>
						))}
					</select>
				</div>
			</div>

			<p>{introText}</p>
			<p>
				<strong>{totalLabel}:</strong> {totalCommands}
			</p>
			{generatedAt && (
				<p>
					<strong>Generated:</strong> {new Date(generatedAt).toUTCString()}
				</p>
			)}

			{nodes.map(node => (
				<CommandNodeCard
					key={node.path}
					node={node}
					level={2}
					isVisible={isVisible}
					isExpanded={isExpanded}
					onToggle={togglePath}
				/>
			))}
		</section>
	);
}

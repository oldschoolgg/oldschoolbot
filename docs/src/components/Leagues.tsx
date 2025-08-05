import combatAchievements from '@data/combat_achievements.json';
import { useEffect, useState } from 'preact/hooks';
import { toTitleCase } from '../docs-util.js';

const tiers = Object.keys(combatAchievements).map(t => t.toLowerCase());
const allTasksFlat = Object.values(combatAchievements).flatMap((tier: any) =>
	tier.tasks.map((t: any) => ({ ...t, tier: tier.name.toLowerCase() }))
);

export type APIUser = {
	id: string;
	completed_ca_task_ids: number[];
	is_ironman: boolean;
	leagues_completed_tasks_ids: number[];
};

export function Leagues() {
	const [tiersBeingShown, setTiersBeingShown] = useState(tiers);
	const [tasksBeingShown, setTasksBeingShown] = useState(allTasksFlat);
	const [hideCompleted, setHideCompleted] = useState(false);
	const [userID, setUserID] = useState<string | null>(null);
	const [data, setData] = useState<APIUser | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setTasksBeingShown(
			allTasksFlat.filter(task => {
				if (hideCompleted && data?.completed_ca_task_ids.includes(task.id)) return false;
				return tiersBeingShown.includes(task.tier);
			})
		);
	}, [tiersBeingShown, data, hideCompleted]);

	useEffect(() => {
		if (localStorage) {
			const storedUserID = localStorage.getItem('userID');
			if (storedUserID) setUserID(storedUserID);

			const storedData = localStorage.getItem(`minion.${storedUserID}`);
			if (storedData) setData(JSON.parse(storedData));
		}
	}, []);

	return (
		<>
			<div className="mt-3">
				<div className="flex flex-col">
					<label for="user" className="font-bold">
						Discord User ID
					</label>
					<div className="no_margin">
						<input
							id="user"
							name="user"
							value={userID ?? ''}
							onInput={e => setUserID(e.currentTarget.value)}
							className="w-52 input"
						/>
						<button
							className="button"
							type="submit"
							disabled={isLoading || !userID}
							onClick={() => {
								setIsLoading(true);
								localStorage.setItem('userID', userID!);
								fetch(`https://api.oldschool.gg/minion/${userID}`)
									.then(response => response.json())
									.then(data => {
										setData(data);
										if (localStorage) {
											localStorage.setItem(`minion.${userID}`, JSON.stringify(data));
										}
									})
									.finally(() => setIsLoading(false));
							}}
						>
							Look Up
						</button>
					</div>
				</div>
				<fieldset>
					<legend className="text-2xl font-bold"> Filters</legend>
					<div className="flex flex-row flex-wrap gap-4">
						{tiers.map(t => (
							<div key={t} class="p-1 no_margin w-max">
								<input
									type="checkbox"
									id={t}
									name={t}
									checked={tiersBeingShown.includes(t)}
									onChange={() => {
										tiersBeingShown.includes(t)
											? setTiersBeingShown(tiersBeingShown.filter(i => i !== t))
											: setTiersBeingShown([...tiersBeingShown, t]);
									}}
								/>
								<label className="ml-2" for={t}>
									{toTitleCase(t)}
								</label>
							</div>
						))}
					</div>
					<div class="p-1 no_margin w-max">
						<input
							id="hide_completed"
							type="checkbox"
							name="Hide Completed"
							checked={hideCompleted}
							onChange={() => setHideCompleted(!hideCompleted)}
						/>
						<label className="ml-2" for="hide_completed	">
							Hide Completed Tasks
						</label>
					</div>
				</fieldset>
				{data ? (
					<p>
						Showing {tasksBeingShown.length}/{allTasksFlat.length} tasks{' / '}
						Completed {data.completed_ca_task_ids.length}/{allTasksFlat.length} tasks
					</p>
				) : null}
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Description</th>
							<th>Chance</th>
							<th>Tier</th>
						</tr>
					</thead>
					<tbody>
						{tasksBeingShown.map(task => (
							<tr
								key={task.id}
								className={data?.completed_ca_task_ids.includes(task.id) ? 'ca-complete' : undefined}
							>
								<td>{task.name}</td>
								<td>{task.desc}</td>
								<td>{task.rng?.chancePerKill > 1 ? `1 / ${task.rng?.chancePerKill}` : undefined}</td>
								<td>{toTitleCase(task.tier)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}

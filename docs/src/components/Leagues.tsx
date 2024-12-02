import combatAchievements from '@data/combat_achievements.json';
import { useEffect, useState } from 'preact/hooks';

function toTitleCase(str: string) {
	const splitStr = str.toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(' ');
}

const tiers = Object.keys(combatAchievements).map(t => t.toLowerCase());
const allTasksFlat = Object.values(combatAchievements).flatMap((tier: any) =>
	tier.tasks.map(t => ({ ...t, tier: tier.name.toLowerCase() }))
);
export function Leagues() {
	const [tiersBeingShown, setTiersBeingShown] = useState(tiers);
	const [tasksBeingShown, setTasksBeingShown] = useState(allTasksFlat);
	const [userID, setUserID] = useState<string | null>(null);
	// const [data, setData] = useState();

	// console.log({data});
	// useEffect(() => {
	// 	fetch('https://api.oldschool.gg/')
	// 		.then(response => response.json())
	// 		.then(data => setData(data));
	// }, []);

	useEffect(() => {
		setTasksBeingShown(allTasksFlat.filter(task => tiersBeingShown.includes(task.tier)));
	}, [tiersBeingShown]);

	return (
		<>
			<div className="mt-3">
				{/* <div className="flex flex-col">
					<label for="user" className="text-lg font-bold">
						User ID
					</label>
					<div>
						<input
							id="user"
							name="user"
							value={userID ?? ''}
							onInput={e => setUserID(e.currentTarget.value)}
							className="w-52"
						/>
						<button type="submit" disabled={!userID}>
							Look Up
						</button>
					</div>
				</div> */}
				<fieldset>
					<legend className="text-2xl font-bold"> Filters</legend>
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
				</fieldset>
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Description</th>
							<th>Tier</th>
						</tr>
					</thead>
					<tbody>
						{tasksBeingShown.map(task => (
							<tr key={task.id}>
								<td>{task.name}</td>
								<td>{task.desc}</td>
								<td>{toTitleCase(task.tier)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}

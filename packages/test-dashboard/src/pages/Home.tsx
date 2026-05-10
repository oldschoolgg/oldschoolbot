import type {
	ITestBotData,
	ITestBotPrivateUser,
	ITestBotWebsocketEvent
} from '@oldschoolgg/toolkit/test-bot-websocket';
import { useEffect, useState } from 'preact/hooks';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import itemDataUrl from '../../../oldschooljs/src/assets/item_data.json?url';

type Item = {
	id: string;
	name: string;
};

const servers = [
	{
		name: 'Magnaboy BSO',
		url: 'https://bso-server.magnaboy.com'
	}
];

function Bank({
	privateUserData,
	itemData
}: {
	privateUserData: ITestBotPrivateUser | null;
	itemData: Record<string, Item>;
}) {
	const [bankSearchString, setBankSearching] = useState<string>('');

	return (
		<>
			<input
				type="text"
				placeholder="Search items..."
				className="input"
				onInput={e => {
					const searchTerm = e.currentTarget.value.toLowerCase();
					setBankSearching(searchTerm);
				}}
			/>
			<div className="flex flex-row flex-wrap gap-3 bg-[#3d3426] p-4 py-8 font-osrs-compact text_black_outline_sm items-center justify-center">
				{privateUserData &&
					Object.entries(privateUserData.raw_user_data.bank)
						.map(([itemId, quantity]) => {
							const item = itemData[itemId];
							if (!item) return { item: { id: itemId, name: 'BROKEN' }, quantity: quantity };
							return {
								item,
								quantity
							};
						})
						.filter(({ item }) => {
							if (bankSearchString && !item.name.toLowerCase().includes(bankSearchString.toLowerCase()))
								return false;
							return true;
						})
						.sort((a, b) => {
							return a.item.name.localeCompare(b.item.name);
						})
						.map(({ item, quantity }) => {
							return (
								<div key={item.id} className="relative w-10 h-10 flex items-center justify-center">
									<img
										className="pixelated"
										src={`https://cdn.oldschool.gg/icons/items/${item.id}.png`}
										alt={item.name}
										title={item.name}
									/>
									{/* <span className="font-semibold">{item.name}</span> */}
									<span className="absolute -bottom-2 right-1/2 translate-x-1/2">x{quantity}</span>
								</div>
							);
						})}
			</div>
		</>
	);
}

function Stats({ privateUserData }: { privateUserData: ITestBotPrivateUser }) {
	return (
		<div className="grid grid-cols-3 bg-[#3d3426] font-osrs-compact text_black_outline_sm items-center justify-center w-max">
			{Object.entries(privateUserData.skills_as_levels).map(([skill, level], idx) => {
				return (
					<div
						key={skill}
						className="flex items-center justify-end flex-row p-2 px-2 gap-2"
						style={{
							background: idx % 2 === 0 ? '#4a4133' : '#3d3426'
						}}
					>
						<div className={'flex flex-col justify-end items-end mr-0.5'}>
							<span className="text-3xl" style={{ lineHeight: '20px' }}>
								{level}
							</span>
							<span className="" style={{ lineHeight: '12px' }}>
								{privateUserData.skills_as_xp[skill].toLocaleString()} XP
							</span>
						</div>

						<div className="w-10 h-10 flex items-center justify-center scale-110">
							<img
								className="pixelated object-contain"
								src={`https://cdn.oldschool.gg/icons/skills/${skill}.png`}
								title={skill}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export function Home() {
	const [itemData, setItemData] = useState<Record<string, Item>>({});
	const [code, setCode] = useState<string>(localStorage.getItem('test-bot-code') ?? '');
	const [server, setServer] = useState<string>(servers[0].name);
	const [data, setData] = useState<ITestBotData | null>(null);
	const [privateUserData, setPrivateUserData] = useState<ITestBotPrivateUser | null>(null);

	useEffect(() => {
		fetch(itemDataUrl)
			.then(response => response.json())
			.then(_data => {
				setItemData(_data as Record<string, Item>);
			})
			.catch(error => console.error('Error fetching item data:', error));
	}, []);

	const { sendMessage, readyState } = useWebSocket(`${servers.find(s => s.name === server)!.url}/ws`, {
		onMessage: (event: any) => {
			if (event.data === 'ping') return;
			try {
				const msg = JSON.parse(event.data);
				switch (msg.type) {
					case 'data_update': {
						setData(msg.data);
						break;
					}
					case 'private_user_update': {
						setPrivateUserData(msg.data);
						break;
					}
					case 'auth_response': {
						if (!msg.data.success) {
							alert('Authentication failed');
						}
						break;
					}
				}
				console.log('Received message:', msg);
			} catch (error) {
				console.error('Failed to parse message:', error);
			}
		},
		onError: (event: any) => console.error('WebSocket error:', event),
		reconnectAttempts: 50,
		reconnectInterval: attempts => 5000 * Math.min(attempts, 50) + 5000,
		retryOnError: true,
		shouldReconnect: () => true,
		onOpen: () => {
			console.log(`${new Date().toLocaleTimeString()} WebSocket connection established`);
			if (privateUserData === null && Boolean(code)) {
				sendMessage(
					JSON.stringify({
						type: 'auth_request',
						data: {
							code
						}
					})
				);
			}
		}
	});

	function sendWebSocketMessage(message: ITestBotWebsocketEvent) {
		sendMessage(JSON.stringify(message));
	}

	// useEffect(() => {
	// 	if (readyState === ReadyState.OPEN && privateUserData === null && Boolean(code)) {
	// 		onSubmitCode();
	// 	}
	// }, [
	// 	privateUserData,
	// 	code
	// ]);

	function onSubmitCode() {
		localStorage.setItem('test-bot-code', code);
		sendWebSocketMessage({
			type: 'auth_request',
			data: {
				code
			}
		});
	}

	const userSection =
		privateUserData === null ? (
			<div>
				<label for="code" className="font-bold text-2xl">
					Linking Code
				</label>
				<div className="flex flex-row items-center gap-2">
					<input
						id="code"
						name="code"
						className="max-w-24 mb-0!"
						value={code}
						onInput={e => setCode(e.currentTarget.value)}
					/>
					<button
						disabled={readyState !== ReadyState.OPEN}
						style={{ opacity: readyState !== ReadyState.OPEN ? 0.5 : undefined }}
						onClick={() => onSubmitCode()}
					>
						Submit
					</button>
				</div>
			</div>
		) : (
			<div className="flex flex-row items-center gap-2 justify-center">
				<img src={privateUserData.avatar_url!} className="w-6 h-6 rounded-full border border-black/30" />
				<div className="flex flex-col items-start">
					<span className="">{privateUserData?.username}</span>
				</div>
			</div>
		);

	return (
		<div>
			<div className="flex flex-col items-center justify-between px-4 py-4 max-w-3xl mx-auto w-full">
				<div className="flex flex-row items-center justify-between w-full mb-12">
					<div className="flex flex-col items-start justify-around gap-2">
						<div className="flex flex-row items-center gap-2 justify-center">
							{data?.avatar_url && (
								<img src={data.avatar_url} className="w-6 h-6 rounded-full border border-black/30" />
							)}
							<div className="flex flex-col items-start">
								<span className="font-semibold">{data?.username}</span>
								<div className="flex flex-row items-center gap-2">
									<span className="text-sm">{data?.bot_type}</span>

									{readyState === ReadyState.OPEN && (
										<span className="text-green-700 text-sm font-semibold">Connected</span>
									)}
									{[ReadyState.CLOSED, ReadyState.CLOSING].includes(readyState) && (
										<span className="text-red-700 text-sm font-semibold">Disconnected</span>
									)}
									{readyState === ReadyState.CONNECTING && (
										<span className="text-orange-700 text-sm font-semibold">Connecting...</span>
									)}
								</div>
							</div>
						</div>
						{userSection}
					</div>
					<div className="flex flex-col justify-around gap-2">
						<select
							disabled={false}
							className=""
							value={server}
							onChange={e => setServer(e.currentTarget.value)}
						>
							{servers.map(option => (
								<option key={option.name} value={option.name}>
									{option.name}
								</option>
							))}
						</select>
					</div>
				</div>

				{privateUserData && (
					<div>
						<div>
							<h1 className="text-xl">Recent Trips</h1>
							<ol className="list-decimal list-inside">
								{privateUserData.recent_trips.map((trip, i) => {
									return <li key={i}>{trip}</li>;
								})}
							</ol>
						</div>

						<div className="my-12" />
						<div>
							<h1 className="text-xl">Stats</h1>
							<Stats privateUserData={privateUserData} />
						</div>

						<div className="my-12" />

						<div>
							<h1 className="text-xl">Bank</h1>
							<Bank privateUserData={privateUserData} itemData={itemData} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

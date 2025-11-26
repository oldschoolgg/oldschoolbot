// import { DateTime } from 'luxon';
// import { lazy } from 'react';
// import { useEffect, useState } from 'react';
// import { Link, Route, Switch } from 'wouter-preact';

// import { fullTzToShortTzMap } from '@worp/universal/dateTime';

// import { CopyToClipboard } from '@/components/CopyToClipboard.tsx';
// import { Input } from '@/components/Input/input.tsx';
// import { LabelledSwitch } from '@/components/Input/LabelledSwitch.tsx';
// import { NumberInput } from '@/components/Input/NumberInput.tsx';
// import { TimezoneSelect } from '@/components/Input/TimezoneSelect.tsx';
// import { OVERLAY_TEXT_DEFAULTS } from '@/components/StyledText.tsx';
// import { FormGroup } from '@/components/ui/FormGroup.tsx';
// import { FormPart } from '@/components/ui/FormPart.tsx';
// import { Textarea } from '../components/Input/textarea.tsx';
// import { Text } from './Widgets/Text.tsx';

// const Countdown = lazy(() => import('./Widgets/Countdown.tsx').then(r => r.Countdown));
// const Clock = lazy(() => import('../overlay/widgets/Clock.tsx').then(r => r.Clock));
// const OBSBrowserSourceURLModal = lazy(() =>
// 	import('./Dashboard/components/OBSBrowserSourceURL.tsx').then(r => r.OBSBrowserSourceURLModal)
// );

// const OverlayPreview: React.FC<{ fullSize?: boolean }> = ({ children, fullSize = false }) => {
// 	return (
// 		<FormPart label="Preview" key={new Date().toISOString()}>
// 			<div
// 				style={{
// 					width: 'max-content'
// 				}}
// 				className="border-4 border-red-500"
// 			>
// 				<div
// 					className="bg-white relative"
// 					style={{
// 						zoom: fullSize ? 0.3 : undefined
// 					}}
// 				>
// 					{children}
// 				</div>
// 			</div>
// 		</FormPart>
// 	);
// };

// const CountdownURLGenerator = () => {
// 	const [text, setText] = useState('Finished at');
// 	const [timezone, setTimezone] = useState('Asia/Tokyo');
// 	const [datetime, setDatetime] = useState(() => {
// 		const now = DateTime.now().plus({ hours: 1 }).setZone(timezone);
// 		return now.toFormat("yyyy-MM-dd'T'HH:mm");
// 	});
// 	const [showSeconds, setShowSeconds] = useState(false);
// 	const [url, setUrl] = useState('');

// 	useEffect(() => {
// 		const tzStr = fullTzToShortTzMap[timezone] ?? timezone;

// 		const date = datetime ? DateTime.fromISO(datetime, { zone: timezone }) : DateTime.now().setZone(timezone);

// 		const dateStr = date.toFormat('yyyy/MM/dd');
// 		const timeStr = date.toFormat('h:mm') + date.toFormat('a').toLowerCase();

// 		const newUrl = `https://worp.tv/widget/countdown?text=${encodeURIComponent(
// 			text.replace(/ /g, '_')
// 		)}&date=${dateStr}&time=${timeStr}&tz=${tzStr}${showSeconds ? '&show_seconds=yes' : ''}`;
// 		setUrl(newUrl);
// 	}, [text, datetime, timezone, showSeconds]);

// 	const date = datetime ? DateTime.fromISO(datetime, { zone: timezone }) : DateTime.now().setZone(timezone);

// 	return (
// 		<div className="w-full max-w-full space-y-3">
// 			<FormPart label="Text">
// 				<Input id="text" value={text} onChange={e => setText(e.currentTarget.value)} />
// 			</FormPart>

// 			<FormGroup>
// 				<FormPart label="Date & Time">
// 					<Input
// 						id="datetime"
// 						type="datetime-local"
// 						value={datetime}
// 						onChange={e => setDatetime(e.currentTarget.value)}
// 					/>
// 				</FormPart>

// 				<div className="max-w-52">
// 					<FormPart label="Timezone">
// 						<TimezoneSelect value={timezone} onChange={e => setTimezone(e)} />
// 					</FormPart>
// 				</div>
// 			</FormGroup>

// 			<div className="max-w-40">
// 				<FormPart label="">
// 					<div className="flex items-center space-x-2">
// 						<LabelledSwitch
// 							label="Show seconds"
// 							isChecked={showSeconds}
// 							onCheckedChange={checked => setShowSeconds(checked)}
// 						/>
// 					</div>
// 				</FormPart>
// 			</div>
// 			<FormPart label="Browser Source URL" className="max-w-full w-full">
// 				<CopyToClipboard url={url} />
// 			</FormPart>

// 			<OverlayPreview>
// 				<Countdown targetTime={date} text={text} showSeconds={showSeconds} />
// 			</OverlayPreview>
// 		</div>
// 	);
// };

// const TextURLGenerator = () => {
// 	const [text, setText] = useState('Hello World!');
// 	const [url, setUrl] = useState('');
// 	const [size, setSize] = useState<number>(OVERLAY_TEXT_DEFAULTS.fontSize);
// 	const [outlineWidth, setOutlineWidth] = useState<number>(OVERLAY_TEXT_DEFAULTS.outlineWidth);

// 	useEffect(() => {
// 		const params = new URLSearchParams();
// 		params.set('text', text.replace(/ /g, '_'));
// 		if (size !== OVERLAY_TEXT_DEFAULTS.fontSize) params.set('size', size.toString());
// 		if (outlineWidth !== OVERLAY_TEXT_DEFAULTS.outlineWidth) params.set('outlinewidth', outlineWidth.toString());
// 		const newUrl = `https://worp.tv/widget/text?${params.toString()}`;
// 		setUrl(newUrl);
// 	}, [text, size, outlineWidth]);

// 	return (
// 		<div className="w-full max-w-2xl space-y-3">
// 			<FormPart label="Text">
// 				<Textarea id="text" value={text} onChange={e => setText(e.currentTarget.value)} />
// 			</FormPart>

// 			<FormGroup>
// 				<FormPart label="Size" className="max-w-36">
// 					<NumberInput value={size} onChange={setSize} />
// 				</FormPart>

// 				<FormPart label="Outline Width" className="max-w-36">
// 					<NumberInput value={outlineWidth} onChange={setOutlineWidth} />
// 				</FormPart>
// 			</FormGroup>

// 			<FormPart label="Browser Source URL">
// 				<CopyToClipboard url={url} />
// 			</FormPart>
// 			<OBSBrowserSourceURLModal url={url} hdSize={false} />

// 			<OverlayPreview>
// 				<Text size={size} outlineWidth={outlineWidth} text={text} />
// 			</OverlayPreview>
// 		</div>
// 	);
// };

// const ClockUrlGenerator = () => {
// 	const [url, setUrl] = useState('');
// 	const [tz, setTz] = useState('UTC');
// 	const [showSeconds, setShowSeconds] = useState(false);
// 	const [showDate, setShowDate] = useState(false);
// 	const [showIcon, setShowIcon] = useState(false);

// 	useEffect(() => {
// 		const params = new URLSearchParams();
// 		params.append('timezone', tz);
// 		if (showSeconds) params.append('seconds', '1');
// 		if (showDate) params.append('date', '1');
// 		if (showIcon) params.append('icon', '1');
// 		const newUrl = `https://worp.tv/widget/text?${params.toString()}`;
// 		setUrl(newUrl);
// 	}, [tz, showSeconds, showDate, showIcon]);

// 	return (
// 		<div className="w-full max-w-2xl space-y-3">
// 			<FormPart label="Timezone">
// 				<TimezoneSelect loading={false} value={tz} onChange={setTz} />
// 			</FormPart>

// 			<LabelledSwitch label="Show Date" isChecked={showDate} onCheckedChange={setShowDate} />
// 			<LabelledSwitch label="Show Seconds" isChecked={showSeconds} onCheckedChange={setShowSeconds} />
// 			<LabelledSwitch label="Show Icon" isChecked={showIcon} onCheckedChange={setShowIcon} />

// 			<FormPart label="Browser Source URL">
// 				<CopyToClipboard url={url} />
// 			</FormPart>

// 			<OverlayPreview>
// 				<Clock timezone={tz || 'UTC'} showDate={showDate} showSeconds={showSeconds} showIcon={showIcon} />
// 			</OverlayPreview>
// 		</div>
// 	);
// };

// const KickChatUrlGenerator = () => {
// 	const [url, setUrl] = useState('');
// 	const [kickUsername, setKickUsername] = useState('');

// 	useEffect(() => {
// 		const params = new URLSearchParams();
// 		if (kickUsername) params.append('username', kickUsername);
// 		const newUrl = `https://worp.tv/widget/chat?${params.toString()}`;
// 		setUrl(newUrl);
// 	}, [kickUsername]);

// 	return (
// 		<div className="w-full max-w-2xl space-y-3">
// 			<FormPart label="Kick Username">
// 				<Input
// 					type="text"
// 					value={kickUsername}
// 					onChange={e => setKickUsername(e.currentTarget.value)}
// 					className="w-full px-3 py-2 border rounded-md max-w-48"
// 					placeholder="Your Kick Name"
// 				/>
// 			</FormPart>

// 			<FormPart label="Browser Source URL">
// 				<CopyToClipboard url={url} />
// 			</FormPart>
// 		</div>
// 	);
// };

// const FireworksUrlGenerator = () => {
// 	const [url, setUrl] = useState('');
// 	const [kickUsername, setKickUsername] = useState('');
// 	const [cooldown, setCooldown] = useState(60);
// 	const [soundEnabled, setSoundEnabled] = useState(true);

// 	useEffect(() => {
// 		const params = new URLSearchParams();
// 		if (kickUsername) params.append('kick', kickUsername);
// 		params.append('cd', cooldown.toString());
// 		params.append('sound', soundEnabled ? 'yes' : 'no');
// 		const newUrl = `https://worp.tv/widget/fireworks?${params.toString()}`;
// 		setUrl(newUrl);
// 	}, [kickUsername, cooldown, soundEnabled]);

// 	return (
// 		<div className="w-full max-w-2xl space-y-3">
// 			<div className="text-gray-400">
// 				<h3 className="mb-2 text-gray-300 font-bold">How to use:</h3>
// 				<ol className="pl-5 list-decimal space-y-1 text-sm">
// 					<li>Enter your Kick username (as it shows in the url on your kick page)</li>
// 					<li>
// 						Pick a cooldown time in seconds of how long users must wait before using another firework (your
// 						chat mods bypass this cooldown)
// 					</li>
// 					<li>Copy the browser URL, and add it as a browser source in OBS. </li>
// 					<li>
// 						Viewers can type <code className="px-1 py-0.5 rounded">!fireworks</code> in your Kick chat to
// 						trigger fireworks
// 					</li>
// 				</ol>
// 			</div>
// 			<FormPart label="Kick Username">
// 				<Input
// 					type="text"
// 					value={kickUsername}
// 					onChange={e => setKickUsername(e.currentTarget.value)}
// 					className="w-full px-3 py-2 border rounded-md max-w-48"
// 					placeholder="Your Kick Name"
// 				/>
// 			</FormPart>
// 			<FormPart label="Cooldown (seconds)">
// 				<div className="flex items-center gap-3 max-w-32">
// 					<Input
// 						type="range"
// 						min="5"
// 						max="300"
// 						step="5"
// 						value={cooldown}
// 						onChange={e => setCooldown(Number(e.currentTarget.value))}
// 						className="w-full"
// 					/>
// 					<span className="w-12 text-center">{cooldown}s</span>
// 				</div>
// 				<LabelledSwitch label="Sound Effects" isChecked={soundEnabled} onCheckedChange={setSoundEnabled} />
// 			</FormPart>
// 			<FormPart label="Browser Source URL">
// 				<CopyToClipboard url={url} />
// 			</FormPart>
// 			<OBSBrowserSourceURLModal url={url} hdSize />
// 			// TODO
// 			{/* {kickUsername && (
// 				<OverlayPreview fullSize>
// 					<Fireworks kickSlug={kickUsername} cooldownSeconds={cooldown} enableSound={soundEnabled} />
// 				</OverlayPreview>
// 			)} */}
// 		</div>
// 	);
// };

// interface WidgetContent {
// 	title: string;
// 	route: string;
// 	description: string;
// 	longDescription: string;
// 	component: React.ReactNode;
// }

// const Widgets: WidgetContent[] = [
// 	{
// 		title: 'Countdown',
// 		route: 'countdown',
// 		description: 'A countdown to a specific point in time.',
// 		longDescription: 'A live clock/time/date widget.',
// 		component: <CountdownURLGenerator />
// 	},
// 	{
// 		title: 'Text',
// 		route: 'text',
// 		description: 'A simple text overlay.',
// 		longDescription: 'A simple text overlay, for showing any text.',
// 		component: <TextURLGenerator />
// 	},
// 	{
// 		title: 'Clock',
// 		route: 'clock',
// 		description: 'A live clock/time/date widget.',
// 		longDescription: 'A live clock/time/date widget.',
// 		component: <ClockUrlGenerator />
// 	},
// 	{
// 		title: 'Kick Chat',
// 		route: 'kick-chat',
// 		description: 'A standard kick chat widget.',
// 		longDescription: 'A standard kick chat widget.',
// 		component: <KickChatUrlGenerator />
// 	},
// 	{
// 		title: 'Fireworks',
// 		route: 'fireworks',
// 		description: 'A live Fireworks/time/date widget.',
// 		longDescription: 'A live Fireworks/time/date widget.',
// 		component: <FireworksUrlGenerator />
// 	}
// ];

// export function StandaloneWidgets() {
// 	const [isMobileView, setIsMobileView] = useState<boolean>(false);
// 	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

// 	useEffect(() => {
// 		const handleResize = () => {
// 			setIsMobileView(window.innerWidth < 768);
// 		};

// 		handleResize();
// 		window.addEventListener('resize', handleResize);
// 		return () => window.removeEventListener('resize', handleResize);
// 	}, []);
// 	const toggleSidebar = () => {
// 		setSidebarOpen(!sidebarOpen);
// 	};

// 	return (
// 		<div className="w-full h-full">
// 			{/* Mobile nav toggle */}
// 			{isMobileView && (
// 				<div className="p-4 flex items-center">
// 					<button onClick={toggleSidebar} className="bg-black/30 hover:bg-gray-700 p-2 rounded-md mr-3">
// 						{sidebarOpen ? (
// 							<svg
// 								xmlns="http://www.w3.org/2000/svg"
// 								className="h-6 w-6"
// 								fill="none"
// 								viewBox="0 0 24 24"
// 								stroke="currentColor"
// 							>
// 								<path
// 									strokeLinecap="round"
// 									strokeLinejoin="round"
// 									strokeWidth={2}
// 									d="M6 18L18 6M6 6l12 12"
// 								/>
// 							</svg>
// 						) : (
// 							<svg
// 								xmlns="http://www.w3.org/2000/svg"
// 								className="h-6 w-6"
// 								fill="none"
// 								viewBox="0 0 24 24"
// 								stroke="currentColor"
// 							>
// 								<path
// 									strokeLinecap="round"
// 									strokeLinejoin="round"
// 									strokeWidth={2}
// 									d="M4 6h16M4 12h16M4 18h16"
// 								/>
// 							</svg>
// 						)}
// 					</button>
// 					<h1 className="text-xl font-bold">Standalone Widgets</h1>
// 				</div>
// 			)}

// 			<div className="max-w-full md:max-w-6xl mx-auto px-4 py-4">
// 				{!isMobileView && (
// 					<div className="mb-6">
// 						<h1 className="text-2xl font-bold mb-2">Standalone Widgets</h1>
// 						<div className="text-gray-400">
// 							These are individual widgets you can generate and add separately to OBS.
// 						</div>
// 					</div>
// 				)}

// 				<div className={`max-w-full w-full ${isMobileView ? 'flex flex-col' : 'flex'}`}>
// 					<div
// 						className={`
//               ${
// 					isMobileView
// 						? `fixed inset-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//                  transition-transform duration-300 ease-in-out bg-gray-900`
// 						: 'w-64 shrink-0 border-r border-gray-700 pr-4 h-[calc(100vh-150px)] overflow-y-auto'
// 				}
//             `}
// 					>
// 						{isMobileView && sidebarOpen && (
// 							<div className="p-4 flex justify-between items-center border-b border-gray-700">
// 								<h2 className="text-lg font-bold">Widgets</h2>
// 								<button onClick={toggleSidebar} className="p-2">
// 									<svg
// 										xmlns="http://www.w3.org/2000/svg"
// 										className="h-6 w-6"
// 										fill="none"
// 										viewBox="0 0 24 24"
// 										stroke="currentColor"
// 									>
// 										<path
// 											strokeLinecap="round"
// 											strokeLinejoin="round"
// 											strokeWidth={2}
// 											d="M6 18L18 6M6 6l12 12"
// 										/>
// 									</svg>
// 								</button>
// 							</div>
// 						)}

// 						<nav className={`${isMobileView ? 'p-4' : ''} space-y-1`}>
// 							{Widgets.map(_widget => (
// 								<Link key={_widget.route} to={`/widgets/${_widget.route}`}>
// 									<button
// 										key={_widget.route}
// 										onClick={() => {
// 											if (isMobileView) setSidebarOpen(false);
// 										}}
// 										className={'w-full text-left p-3 rounded-lg transition-colors flex flex-col  '}
// 									>
// 										<span className="font-medium">{_widget.title}</span>
// 										<span className="text-sm text-gray-400">{_widget.description}</span>
// 									</button>
// 								</Link>
// 							))}
// 						</nav>
// 					</div>

// 					{/* Dark background overlay for mobile */}
// 					{isMobileView && sidebarOpen && (
// 						<div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={toggleSidebar} />
// 					)}

// 					<Switch>
// 						{Widgets.map(widget => (
// 							<Route key={widget.title} path={`/widgets/${widget.route}`}>
// 								<div
// 									className={`max-w-3xl ${isMobileView ? 'w-full mt-4 max-w-full p-1' : 'flex-1 pl-6 p-4'}`}
// 								>
// 									<div className="rounded-lg max-w-full w-full">
// 										<h2 className="text-2xl font-bold mb-4">{widget.title}</h2>
// 										<p className="text-gray-400 mb-6">{widget.longDescription}</p>
// 										<div className="">{widget.component}</div>
// 									</div>
// 								</div>
// 							</Route>
// 						))}
// 					</Switch>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }

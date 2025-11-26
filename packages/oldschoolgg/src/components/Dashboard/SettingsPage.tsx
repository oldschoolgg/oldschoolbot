import { CopyToClipboard } from '@/components/CopyToClipboard.tsx';
import { Divider } from '@/components/ui/Divider.tsx';
import { OBSBrowserSourceURLModal } from './components/OBSBrowserSourceURL.tsx';
import type { DashboardSubPageProps } from './DashboardLayout.tsx';
import { DashboardTitle } from './DashboardShared.tsx';

export function SettingsPage({ activeUser, loggedInUser }: DashboardSubPageProps) {
	const managed = [...loggedInUser.manages].filter(_managed => _managed.id !== loggedInUser.id);

	const THEIR_OVERLAY_URL = `${__FRONTEND_URL__}/overlay/${activeUser.id}/${activeUser.overlay_token}`;

	return (
		<div>
			<div>
				<p>
					<span className="font-bold">Logged in as:</span>{' '}
					<span className="text-muted-foreground">{loggedInUser.username}</span>
				</p>
				<p>
					<span className="font-bold">Kick Username:</span>{' '}
					<span className="text-muted-foreground">{activeUser.kick_user?.slug ?? 'none'}</span>
				</p>
			</div>

			<Divider />
			<div className="my-3">
				<DashboardTitle>Overlay URL for {activeUser.username}</DashboardTitle>
				<CopyToClipboard url={THEIR_OVERLAY_URL} />
				<OBSBrowserSourceURLModal url={THEIR_OVERLAY_URL} hdSize />
			</div>

			<Divider />
			<div className="my-3">
				<h1 className="font-bold text-3xl mb-1 text-white">Your Managers</h1>
				<div className="text-xs text-gray-400 mb-4">Your managers have full access to manage your account.</div>
				{loggedInUser.managers.length === 0 ? (
					<p className="text-gray-400">You have no managers.</p>
				) : (
					<p>{loggedInUser.managers.map(m => m.username).join(', ')}</p>
				)}
			</div>
			{managed.length > 0 && (
				<>
					<Divider />
					<div>
						<DashboardTitle>Streamers You Manage:</DashboardTitle>{' '}
						<div className="flex flex-row flex-wrap gap-2">
							{managed.length === 0 ? (
								<p className="text-gray-400">You don't manage any other users.</p>
							) : (
								managed.map(m => (
									<a
										key={m.id}
										href={`/dashboard/${m.id}`}
										className="relative w-40 flex flex-col items-center gap-2 justify-end border rounded-xl p-2 hover:shadow-lg bg-secondary"
									>
										<img
											className="h-16 aspect-square rounded-full"
											src={
												m.kick_user?.profile_pic_url ??
												'https://kick.com/img/default-profile-pictures/default1.jpeg'
											}
										/>
										<div className="relative z-10">
											<p className="font-bold text-lg">{m.kick_user?.username}</p>
										</div>
									</a>
								))
							)}
						</div>
					</div>
				</>
			)}

			{loggedInUser.id !== activeUser.id && (
				<div className="p-4 rounded-xl mt-4 text-lg">
					<p>You are managing {activeUser.username}'s settings.</p>
				</div>
			)}
		</div>
	);
}

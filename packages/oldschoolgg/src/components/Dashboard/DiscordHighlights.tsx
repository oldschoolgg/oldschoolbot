import { useState } from 'react';

import { Button } from '@/components/Input/button.tsx';
import { Input } from '@/components/Input/input.tsx';
import { LabelledSwitch } from '@/components/Input/LabelledSwitch.tsx';
import { NumberInput } from '@/components/Input/NumberInput.tsx';
import { UniqueButton } from '@/components/Input/UniqueButton.tsx';
import { FormPart } from '@/components/ui/FormPart.tsx';
import type { DashboardSubPageProps } from './DashboardLayout.tsx';
import { DashboardTitle } from './DashboardShared.tsx';

export function DiscordHighlightsPage({ activeUser: user, updateConfig, loading }: DashboardSubPageProps) {
	const [discordServerId, setDiscordServerId] = useState(user.discord_server_id ?? '');

	return (
		<div>
			<p className="mb-4">
				Messages from your discord server can be highlighted on your stream, if they receive enough star
				reactions, or if a staff member manually highlights them (right click on a message, click apps, and then
				Highlight on Stream). Mods in your discord server can still highlight messages on stream if its
				disabled.
			</p>
			<div className="flex flex-col gap-2 my-8 b">
				<p className="font-bold">You need to add our discord bot to your server!</p>
				<UniqueButton bgColor="bg-[#5e64ed]" href={__BOT_INVITE_URL__}>
					Invite Discord Bot
				</UniqueButton>
			</div>
			<DashboardTitle>Settings</DashboardTitle>
			<div className="max-w-sm">
				<LabelledSwitch
					label="Discord Highlights Enabled"
					disabled={loading}
					isChecked={user.discord_highlights_enabled}
					onCheckedChange={checked => updateConfig({ discord_highlights_enabled: checked })}
				/>
				<LabelledSwitch
					label="Show images"
					disabled={loading}
					isChecked={user.discord_highlights_show_images}
					onCheckedChange={checked => updateConfig({ discord_highlights_show_images: checked })}
				/>

				<FormPart
					label="Discord Server ID"
					description="The ID of your discord server where people star things, it looks like this: 954257317220737034"
				>
					<div className="flex flex-row gap-2">
						<Input
							type="text"
							disabled={loading}
							value={discordServerId}
							onChange={val => setDiscordServerId(val.currentTarget.value)}
						/>
						<Button
							onClick={() =>
								updateConfig({ discord_server_id: discordServerId }).catch(err => {
									console.error(err);
									setDiscordServerId(user.discord_server_id ?? '');
								})
							}
							disabled={
								loading ||
								discordServerId === user.discord_server_id ||
								(!discordServerId && !user.discord_server_id)
							}
						>
							Save
						</Button>
					</div>
				</FormPart>

				<FormPart
					label="Minimum Reactions"
					description="The minimum number of reactions a message needs to be highlighted"
				>
					<NumberInput
						value={user.discord_highlights_minimum_reactions}
						onChange={val => updateConfig({ discord_highlights_minimum_reactions: val })}
					/>
				</FormPart>
			</div>
		</div>
	);
}

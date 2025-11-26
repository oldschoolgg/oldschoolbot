import { LabelledSwitch } from '@/components/Input/LabelledSwitch.tsx';
import type { DashboardSubPageProps } from './DashboardLayout.tsx';

export function KickChatPage({ activeUser: user, updateConfig, loading }: DashboardSubPageProps) {
	return (
		<div>
			<p className="mb-4">
				Shows your kick chat on the overlay (hidden if a stream is featured or a poll is shown)
			</p>
			<LabelledSwitch
				label="Kick Chat Overlay Enabled"
				disabled={loading}
				isChecked={user.kick_chat_overlay_enabled}
				onCheckedChange={checked => updateConfig({ kick_chat_overlay_enabled: checked })}
			/>
		</div>
	);
}

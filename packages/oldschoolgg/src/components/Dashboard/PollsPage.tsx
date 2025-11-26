import { useEffect, useState } from 'react';

import { Button } from '@/components/Input/button.tsx';
import { Modal } from '@/components/Modal/Modal.tsx';
import { handleError } from '@/lib/handleError.ts';
import { type OverlayConfig, rawApi } from '../../lib/rawApi.ts';
import { PollResults } from '../../overlay/PollResults.tsx';
import { CreatePoll } from './CreatePoll.tsx';
import type { DashboardSubPageProps } from './DashboardLayout.tsx';

export function PollsPage({ activeUser: user }: DashboardSubPageProps) {
	const [overlayConfig, setOverlayConfig] = useState<OverlayConfig | null>(null);

	useEffect(() => {
		rawApi.overlay(user.id).then(res => {
			if (!res || 'error' in res) return;
			setOverlayConfig(res);
		});
	}, [user.id]);

	return (
		<div>
			<div className="">
				<h1 className="text-2xl font-bold my-2">Poll</h1>
				<div className="text-muted-foreground mb-4">You can only have 1 poll going on at a time.</div>
				{!overlayConfig?.poll && (
					<Modal title="Create a Poll">
						<CreatePoll user={user} setOverlayConfig={setOverlayConfig} />
					</Modal>
				)}
				{overlayConfig?.poll && (
					<div className="p-4 my-2 relative max-w-xl w-max flex flex-col gap-8">
						<PollResults poll={overlayConfig.poll} />
						<Button
							onClick={() => {
								if (!overlayConfig?.poll?.poll_id) return;
								rawApi.polls.delete(overlayConfig.poll.poll_id).then(res => {
									if ('error' in res) {
										handleError(new Error(`Failed to delete poll: ${res.error}`));
										return;
									}
									setOverlayConfig(res);
								});
							}}
						>
							Delete Poll
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

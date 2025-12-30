import { Bank } from 'oldschooljs';
import { useEffect, useState } from 'react';

import { BankImage } from '@/components/BankImage/BankImage.js';
import { Button } from '@/components/ui/button.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.js';
import { api, globalState } from '@/lib/api.js';
import type { FullMinionData } from '../../../../robochimp/src/http/servers/api-types.js';

export function StaffPage() {
	const state = globalState();
	const [data, setData] = useState<FullMinionData | null>(null);

	useEffect(() => {
		api.minion.me('osb').then(setData);
	}, [state.user]);

	if (!data) return null;

	return (
		<div className="w-full">
			<div>
				{data.is_ironman ? <p>You are an Ironman!</p> : <p>You are not an Ironman.</p>}
				<BankImage sort="name" title="Collection Log" bank={new Bank(data.collection_log_bank)} />
			</div>
			<div className="flex w-full justify-center mt-24">
				<Button onClick={api.logOut}>Log Out</Button>
			</div>
			<Tabs defaultValue="one" className="w-full">
				<TabsList className="mb-4">
					<TabsTrigger value="one">One</TabsTrigger>
					<TabsTrigger value="two">Two</TabsTrigger>
					<TabsTrigger value="three">Three</TabsTrigger>
				</TabsList>

				<TabsContent value="one">
					<div className="p-4 border rounded">Tab One Content</div>
				</TabsContent>

				<TabsContent value="two">
					<div className="p-4 border rounded">Tab Two Content</div>
				</TabsContent>

				<TabsContent value="three">
					<div className="p-4 border rounded">Tab Three Content</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

import { Route, Switch } from 'wouter-preact';

import { Home } from '@/pages/Home';

export function Root() {
	console.log('Root');
	return (
		<Switch>
			<Route path="/">
				<Home />
			</Route>
		</Switch>
	);
}

import { LabelledSwitch } from '@/components/Input/LabelledSwitch.tsx';
import type { DashboardSubPageProps } from './DashboardLayout.tsx';

export function WeatherPage({ activeUser: user, updateConfig, loading }: DashboardSubPageProps) {
	return (
		<div>
			<p>The location used for the weather is based off your location updates from Traccar Client.</p>
			<LabelledSwitch
				label="Weather Enabled"
				disabled={loading || !location}
				isChecked={user.weather_enabled}
				onCheckedChange={checked => updateConfig({ weather_enabled: checked })}
			/>
		</div>
	);
}

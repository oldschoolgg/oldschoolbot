import { LabelledSwitch } from '@/components/Input/LabelledSwitch.js';
import { TimezoneSelect } from '@/components/Input/TimezoneSelect.js';
import { FormPart } from '@/components/ui/FormPart.js';
import type { DashboardSubPageProps } from './Dashboard.js';

export function TimePage({ activeUser, updateConfig, loading }: DashboardSubPageProps) {
	return (
		<div>
			<p className="mb-4">Shows the current time.</p>
			<LabelledSwitch
				label="Time Enabled"
				disabled={loading}
				isChecked={activeUser.time_enabled}
				onCheckedChange={checked => updateConfig({ time_enabled: checked })}
			/>
			<FormPart label="Timezone">
				<TimezoneSelect
					loading={loading}
					value={activeUser.time_timezone ?? ''}
					onChange={val =>
						updateConfig({
							time_timezone: val
						})
					}
				/>
			</FormPart>
		</div>
	);
}

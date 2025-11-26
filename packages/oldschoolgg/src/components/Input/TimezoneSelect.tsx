import { Select } from './Select.tsx';

const commonTimezones: { label: string; iana: string }[] = [
	{ label: 'UTC', iana: 'Etc/UTC' },
	{ label: 'GMT', iana: 'Etc/GMT' },
	{ label: 'EST (Eastern Standard Time)', iana: 'America/New_York' },
	{ label: 'EDT (Eastern Daylight Time)', iana: 'America/New_York' },
	{ label: 'CST (Central Standard Time)', iana: 'America/Chicago' },
	{ label: 'CDT (Central Daylight Time)', iana: 'America/Chicago' },
	{ label: 'MST (Mountain Standard Time)', iana: 'America/Denver' },
	{ label: 'MDT (Mountain Daylight Time)', iana: 'America/Denver' },
	{ label: 'PST (Pacific Standard Time)', iana: 'America/Los_Angeles' },
	{ label: 'PDT (Pacific Daylight Time)', iana: 'America/Los_Angeles' },
	{ label: 'AKST (Alaska Standard Time)', iana: 'America/Anchorage' },
	{ label: 'HST (Hawaii Standard Time)', iana: 'Pacific/Honolulu' },
	{ label: 'BST (British Summer Time)', iana: 'Europe/London' },
	{ label: 'CET (Central European Time)', iana: 'Europe/Paris' },
	{ label: 'CEST (Central European Summer Time)', iana: 'Europe/Paris' },
	{ label: 'EET (Eastern European Time)', iana: 'Europe/Athens' },
	{ label: 'EEST (Eastern European Summer Time)', iana: 'Europe/Athens' },
	{ label: 'MSK (Moscow Time)', iana: 'Europe/Moscow' },
	{ label: 'IST (India Standard Time)', iana: 'Asia/Kolkata' },
	{ label: 'CST (China Standard Time)', iana: 'Asia/Shanghai' },
	{ label: 'JST (Japan Standard Time)', iana: 'Asia/Tokyo' },
	{ label: 'KST (Korea Standard Time)', iana: 'Asia/Seoul' },
	{ label: 'AEST (Australian Eastern Standard Time)', iana: 'Australia/Sydney' },
	{ label: 'AEDT (Australian Eastern Daylight Time)', iana: 'Australia/Sydney' },
	{ label: 'ACST (Australian Central Standard Time)', iana: 'Australia/Adelaide' },
	{ label: 'AWST (Australian Western Standard Time)', iana: 'Australia/Perth' },
	{ label: 'NZST (New Zealand Standard Time)', iana: 'Pacific/Auckland' },
	{ label: 'NZDT (New Zealand Daylight Time)', iana: 'Pacific/Auckland' }
];

export function TimezoneSelect({
	loading,
	value,
	onChange
}: {
	loading?: boolean;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className="max-w-48 w-full">
			<Select
				disabled={loading}
				value={value}
				onChange={value => {
					onChange(value);
				}}
				options={commonTimezones.map(str => ({ label: str.label, value: str.iana }))}
			/>
		</div>
	);
}

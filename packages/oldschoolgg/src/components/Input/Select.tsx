import { FormItem } from './FormItem.tsx';

export const Select = ({
	label,
	options,
	value,
	onChange,
	disabled
}: {
	label?: string;
	value: string;
	options: { label: string; value: string }[];
	onChange: (option: string) => void;
	disabled?: boolean;
}) => {
	return (
		<FormItem label={label}>
			<select
				disabled={disabled}
				className="bg-black/40 border-2 border-blue-500/20 outline-none h-full w-full rounded-md px-3 py-2 text-sm"
				value={value}
				onChange={e => onChange(e.currentTarget.value)}
			>
				{options.map(option => (
					<option key={option.label} value={option.value} className="bg-neutral-900">
						{option.label}
					</option>
				))}
			</select>
		</FormItem>
	);
};

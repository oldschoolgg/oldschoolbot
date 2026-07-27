import { FormPart } from '@/components/ui/FormPart.js';
import { Label } from '@/components/ui/label.js';
import { Switch } from '@/components/ui/switch.js';

export function LabelledSwitch({
	label,
	isChecked,
	onCheckedChange,
	disabled
}: {
	label: string;
	disabled?: boolean;
	isChecked: boolean;
	onCheckedChange: (checked: boolean) => void;
}) {
	return (
		<FormPart label="" className="my-4">
			<div className="flex items-center space-x-2">
				<Switch
					id={label}
					disabled={disabled}
					checked={isChecked}
					onCheckedChange={checked => onCheckedChange(checked)}
				/>
				<Label htmlFor={label}>{label}</Label>
			</div>
		</FormPart>
	);
}

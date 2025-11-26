import { CheckIcon } from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ className, checked, defaultChecked, onCheckedChange, onChange, ...props }, ref) => {
		const [internalChecked, setInternalChecked] = useState(defaultChecked || false);

		const isChecked = checked !== undefined ? checked : internalChecked;

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newChecked = e.currentTarget.checked;

			if (checked === undefined) {
				setInternalChecked(newChecked);
			}

			onCheckedChange?.(newChecked);
			onChange?.(e);
		};

		return (
			<div className="relative">
				<input
					ref={ref}
					type="checkbox"
					checked={isChecked}
					onChange={handleChange}
					className="sr-only"
					{...props}
				/>
				<div
					className={cn(
						'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
						isChecked && 'bg-primary text-primary-foreground',
						props.disabled && 'cursor-not-allowed',
						className
					)}
					onClick={() => {
						if (!props.disabled) {
							const newChecked = !isChecked;

							if (checked === undefined) {
								setInternalChecked(newChecked);
							}

							onCheckedChange?.(newChecked);
						}
					}}
					onKeyDown={e => {
						if (e.key === ' ' || e.key === 'Enter') {
							e.preventDefault();
							if (!props.disabled) {
								const newChecked = !isChecked;

								if (checked === undefined) {
									setInternalChecked(newChecked);
								}

								onCheckedChange?.(newChecked);
							}
						}
					}}
					tabIndex={props.disabled ? -1 : 0}
					role="checkbox"
					aria-checked={isChecked}
					data-state={isChecked ? 'checked' : 'unchecked'}
				>
					{isChecked && (
						<div className="flex items-center justify-center text-current">
							<CheckIcon className="h-4" />
						</div>
					)}
				</div>
			</div>
		);
	}
);

Checkbox.displayName = 'Checkbox';

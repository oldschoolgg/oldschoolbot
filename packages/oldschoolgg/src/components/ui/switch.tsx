import React, { useState } from 'react';

import { cn } from '@/lib/utils';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
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

		const handleClick = () => {
			if (!props.disabled) {
				const newChecked = !isChecked;

				if (checked === undefined) {
					setInternalChecked(newChecked);
				}

				onCheckedChange?.(newChecked);
			}
		};

		const handleKeyDown = (e: any) => {
			if (e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				handleClick();
			}
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
				<button
					type="button"
					role="switch"
					aria-checked={isChecked}
					data-state={isChecked ? 'checked' : 'unchecked'}
					disabled={props.disabled}
					onClick={handleClick}
					onKeyDown={handleKeyDown}
					className={cn(
						'peer inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2',
						'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
						isChecked ? 'bg-orange-600/30' : 'bg-neutral-800',
						className
					)}
				>
					<span
						className={cn(
							'pointer-events-none block h-6 w-6 rounded-full bg-(--color-primary)   shadow-lg ring-0 transition-transform',
							isChecked ? 'translate-x-7' : 'translate-x-0'
						)}
					/>
				</button>
			</div>
		);
	}
);

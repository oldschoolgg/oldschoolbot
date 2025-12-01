import { Input } from './input.js';

interface NumberInputProps {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	className?: string;
	darkMode?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
	value,
	onChange,
	min,
	max,
	step = 1,
	disabled = false,
	className = ''
}) => {
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = Number.parseFloat(e.currentTarget.value);
		if (!Number.isNaN(newValue)) {
			onChange(newValue);
		}
	};

	const increment = () => {
		if (max !== undefined && value >= max) return;
		onChange(value + step);
	};

	const decrement = () => {
		if (min !== undefined && value <= min) return;
		onChange(value - step);
	};

	const containerClasses = `bg-[--background-secondary] border border-gray-800 rounded-lg ${className}`;

	const buttonClasses =
		'size-10 inline-flex justify-center items-center gap-x-2 text-sm font-medium last:rounded-e-lg bg-[--background-secondary] text-muted-foreground hover:bg-black/10 disabled:opacity-50 disabled:pointer-events-none';

	const dividerClasses = 'divide-x divide-gray-800 border-s border-gray-800';

	return (
		<div className={containerClasses} data-hs-input-number="">
			<div className="w-full flex justify-between items-center gap-x-1 pr-2">
				<div className="grow py-1 px-3">
					<Input
						className="w-full p-0 px-2 text-muted-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
						style={{ WebkitAppearance: 'textfield', MozAppearance: 'textfield' }}
						type="number"
						value={value}
						onChange={handleInputChange}
						min={min}
						max={max}
						step={step}
						disabled={disabled}
					/>
				</div>
				<div className={`flex items-center -gap-y-px ${dividerClasses}`}>
					<button
						type="button"
						className={buttonClasses}
						aria-label="Decrease"
						onClick={decrement}
						disabled={disabled || (min !== undefined && value <= min)}
						data-hs-input-number-decrement=""
					>
						<svg
							className="shrink-0 size-3.5"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M5 12h14" />
						</svg>
					</button>
					<button
						type="button"
						className={buttonClasses}
						aria-label="Increase"
						onClick={increment}
						disabled={disabled || (max !== undefined && value >= max)}
						data-hs-input-number-increment=""
					>
						<svg
							className="shrink-0 size-3.5"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M5 12h14" />
							<path d="M12 5v14" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

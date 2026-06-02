import { useClickOutside } from '@mantine/hooks';
import { useId, useState } from 'react';

type Option = {
	label: string;
	value: string;
	disabled?: boolean;
};

type MultiSelectProps = {
	options: Option[];
	value: string[];
	onChange: (v: string[]) => void;
	placeholder?: string;
	searchable?: boolean;
	maxValues?: number;
	className?: string;
};

export function MultiSelect(props: MultiSelectProps) {
	const {
		options,
		value,
		onChange,
		placeholder = 'Select…',
		searchable = true,
		maxValues = Number.POSITIVE_INFINITY,
		className = ''
	} = props;

	const id = useId();
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState('');

	const rootRef = useClickOutside(() => setOpen(false));

	const filtered = searchable ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())) : options;

	const select = (val: string) => {
		if (value.includes(val)) {
			onChange(value.filter(v => v !== val));
			return;
		}
		if (value.length >= maxValues) return;
		onChange([...value, val]);
	};

	const remove = (val: string) => onChange(value.filter(v => v !== val));

	return (
		<div ref={rootRef} className={`relative text-sm ${className}`}>
			<div
				className="flex min-h-9 flex-wrap items-center gap-1 rounded border border-gray-800 bg-[--background-secondary] px-2 py-1 focus-within:ring-2 focus-within:ring-blue-500"
				onClick={() => setOpen(true)}
			>
				{value.map(v => {
					const opt = options.find(o => o.value === v);
					return (
						<span key={v} className="flex justify-center items-center gap-1 rounded bg-black/20 px-3 py-1">
							{opt?.label ?? v}
							<button
								type="button"
								className="leading-none"
								onClick={e => {
									e.stopPropagation();
									remove(v);
								}}
							>
								×
							</button>
						</span>
					);
				})}

				{searchable && (
					<input
						id={id}
						className="flex-1 min-w-[4ch] border-none bg-transparent outline-none"
						placeholder={value.length === 0 ? placeholder : ''}
						value={search}
						onChange={e => {
							setSearch(e.currentTarget.value);
							if (!open) setOpen(true);
						}}
						onFocus={() => setOpen(true)}
						disabled={value.length >= maxValues}
					/>
				)}
			</div>

			{open && (
				<ul className="absolute z-50 mt-1 max-h-60 w-full rounded border border-gray-800 bg-[--background-secondary] shadow">
					{filtered.length === 0 && <li className="px-3 py-2 text-gray-500">Nothing found</li>}
					{filtered.map(o => (
						<li
							key={o.value}
							className={`flex items-center gap-2 px-3 py-2 ${o.disabled || value.includes(o.value) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-black/10'}`}
							onClick={() => {
								if (o.disabled || value.includes(o.value)) return;
								select(o.value);
							}}
						>
							{o.label}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

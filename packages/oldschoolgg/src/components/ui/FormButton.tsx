import type React from 'react';

export const FormButton = ({
	label,
	children,
	onClick
}: {
	label: string;
	children: React.ReactNode;
	onClick: () => void;
}) => {
	return (
		<button
			className="flex items-center justify-between w-full px-4 py-2 border-2 border-blue-500/20 bg-black/40  rounded-full h-10 hover:border-blue-600 text-left"
			onClick={onClick}
			type="button"
		>
			<span className="text-sm">{label}</span>
			{children}
		</button>
	);
};

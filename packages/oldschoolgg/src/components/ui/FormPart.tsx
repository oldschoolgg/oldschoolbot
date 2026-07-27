export function FormPart({
	label,
	description,
	children,
	className
}: {
	label: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={`${className ?? ''} my-4 max-w-full`}>
			<p className="text-lg font-semibold mb-1.5 text-gray-100">{label}</p>
			{description && <p className="text-muted-foreground text-sm mt-0.5 mb-2">{description}</p>}
			{children}
		</div>
	);
}

export const FormGroup: React.FC<{ className?: string }> = ({ children, className }) => {
	return (
		<div
			className={`${className} flex flex-row gap-4 items-center justify-start align-start flex-wrap overflow-clip`}
		>
			{children}
		</div>
	);
};

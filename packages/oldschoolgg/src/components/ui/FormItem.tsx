import type React from 'react';

export const FormItem = ({ label, children }: { label: string | undefined; children: React.ReactNode }) => {
	return (
		<div>
			<span className="text-xs text-muted-foreground">{label}</span>

			<div className="w-full bg-primary-foreground border border-transparent rounded-lg hover:border-blue-500/20 h-10">
				{children}
			</div>
		</div>
	);
};

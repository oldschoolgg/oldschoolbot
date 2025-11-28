import { cn } from '@/lib/utils.ts';

export const FormContainer: React.FC<{ className?: string }> = ({ children, className }) => {
	return <div className={cn('border border-gray-600 p-4 rounded my-4 bg-neutral-800/10', className)}>{children}</div>;
};

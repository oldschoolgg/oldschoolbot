type PillColor = 'default' | 'dark' | 'red' | 'green' | 'yellow' | 'indigo' | 'purple' | 'pink';

interface PillProps {
	color?: PillColor;
	content: React.ReactNode;
	className?: string;
}

const colorStyles: Record<PillColor, string> = {
	default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
	dark: 'bg-gray-100 text-muted-foreground dark:bg-gray-700 dark:text-gray-300',
	red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
	green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
	yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
	indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
	purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
	pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
};

export const Pill: React.FC<PillProps> = ({ color = 'default', content, className = '' }) => {
	return (
		<span className={`${colorStyles[color]} text-xs font-medium me-2 px-2.5 py-0.5 rounded-full ${className}`}>
			{content}
		</span>
	);
};

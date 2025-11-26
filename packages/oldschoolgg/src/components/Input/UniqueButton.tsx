interface ThemeColors {
	background: string;
	text: string;
}

interface ThemePresets {
	[key: string]: ThemeColors;
}

const themePresets: ThemePresets = {
	discord: {
		background: 'bg-indigo-500',
		text: 'text-white'
	},
	github: {
		background: 'bg-gray-800',
		text: 'text-white'
	},
	twitter: {
		background: 'bg-sky-500',
		text: 'text-white'
	},
	danger: {
		background: 'bg-red-500',
		text: 'text-white'
	},
	kick: {
		background: 'bg-kickgreen',
		text: 'text-black'
	}
};

interface UniqueButtonProps {
	href?: string;
	onClick?: () => void;
	children: React.ReactNode;
	className?: string;
	// Custom colors
	bgColor?: string;
	textColor?: string;
	// Theme preset
	theme?: keyof typeof themePresets | string;
	// Additional props
	disabled?: boolean;
	target?: '_blank' | '_self' | '_parent' | '_top';
	rel?: string;
}

export const UniqueButton: React.FC<UniqueButtonProps> = ({
	href,
	onClick,
	children,
	className = '',
	bgColor,
	textColor,
	theme,
	disabled = false,
	target,
	rel
}) => {
	const isPresetTheme = theme && theme in themePresets;

	const colors = {
		background: isPresetTheme ? themePresets[theme].background : bgColor || 'bg-blue-500',
		text: isPresetTheme ? themePresets[theme].text : textColor || 'text-white'
	};

	// Common button styles
	const buttonStyles = `
    ${colors.background} 
    ${colors.text} 
    border-black 
    border 
    font-semibold 
    px-6 
	grow-0
	w-max
    py-3 
    rounded 
    hover:brightness-90 
    transition-all 
    duration-200
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

	// If href is provided, render an anchor tag, otherwise a button
	if (href) {
		return (
			<a
				href={href}
				className={buttonStyles}
				target={target}
				rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
			>
				{children}
			</a>
		);
	}

	return (
		<button onClick={onClick} className={buttonStyles} disabled={disabled} type="button">
			{children}
		</button>
	);
};

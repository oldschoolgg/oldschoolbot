export function Logo({ size = 35 }: { size?: number }) {
	return (
		<a
			href="/"
			style={{
				fontFamily: 'PikminneueLatin',
				fontSize: `${size}px`,
				lineHeight: '64px',
				color: 'white',
				textDecoration: 'none'
			}}
		>
			Worp
		</a>
	);
}

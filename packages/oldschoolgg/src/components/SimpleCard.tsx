import React from 'react';

export const SimpleCard: React.FC<{
	title?: string;
	children: React.ReactNode;
	onClick?: () => unknown;
}> = ({ children, onClick, title }) => (
	<div onClick={onClick} className="p-3 m-2 rounded-md hover:cursor-pointer bg-primary_main">
		{title && <h2 className="text-gold mb-1 text-2xl">{title}</h2>}
		<div className="text-secondary">{children}</div>
	</div>
);

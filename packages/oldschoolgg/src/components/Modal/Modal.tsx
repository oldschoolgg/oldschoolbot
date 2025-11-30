import { useState } from 'react';
import { Modal as ResponsiveModal } from 'react-responsive-modal';

import './Modal.css';

import { Button } from '@/components/ui/button.js';

export function Modal({
	title,
	children,
	buttonDisabled = false,
	customButton
}: {
	title: string;
	children: React.ReactNode;
	buttonDisabled?: boolean;
	customButton?: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<div onClick={() => setOpen(true)} className="cursor-pointer">
				{customButton ?? <Button disabled={buttonDisabled}>{title}</Button>}
			</div>
			<ResponsiveModal
				open={open}
				onClose={() => setOpen(false)}
				classNames={{
					modal: 'max-w-md'
				}}
			>
				<h1 className="mb-5 font-bold">{title}</h1>
				{children}
			</ResponsiveModal>
		</>
	);
}

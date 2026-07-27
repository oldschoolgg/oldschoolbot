import { type ReactNode, useState } from 'react';
import { Modal as RawModal } from 'react-responsive-modal';

import { Button } from '@/components/ui/button.js';
import './Modal.css';

interface ModalProps {
	children: ReactNode;
	title?: string;
	description?: string;
	buttonText?: string;
	buttonClassName?: string;
}

export function Modal({ children, title, description, buttonText = 'Open', buttonClassName }: ModalProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)} className={buttonClassName}>
				{buttonText}
			</Button>
			<RawModal open={open} onClose={() => setOpen(false)} center>
				{title && (
					<h2 className="text-3xl font-bold mb-2 text-center border-b border-gray-800/50 pb-3 mb-4">
						{title}
					</h2>
				)}
				{description && <p className="text-gray-600 mb-4">{description}</p>}
				{children}
			</RawModal>
		</>
	);
}

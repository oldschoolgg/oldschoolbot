import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { IPublicUser } from '@worp/worp-schemas';

import { Button } from '@/components/Input/button.js';
import { Input } from '@/components/Input/input.js';
import { type OverlayConfig, rawApi } from '@/lib/rawApi.js';

export const CreatePoll = ({
	user,
	setOverlayConfig
}: {
	user: IPublicUser;
	setOverlayConfig: (data: OverlayConfig) => void;
}) => {
	const [title, setTitle] = useState('');
	const [options, setOptions] = useState(['yes', 'no']);
	const [error, setError] = useState('');

	const addOption = () => {
		setOptions([...options, '']);
	};

	const removeOption = (indexToRemove: number) => {
		if (options.length > 2) {
			setOptions(options.filter((_, index) => index !== indexToRemove));
		}
	};

	const handleOptionChange = (index: number, value: string) => {
		const newOptions = [...options];
		newOptions[index] = value;
		setOptions(newOptions);
	};

	const handleSubmit = async (e: any) => {
		e.preventDefault();

		if (!title.trim()) {
			setError('Please enter a title');
			return;
		}

		if (options.some(option => !option.trim())) {
			setError('All options must be filled');
			return;
		}

		setError('');

		const result = await rawApi.polls.create({
			channel_worp_id: user.id,
			title,
			choices: options
		});
		if ('error' in result) {
			setError(result.error);
			return;
		}
		setOverlayConfig(result);
	};

	return (
		<div className="w-full max-w-lg mx-auto">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2">
					<label className="block text-sm font-medium">Title</label>
					<Input
						type="text"
						value={title}
						onChange={(e: any) => setTitle(e.target.value)}
						placeholder="Enter your poll title"
						className="w-full"
					/>
				</div>

				<div className="space-y-4">
					<label className="block text-sm font-medium">Options</label>
					{options.map((option, index) => (
						<div key={index} className="flex gap-2">
							<Input
								type="text"
								value={option}
								onChange={(e: any) => handleOptionChange(index, e.target.value)}
								placeholder={`Option ${index + 1}`}
								className="flex-1"
							/>
							{options.length > 2 && (
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => removeOption(index)}
									className="flex-shrink-0"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							)}
						</div>
					))}
				</div>

				<div className="flex justify-between items-center">
					<Button type="button" variant="outline" onClick={addOption} className="flex items-center gap-2">
						<Plus className="h-4 w-4" />
						Add Option
					</Button>
					<Button type="submit" disabled={options.filter(Boolean).length < 2}>
						Create Poll
					</Button>
				</div>

				{error && <p className="text-red-500 text-sm mt-2">{error}</p>}
			</form>
		</div>
	);
};

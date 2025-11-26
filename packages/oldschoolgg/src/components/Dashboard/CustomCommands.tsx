import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/Input/button.tsx';
import { Input } from '@/components/Input/input.tsx';
import { LabelledSwitch } from '@/components/Input/LabelledSwitch.tsx';
import { Textarea } from '@/components/Input/textarea.tsx';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.tsx';
import { Divider } from '@/components/ui/Divider.tsx';
import { FormContainer } from '@/components/ui/FormContainer.tsx';
import { FormGroup } from '@/components/ui/FormGroup.tsx';
import { FormPart } from '@/components/ui/FormPart.tsx';
import { Pill } from '@/components/ui/Pill.tsx';
import { type CustomCommand, rawApi } from '@/lib/rawApi.ts';
import type { DashboardSubPageProps } from './DashboardLayout.tsx';

const SYSTEM_VARIABLES = [
	{ name: 'username', description: 'The username of the person using the command' },
	{ name: 'uses', description: 'The amount of times the command has been used' }
];

const CONFIG = {
	MAX_RESPONSE_LENGTH: 499
} as const;

function CustomCommandsManager({ activeUser: user }: DashboardSubPageProps) {
	const [commands, setCommands] = useState<CustomCommand[]>([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [_currentCommandId, setCurrentCommandId] = useState<string | null>(null);

	const [name, setName] = useState('');
	const [response, setResponse] = useState('');
	const [isSubOnly, setIsSubOnly] = useState(false);
	const [isModOnly, setIsModOnly] = useState(false);
	const [respondAsChannel, setRespondAsChannel] = useState(false);

	const [nameError, setNameError] = useState<string | null>(null);

	useEffect(() => {
		rawApi.customCommands.get(user.id).then(res => {
			if ('error' in res) {
				setNameError(res.error);
				return;
			}
			setCommands(res);
		});
	}, [user.id]);

	const validateName = (value: string): string | null => {
		if (!value.trim()) return 'Command name is required';
		if (value.includes(' ')) return 'Command name cannot contain spaces';
		if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Only letters, numbers, underscores and hyphens allowed';
		return null;
	};

	const validateResponse = (value: string): string | null => {
		if (!value.trim()) return 'Response is required';
		if (value.length > CONFIG.MAX_RESPONSE_LENGTH) {
			return `Response exceeds maximum length of ${CONFIG.MAX_RESPONSE_LENGTH} characters`;
		}

		return null;
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value;
		setName(value);
		setNameError(validateName(value));
	};

	const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.currentTarget.value;
		setResponse(value);
		setNameError(validateResponse(value));
	};

	const handleSubmit: React.JSX.SubmitEventHandler<HTMLFormElement> = e => {
		e.preventDefault();

		const nameValidationError = validateName(name);
		const responseValidationError = validateResponse(response);

		if (nameValidationError) {
			setNameError(nameValidationError);
		}
		if (responseValidationError) {
			setNameError(responseValidationError);
		}

		if (nameValidationError || responseValidationError) {
			return;
		}

		rawApi.customCommands
			.upsert({
				channel_worp_id: user.id,
				name: name,
				response: response,
				is_moderator_only: isModOnly,
				is_subscriber_only: isSubOnly,
				respond_as_channel: respondAsChannel
			})
			.then(newCommands => {
				if ('error' in newCommands) {
					setNameError(newCommands.error);
					return;
				}
				setCommands(newCommands);
				resetForm();
			});
	};

	const resetForm = () => {
		setName('');
		setResponse('');
		setNameError(null);
		setIsSubOnly(false);
		setIsModOnly(false);
		setIsEditMode(false);
		setCurrentCommandId(null);
	};

	const handleEdit = (command: CustomCommand) => {
		setName(command.name);
		setResponse(command.response);
		setIsEditMode(true);
		setCurrentCommandId(command.name);
	};

	const deleteCommand = useCallback(
		(commandName: string) => {
			rawApi.customCommands.delete(user.id, commandName).then(newCommands => {
				if ('error' in newCommands) {
					setNameError(newCommands.error);
					return;
				}
				setCommands(newCommands);
			});
		},
		[user.id]
	);

	return (
		<div className="container mx-auto">
			<FormContainer>
				<h1 className="mb-4 font-bold text-2xl">{isEditMode ? 'Edit Command' : 'Add New Command'}</h1>
				<form onSubmit={handleSubmit} className="space-y-4">
					<FormPart label="Command Name" className="">
						<Input placeholder="commandname" required value={name} onChange={handleNameChange} />
					</FormPart>

					<div>
						<FormPart label="Response" className="">
							<Textarea
								placeholder="Enter command response..."
								value={response}
								onChange={handleResponseChange}
								required
							/>
							<p className="text-muted-foreground text-xs my-1 p-1">
								{response.length}/{CONFIG.MAX_RESPONSE_LENGTH} characters
							</p>
							<Accordion type="single">
								<AccordionItem value="Countdown">
									<AccordionTrigger>Variables</AccordionTrigger>
									<AccordionContent>
										<div className="mb-2 p-2">
											<p className=" text-sm mb-2">
												You can use these in your command to create dynamic responses.
											</p>
											{SYSTEM_VARIABLES.map(variable => (
												<div key={variable.name} className="flex items-center gap-2 text-sm">
													<p className="font-bold">
														{'{'}
														{variable.name}
														{'}'}
													</p>
													<p className="text-muted-foreground italic">
														{variable.description}
													</p>
												</div>
											))}
										</div>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						</FormPart>
					</div>

					<FormGroup>
						<LabelledSwitch label="Subscribers Only" isChecked={isSubOnly} onCheckedChange={setIsSubOnly} />
						<LabelledSwitch label="Moderators Only" isChecked={isModOnly} onCheckedChange={setIsModOnly} />
					</FormGroup>
					<FormGroup>
						<LabelledSwitch
							label="Respond As Channel Owner"
							isChecked={respondAsChannel}
							onCheckedChange={setRespondAsChannel}
						/>
					</FormGroup>

					{nameError && <p className="font-bold text-red-400">{nameError}</p>}
					<div className="flex flex-row gap-2">
						{isEditMode && <Button onClick={resetForm}>Cancel</Button>}
						<Button type="submit">{isEditMode ? 'Save Changes' : 'Add Command'}</Button>
					</div>
				</form>
			</FormContainer>

			<h1 className="font-bold text-2xl">Your Commands</h1>
			<Divider />

			{commands.length === 0 ? (
				<div>
					<p className="text-muted-foreground">No commands yet. Create your first command above!</p>
				</div>
			) : (
				<div className="space-y-4">
					{commands.map(command => (
						<div
							key={command.name}
							className="flex justify-center text-center items-center p-2 px-4 rounded flex-col gap-y-4 md:flex-row md:justify-between md:text-left"
						>
							<div>
								<div className="flex flex-col md:flex-row items-center gap-2">
									<p className="font-bold text-lg">!{command.name}</p>
									{command.is_subscriber_only && <Pill content="Subscribers Only" />}
									{command.is_moderator_only && <Pill content="Moderators Only" />}
								</div>
								<p className="mt-1 text-xs max-w-sm">{command.response}</p>
							</div>

							<div className="flex gap-1">
								<Button onClick={() => handleEdit(command)}>Edit</Button>
								<Button variant="destructive" onClick={() => deleteCommand(command.name)}>
									Delete
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export function CustomCommands(props: DashboardSubPageProps) {
	return (
		<div>
			<h1 className="text-2xl font-bold my-2">Custom Commands</h1>
			<div className="text-muted-foreground mb-4">
				These are custom commands users can use in your kick chat. There is a cooldown of 1 minute for users
				using commands (moderators excluded).
			</div>
			<CustomCommandsManager {...props} />
		</div>
	);
}

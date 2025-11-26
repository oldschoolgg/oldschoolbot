import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Modal as ResponsiveModal } from 'react-responsive-modal';

import '@/components/Modal/Modal.css';

import { CopyToClipboard } from '@/components/CopyToClipboard';

type OBSBrowserSourceURLProps = { hdSize: boolean; url: string };

const OBSBrowserSourceURL = ({ hdSize, url }: OBSBrowserSourceURLProps) => {
	return (
		<div className="flex flex-col items-center justify-center w-full">
			<div className="w-full max-w-2xl  rounded-lg  overflow-hidden">
				{/* Main content */}
				<div className="mt-8">
					<div className="rounded-md mb-3">
						<CopyToClipboard url={url} />

						<div className="space-y-2">
							<div className="rounded-md p-2">
								<div className="flex items-center">
									<div>
										<h3 className="text-white font-bold">Step 1: Add a Browser Source</h3>
										<p className="text-gray-300 text-xs">
											Click the <span className="text-white font-medium">+</span> button in
											Sources and select <span className="text-white font-medium">Browser</span>
										</p>
									</div>
								</div>
							</div>

							<div className="rounded-md p-2">
								<div className="flex items-start">
									<div>
										<h3 className="text-white font-bold">Step 2: Configure Settings</h3>
										<div className="rounded-md mt-1 text-sm">
											<p>
												<span className="text-gray-300 font-bold">URL: </span>
												<span className="text-blue-400 font-mono break-all">{url}</span>
											</p>

											{hdSize && (
												<>
													{' '}
													<p>
														<span className="text-gray-300 font-bold">Width: </span>
														<span className="text-gray-400">1920</span>
													</p>
													<p>
														<span className="text-gray-300 font-bold">Height: </span>
														<span className="text-gray-400">1080</span>
													</p>
												</>
											)}

											<br />
											<p>
												<span className="text-gray-300 font-bold">
													Shutdown when not visible
													<br />
													Refresh When Scene Active
													<br />
													Control Audio via OBS:{' '}
												</span>
												<span className="text-gray-400 flex items-center font-bold mt-1">
													<CheckCircle2 size={12} className="text-green-500 mr-1" /> Yes
												</span>
											</p>

											<br />
											<p>
												<span className="text-gray-300 font-bold">Page Permissions: </span>
												<span className="text-gray-400">Read access to user information</span>
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className=" rounded-md p-2">
								<div className="flex items-center">
									<div>
										<h3 className="text-white font-bold">Step 3: Apply Settings</h3>
										<p className="text-gray-300 text-xs">
											Click <span className="text-white font-medium">OK</span> to save and add to
											your scene
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export function OBSBrowserSourceURLModal({ ...restProps }: {} & OBSBrowserSourceURLProps) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<button
				onClick={() => setOpen(true)}
				className="bg-blue-600 text-white flex items-center flex-row gap-4 px-4 py-2 w-max rounded hover:underline border-2 border-transparent hover:border-neutral-800 cursor-pointer my-2"
			>
				<p className="font-bold">Add to OBS</p>
				<img className="w-6 h-6" src="https://static.worp.tv/images/obs-logo-small.webp" />
			</button>
			<ResponsiveModal
				open={open}
				onClose={() => setOpen(false)}
				classNames={{
					modal: 'max-w-md'
				}}
			>
				<h1 className="font-bold">OBS Instructions</h1>
				<OBSBrowserSourceURL {...restProps} />

				<div className="p-2 flex justify-end items-center">
					<button
						className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
						onClick={() => setOpen(false)}
					>
						Done
					</button>
				</div>
			</ResponsiveModal>
		</>
	);
}

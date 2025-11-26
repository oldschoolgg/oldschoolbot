import { CheckIcon, CopyIcon } from 'lucide-react';
import { useState } from 'react';

export const CopyToClipboard = ({ url, spoiler = false }: { url: string; spoiler?: boolean }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	return (
		<div className="relative group max-w-full w-max">
			<div className="flex max-w-full" onClick={handleCopy}>
				<div
					className={`
          flex items-center justify-between max-w-full
          p-3 rounded-tl-lg rounded-bl-lg
          bg-black/40 cursor-pointer
          hover:opacity-90 transition-all
          ${spoiler ? 'blur-sm hover:blur-none' : ''}
        `}
				>
					<span className="font-mono text-sm break-all px-2 max-w-full">{url}</span>
				</div>
				<div className="flex flex-row gap-2 items-center justify-center text-sm bg-blue-600 hover:bg-blue-700 rounded-tr-lg rounded-br-lg px-3 font-bold cursor-pointer">
					<CopyIcon className="w-4 h-4" />
					Copy
				</div>
			</div>

			{copied && (
				<div
					className="absolute -top-8 right-0 -translate-x-1/2
                      bg-black/50 text-white text-sm py-2 px-3 rounded
                      flex items-center gap-1 font-bold"
				>
					<CheckIcon className="fill-gray-500" />
					<span>Copied!</span>
				</div>
			)}
		</div>
	);
};

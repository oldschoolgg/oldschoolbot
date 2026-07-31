import { useMemo, useState } from 'preact/hooks';

type PreviewBackground = {
	id: number;
	name: string;
	imageFile: string | null;
	purpleImageFile: string | null;
	alternateImageFiles: string[];
};

type Props = {
	backgrounds: PreviewBackground[];
	imageBaseURL: string;
};

export function BankBackgroundPreviewPicker({ backgrounds, imageBaseURL }: Props) {
	const sortedBackgrounds = useMemo(
		() => [...backgrounds].sort((a, b) => a.name.localeCompare(b.name)),
		[backgrounds]
	);
	const [selectedID, setSelectedID] = useState<number>(sortedBackgrounds[0]?.id ?? 1);

	const selectedBackground = useMemo(
		() => sortedBackgrounds.find(background => background.id === selectedID) ?? sortedBackgrounds[0],
		[sortedBackgrounds, selectedID]
	);

	if (!selectedBackground) {
		return <p>No bank backgrounds were found.</p>;
	}

	return (
		<div className="bank-bg-picker">
			<div className="bank-bg-controls">
				<div className="bank-bg-field">
					<label htmlFor="bank-bg-select" className="bank-bg-picker-label">
						Background
					</label>
					<select
						id="bank-bg-select"
						className="sl-select"
						value={selectedBackground.id}
						onChange={event => setSelectedID(Number(event.currentTarget.value))}
					>
						{sortedBackgrounds.map(background => (
							<option key={background.id} value={background.id}>
								{background.name}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="bank-bg-preview">
				<div className="bank-bg-preview-title">
					<strong>{selectedBackground.name}</strong>
				</div>

				{selectedBackground.imageFile ? (
					<img
						src={`${imageBaseURL}/${selectedBackground.imageFile}`}
						alt={`${selectedBackground.name} bank background preview`}
						loading="lazy"
					/>
				) : (
					<p className="bank-bg-missing">No image file was found for this background.</p>
				)}

				{selectedBackground.purpleImageFile ? (
					<>
						<p className="bank-bg-label">Purple Variant</p>
						<img
							src={`${imageBaseURL}/${selectedBackground.purpleImageFile}`}
							alt={`${selectedBackground.name} purple variant preview`}
							loading="lazy"
						/>
					</>
				) : null}

				{selectedBackground.alternateImageFiles.length > 0 ? (
					<>
						<p className="bank-bg-label">Alternate Variant(s)</p>
						<div className="bank-bg-alternates">
							{selectedBackground.alternateImageFiles.map(file => (
								<img
									key={file}
									src={`${imageBaseURL}/${file}`}
									alt={`${selectedBackground.name} alternate variant preview`}
									loading="lazy"
								/>
							))}
						</div>
					</>
				) : null}
			</div>
		</div>
	);
}

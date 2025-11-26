export const LoadingOverlay: React.FC<{ isLoading: boolean }> = ({ isLoading = true }) => {
	if (!isLoading) return null;

	return (
		<div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black bg-opacity-50 z-10">
			<div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-middle">
				<span className="sr-only">Loading...</span>
			</div>
		</div>
	);
};

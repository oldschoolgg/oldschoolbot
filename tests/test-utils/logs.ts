export const TestLogs = {
	Debug: (str: string) => {
		console.log(`[DEBUG] ${str.slice(0, 100)}`);
	}
};

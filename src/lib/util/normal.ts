export function normal(mu: number, sigma: number, nsamples: number) {
	if (!nsamples) nsamples = 6;
	if (!sigma) sigma = 1;
	if (!mu) mu = 0;
	let run_total = 0;

	for (let i = 0; i < nsamples; i++) {
		run_total += Math.random();
	}

	return (sigma * (run_total - nsamples / 2)) / (nsamples / 2) + mu;
}

import { CpuInfo } from 'node:os';
import os from 'os';
import { monitorEventLoopDelay } from 'perf_hooks';

const h = monitorEventLoopDelay();
h.enable();

function getMemoryMetrics() {
	const usage = process.memoryUsage();
	return {
		memorySizeTotal: usage.heapTotal,
		memorySizeUsed: usage.heapUsed,
		memorySizeExternal: usage.external,
		memorySizeRSS: usage.rss
	};
}

function _totalCpuTime(cpu: CpuInfo) {
	if (!cpu || !cpu.times) return 0;
	const { user, nice, sys, idle, irq } = cpu.times;

	return user + nice + sys + idle + irq;
}

function totalCpusTime(cpus: CpuInfo[]) {
	return cpus.map(_totalCpuTime).reduce((a, b) => a + b, 0);
}

let cpus = os.cpus();
let startUsage = process.cpuUsage();
function getCPUMetrics() {
	let newCpus = os.cpus();
	let newStartUsage = process.cpuUsage();

	let elapCpuTimeMs = totalCpusTime(newCpus) - totalCpusTime(cpus);
	let elapUsage = process.cpuUsage(startUsage);

	cpus = newCpus;
	startUsage = newStartUsage;

	let cpuUser = elapUsage.user / 1000; // microseconds to milliseconds
	let cpuSystem = elapUsage.system / 1000;
	let cpuPercent = (100 * (cpuUser + cpuSystem)) / elapCpuTimeMs;

	return {
		cpuUser,
		cpuSystem,
		cpuPercent
	};
}

export function collectMetrics() {
	let metrics = {
		eventLoopDelayMin: h.min * 1e-6,
		eventLoopDelayMax: h.max * 1e-6,
		eventLoopDelayMean: h.mean * 1e-6,
		...getMemoryMetrics(),
		...getCPUMetrics()
	};
	return metrics;
}

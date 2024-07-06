import type { CpuInfo } from 'node:os';
import os from 'node:os';
import { monitorEventLoopDelay } from 'node:perf_hooks';
import type { Prisma } from '@prisma/client';

import { prisma } from './settings/prisma';

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
	const newCpus = os.cpus();
	const newStartUsage = process.cpuUsage();

	const elapCpuTimeMs = totalCpusTime(newCpus) - totalCpusTime(cpus);
	const elapUsage = process.cpuUsage(startUsage);

	cpus = newCpus;
	startUsage = newStartUsage;

	const cpuUser = elapUsage.user / 1000; // microseconds to milliseconds
	const cpuSystem = elapUsage.system / 1000;
	const cpuPercent = (100 * (cpuUser + cpuSystem)) / elapCpuTimeMs;

	return {
		cpuUser,
		cpuSystem,
		cpuPercent
	};
}

export async function collectMetrics() {
	const prismaMetrics = await prisma.$metrics.json();
	const transformed = Object.fromEntries(
		[...prismaMetrics.counters, ...prismaMetrics.gauges, ...prismaMetrics.histograms].map(i => [i.key, i.value])
	);

	const metrics: Omit<Prisma.MetricCreateInput, 'timestamp'> = {
		eventLoopDelayMin: h.min * 1e-6,
		eventLoopDelayMax: h.max * 1e-6,
		eventLoopDelayMean: h.mean * 1e-6,
		...getMemoryMetrics(),
		...getCPUMetrics(),
		prisma_query_total_queries: transformed.query_total_queries as number,
		prisma_pool_active_connections: transformed.pool_active_connections as number,
		prisma_pool_idle_connections: transformed.pool_idle_connections as number,
		prisma_pool_wait_count: transformed.pool_wait_count as number,
		prisma_query_active_transactions: transformed.query_active_transactions as number
	};
	h.reset();
	debugLog('Collected metrics', { ...metrics, type: 'COLLECT_METRICS' });

	return metrics;
}

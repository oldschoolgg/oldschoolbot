import { miniID } from '@oldschoolgg/toolkit';
import { Prisma } from '@prisma/client';
import { Time } from 'e';
import { writeFile } from 'fs/promises';
import os, { CpuInfo } from 'os';
import { monitorEventLoopDelay } from 'perf_hooks';

import { prisma } from './settings/prisma';
import { LOG_FILE_NAME, pino } from './util/logger';
import { tailFile } from './util/smallUtils';

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

export async function collectMetrics() {
	const prismaMetrics = await prisma.$metrics.json();
	const transformed = Object.fromEntries(
		[...prismaMetrics.counters, ...prismaMetrics.gauges, ...prismaMetrics.histograms].map(i => [i.key, i.value])
	);

	let metrics: Omit<Prisma.MetricCreateInput, 'timestamp'> = {
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

	if (metrics.eventLoopDelayMax > Time.Second * 4) {
		pino.flush();
		const last200Lines = await tailFile(LOG_FILE_NAME, 200);
		const fileDescription = `This is a log snapshot taken when the event loop delay exceeded the threshold of 4000ms. 
        It contains the last 200 lines of the log file: ${LOG_FILE_NAME} \n\n`;
		const fileName = `event-loop-lag-dump-${miniID(5)}.txt`;
		await writeFile(fileName, fileDescription + last200Lines);
	}

	return metrics;
}

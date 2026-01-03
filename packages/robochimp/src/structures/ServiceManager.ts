import { AServiceTypes, type IServiceType } from '@oldschoolgg/schemas';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

type ServiceAction = 'start' | 'stop' | 'restart' | 'status';

export interface ServiceStatus {
	service: IServiceType;
	active: boolean;
	state: string;
	sub_state: string;
	uptime: number | null;
	memory: {
		current: number;
		peak: number;
	} | null;
	cpu: {
		usage: number;
	} | null;
	pid: number | null;
	restart_count: number;
}

class ServiceManager {
	private async exec(service: IServiceType, action: ServiceAction): Promise<string> {
		if (!AServiceTypes.includes(service)) {
			throw new Error(`Invalid service: ${service}`);
		}

		const { stdout, stderr } = await execAsync(`sudo /usr/bin/systemctl ${action} ${service}.service`);
		return stdout || stderr;
	}

	async start(service: IServiceType): Promise<void> {
		await this.exec(service, 'start');
	}

	async stop(service: IServiceType): Promise<void> {
		await this.exec(service, 'stop');
	}

	async restart(service: IServiceType): Promise<void> {
		await this.exec(service, 'restart');
	}

	async status(service: IServiceType): Promise<ServiceStatus> {
		try {
			const { stdout } = await execAsync(
				`sudo /usr/bin/systemctl show ${service}.service --no-pager --property=ActiveState,SubState,MainPID,MemoryCurrent,MemoryPeak,CPUUsageNSec,ActiveEnterTimestamp,NRestarts`
			);

			const props: Record<string, string> = {};

			for (const line of stdout.split('\n')) {
				const [key, value] = line.split('=');
				if (key && value !== undefined) {
					props[key] = value;
				}
			}

			const active = props.ActiveState === 'active';
			const state = props.ActiveState || 'unknown';
			const subState = props.SubState || 'unknown';
			const pid = props.MainPID ? parseInt(props.MainPID, 10) : null;
			const restartCount = props.NRestarts ? parseInt(props.NRestarts, 10) : 0;

			let uptime: number | null = null;
			if (active && props.ActiveEnterTimestamp) {
				const startTime = new Date(props.ActiveEnterTimestamp).getTime();
				uptime = Math.floor((Date.now() - startTime) / 1000);
			}

			let memory: { current: number; peak: number } | null = null;
			if (props.MemoryCurrent && props.MemoryCurrent !== '[not set]') {
				const current = parseInt(props.MemoryCurrent, 10);
				const peak = props.MemoryPeak ? parseInt(props.MemoryPeak, 10) : current;
				memory = { current, peak };
			}

			let cpu: { usage: number } | null = null;
			if (props.CPUUsageNSec && props.CPUUsageNSec !== '[not set]' && uptime) {
				const cpuNanoseconds = parseInt(props.CPUUsageNSec, 10);
				const uptimeNanoseconds = uptime * 1_000_000_000;
				const usage = uptimeNanoseconds > 0 ? (cpuNanoseconds / uptimeNanoseconds) * 100 : 0;
				cpu = { usage: Math.round(usage * 100) / 100 };
			}

			return {
				service,
				active,
				state,
				sub_state: subState,
				uptime,
				memory,
				cpu,
				pid,
				restart_count: restartCount
			};
		} catch (error: any) {
			console.error(`Error fetching status for ${service}:`, error.message);
			return {
				service,
				active: false,
				state: 'unknown',
				sub_state: 'unknown',
				uptime: null,
				memory: null,
				cpu: null,
				pid: null,
				restart_count: 0
			};
		}
	}

	async statusAll(): Promise<ServiceStatus[]> {
		return Promise.all(AServiceTypes.map(s => this.status(s)));
	}

	async restartAll(): Promise<void> {
		await Promise.all(AServiceTypes.map(s => this.restart(s)));
	}

	async stopAll(): Promise<void> {
		await Promise.all(AServiceTypes.map(s => this.stop(s)));
	}

	async startAll(): Promise<void> {
		await Promise.all(AServiceTypes.map(s => this.start(s)));
	}
}

export const serviceManager = new ServiceManager();

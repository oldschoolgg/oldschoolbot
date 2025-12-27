import { MoidItem, StringifiedInteger } from '../types.ts';
import { DataFileContent } from '../util.ts';

declare const value: DataFileContent<
	Record<
		StringifiedInteger,
		{
			high: number;
			high_Time: number;
			low: number;
			low_time: number;
		}
	>
>;
export default value;

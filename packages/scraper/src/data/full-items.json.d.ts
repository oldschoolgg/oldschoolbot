import { StringifiedInteger } from '../types.ts';
import { DataFileContent } from '../util.ts';
import { FullItem } from 'oldschooljs';

declare const value: DataFileContent<Record<StringifiedInteger, FullItem>>;
export default value;

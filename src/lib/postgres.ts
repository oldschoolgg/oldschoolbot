import { noOp } from '@oldschoolgg/toolkit/util';
import postgres from 'postgres';

export const sql = postgres((process.env.DATABASE_URL as string).split('?')[0], { onnotice: noOp, max: 1 });

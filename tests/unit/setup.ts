import { vi } from 'vitest';
import '../../src/lib/safeglobals.js';
import '../../src/lib/cache/redis.js';

vi.mock('../../src/lib/workers/index.js', { spy: true });

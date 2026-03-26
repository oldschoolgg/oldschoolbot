import { vi } from 'vitest';
import '../../src/lib/safeglobals.js';

vi.mock('../../src/lib/workers/index.js', { spy: true });

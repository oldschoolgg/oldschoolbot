import { mkdtempSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { buildCommandsDocDataFromDir } from '../../scripts/wiki/renderCommandsDoc.js';

describe('renderCommandsDoc JSON generator', () => {
	it('does not retain removed commands between runs', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'osb-commands-'));
		try {
			writeFileSync(
				path.join(dir, 'a.ts'),
				"export const a = defineCommand({ name: 'alpha', description: 'Alpha command' });\n"
			);
			writeFileSync(
				path.join(dir, 'b.ts'),
				"export const b = defineCommand({ name: 'beta', description: 'Beta command' });\n"
			);

			const first = buildCommandsDocDataFromDir(dir);
			expect(first.commands.map(c => c.name)).toEqual(['alpha', 'beta']);

			unlinkSync(path.join(dir, 'b.ts'));
			const second = buildCommandsDocDataFromDir(dir);
			expect(second.commands.map(c => c.name)).toEqual(['alpha']);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('preserves special characters in descriptions', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'osb-commands-'));
		try {
			writeFileSync(
				path.join(dir, 'special.ts'),
				"export const c = defineCommand({ name: 'chars', description: 'Pipe | braces {x} <tag> []', options: [{ type: 'String', name: 'input', description: 'Use | [] {} <x>', required: true }] });\n"
			);

			const doc = buildCommandsDocDataFromDir(dir);
			expect(doc.commands[0].description).toBe('Pipe | braces {x} <tag> []');
			expect(doc.commands[0].options[0].description).toBe('Use | [] {} <x>');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('parses repeated sibling spread choices without suppressing duplicates', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'osb-commands-'));
		try {
			writeFileSync(
				path.join(dir, 'choices.ts'),
				"const CHOICES = [{ name: 'One', value: 1 }]; export const c = defineCommand({ name: 'choices', options: [{ type: 'String', name: 'pick', description: 'Pick one', choices: [...CHOICES, ...CHOICES], required: true }] });\n"
			);

			const doc = buildCommandsDocDataFromDir(dir);
			const choices = doc.commands[0].options[0].choices ?? [];
			expect(choices).toHaveLength(2);
			expect(choices[0]).toEqual({ name: 'One', value: 1 });
			expect(choices[1]).toEqual({ name: 'One', value: 1 });
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('keeps commands with missing descriptions using fallback text', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'osb-commands-'));
		try {
			writeFileSync(
				path.join(dir, 'missing.ts'),
				"export const c = defineCommand({ name: 'nodec', options: [{ type: 'String', name: 'arg', required: false }] });\n"
			);

			const doc = buildCommandsDocDataFromDir(dir);
			expect(doc.commands).toHaveLength(1);
			expect(doc.commands[0].description).toBe('No description available yet.');
			expect(doc.commands[0].options[0].description).toBe('No description available yet.');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});

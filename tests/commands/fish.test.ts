import { fishCommand } from '../../src/mahoji/commands/fish';
import { commandTestSetup, commandTestTeardown, testRunCmd } from '../utils';

describe('Fish Command', () => {
	beforeEach(commandTestSetup);
	afterEach(commandTestTeardown);

	it('should handle insufficient fishing level', () => {
		expect(testRunCmd({ cmd: fishCommand, opts: { name: 'trout', quantity: 1 } })).resolves.toEqual(
			'<:minion:778418736180494347> Your minion needs 20 Fishing to fish Trout.'
		);
	});

	it('should handle insufficient QP', () => {
		expect(
			testRunCmd({
				cmd: fishCommand,
				opts: { name: 'karambwanji', quantity: 1 },
				user: { skills_fishing: 9_999_999, QP: 0 }
			})
		).resolves.toEqual('You need 15 qp to catch those!');
	});

	it('should handle invalid fish', () => {
		expect(
			testRunCmd({
				cmd: fishCommand,
				opts: { name: 'asdf' }
			})
		).resolves.toEqual('Thats not a valid fish to catch.');
	});

	it('should fish', () => {
		expect(
			testRunCmd({
				cmd: fishCommand,
				opts: { name: 'shrimps' }
			})
		).resolves.toEqual(
			"<:minion:778418736180494347> Your minion is now fishing 251x Shrimps, it'll take around 27 minutes, 8 seconds to finish."
		);
	});
});

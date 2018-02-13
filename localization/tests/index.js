import pluginTester from 'babel-plugin-tester';
import path from 'path';
import plugin from '../src/';
import * as babel from 'babel-core';
import assert from 'assert';
import { describe, before, it } from 'mocha';

pluginTester({
	plugin: plugin,
	pluginName: 'babel-plugin-qdacity',
	/*fixtures: path.join(__dirname, '__fixtures__'),*/
	pluginOptions: { debug: true, test: true },
	tests: {
		'We do not change code': `
			import { FormattedMessage } from 'react-intl';
			import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';
			import * as foos from '../../war/assets/js/common/Localization/LocalizationProvider.js';
			import intl from 'react-intl';
			function blaFoo(t = undefined) {
				console.log(t);
			}
			const x = blaFoo;
			x();
			blaFoo();
			undefined_function();
			class Complex {
				constructor(bar) {
					this.foo = bar;
				}

				memberFunction(k) {
					return k;
				}
			}

			const foo = new Complex(x);
			foo.memberFunction(x)();
			foo.foo();
			foo.undef();

			const { formatMessage } = IntlProvider.intl;
			const { formatMessage: baum } = IntlProvider.intl;

			FormattedMessage();
			intl.FormattedMessage();

			foos.IntlProvider.intl.formatMessage({ id: 'foo', defaultMessage: 'bar' });

			formatMessage({ id: 'test.string', defaultMessage: 'Hello you!' }, { key: 'value' });
			baum({ id: 'test.string', defaultMessage: 'Hello you!' });
		`
	}
});

/**
 * Recursively check if object has keys and values provided by expected.
 * Additional keys are ignored. Array element order is respected.
 *
 * @param {Object} actual
 * @param {Object} expected
 * @param {string} message
 */
function assertObjectContains(actual, expected, message) {
	if(expected == undefined) return assert.equal(actual, expected, message);
	if(actual == undefined) return assert.equal(actual, expected, message);

	for (const key of Object.keys(expected)) {
		if(!actual.hasOwnProperty(key)) {
			return assert.fail(`${message}:\nObject is missing expected property ${key}`);
		}
		const submessage = `${message}:\nProperty: ${key}`;
		if (typeof(expected[key]) == 'object') {
			assertObjectContains(actual[key], expected[key], submessage);
			continue;
		}
		assert.equal(actual[key], expected[key], message);
	}
}

describe('babel-plugin-qdacity', () => {
	it('Simple message', () => {
		const { metadata } = babel.transform(`
			import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

			const {formatMessage} = IntlProvider.intl;

			formatMessage({id: 'test.message', defaultMessage: 'Test' });
		`, { plugins: [[plugin, {test: true}]] });
		assertObjectContains(metadata['react-intl'], {
			messages: [
				{
					id: 'test.message',
					defaultMessage: 'Test'
				}
			]
		}, 'Test message has not been found');
	});

	it('Multiple messages', () => {
		const { metadata } = babel.transform(`
			import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

			const {formatMessage} = IntlProvider.intl;

			formatMessage({id: 'test.message', defaultMessage: 'Test' });
			formatMessage({id: 'test.message2', defaultMessage: 'Test2' });
		`, { plugins: [[plugin, {test: true}]] });
		assertObjectContains(metadata['react-intl'], {
			messages: [
				{
					id: 'test.message',
					defaultMessage: 'Test'
				},
				{
					id: 'test.message2',
					defaultMessage: 'Test2'
				}
			]
		}, 'Test messages have not been found');
	});

	it('Import renaming', () => {
		const { metadata } = babel.transform(`
			import { IntlProvider as Test } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

			const {formatMessage} = Test.intl;

			formatMessage({id: 'test.message', defaultMessage: 'Test' });
		`, { plugins: [[plugin, {test: true}]] });
		assertObjectContains(metadata['react-intl'], {
			messages: [
				{
					id: 'test.message',
					defaultMessage: 'Test'
				}
			]
		}, 'Test messages have not been found');
	});

	it('Default Import', () => {
		const { metadata } = babel.transform(`
			import Localize from '../../war/assets/js/common/Localization/LocalizationProvider.js';

			const {formatMessage} = Localize.IntlProvider.intl;

			formatMessage({id: 'test.message', defaultMessage: 'Test' });
		`, { plugins: [[plugin, {test: true}]] });
		assertObjectContains(metadata['react-intl'], {
			messages: [
				{
					id: 'test.message',
					defaultMessage: 'Test'
				}
			]
		}, 'Test messages have not been found');
	});

	it('Namespace Import', () => {
		const { metadata } = babel.transform(`
			import * as Localize from '../../war/assets/js/common/Localization/LocalizationProvider.js';

			const {formatMessage} = Localize.IntlProvider.intl;

			formatMessage({id: 'test.message', defaultMessage: 'Test' });
		`, { plugins: [[plugin, {test: true}]] });
		assertObjectContains(metadata['react-intl'], {
			messages: [
				{
					id: 'test.message',
					defaultMessage: 'Test'
				}
			]
		}, 'Test messages have not been found');
	});


	it('Reference renaming/copying', () => {
		const { metadata } = babel.transform(`
			import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

			const {formatMessage: toast} = IntlProvider.intl;

			toast({id: 'test.message', defaultMessage: 'Test' });

			const foobar = toast;

			foobar({id: 'test.message2', defaultMessage: 'Test2'});
		`, { plugins: [[plugin, {test: true}]] });
		assertObjectContains(metadata['react-intl'], {
			messages: [
				{
					id: 'test.message',
					defaultMessage: 'Test'
				},
				{
					id: 'test.message2',
					defaultMessage: 'Test2'
				}
			]
		}, 'Test messages have not been found');
	});

	it('Multiple MI usage', () => {
		const { metadata } = babel.transform(`
			import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

			const {formatMessage} = IntlProvider.intl;

			formatMessage({id: 'test.message', defaultMessage: 'Test' });
			formatMessage({id: 'test.message', defaultMessage: 'Test' });
		`, { plugins: [[plugin, {test: true}]] });
		assertObjectContains(metadata['react-intl'], {
			messages: [
				{
					id: 'test.message',
					defaultMessage: 'Test'
				},
			]
		}, 'Test message has not been found');
	});

	it('Erroneous MI usage', () => {
		assert.throws(() => {
			const { metadata } = babel.transform(`
			import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

			const {formatMessage} = IntlProvider.intl;

			formatMessage({id: 'test.message', defaultMessage: 'Test' });
			formatMessage({id: 'test.message', defaultMessage: 'Test2' });
		`, { plugins: [[plugin, { test: true }]] });
		},
		(error) => {
			if (!(error instanceof SyntaxError)) return false;
			assert.equal(error.message, 'unknown: Colliding message identifier test.message detected.', 'Error message does not match expected');
			return true;
		}, 'Erroneous MI usage not found.');
	});

	describe('formatMessage usage errors', () => {
		it('Values in MI', () => {
			assert.throws(() => {
				const { metadata } = babel.transform(`
					import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

					const {formatMessage} = IntlProvider.intl;

					formatMessage({id: 'test.message', defaultMessage: 'Hello {name}', values: { name: 'Julian' } });
				`, { plugins: [[plugin, { test: true }]] });
			},
			(error) => {
				if (!(error instanceof SyntaxError)) return false;
				assert.equal(error.message, 'unknown: Values is the second argument to formatMessage, do not include it in the MessageIdentifier as it will not work as expected.', 'Error message does not match expected');
				return true;
			}, 'Erroneous values usage not found.');
		});

		it('MI is not an object expression', () => {
			// hopefully this can at some point be allowed. Currently there is no forward resolving implemented.
			assert.throws(() => {
				const { metadata } = babel.transform(`
					import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

					const {formatMessage} = IntlProvider.intl;
					const x = [{id: 'foo', defaultMessage: 'bar' }];
					formatMessage(x[0]);
				`, { plugins: [[plugin, { test: true }]] });
			},
			(error) => {
				if (!(error instanceof SyntaxError)) return false;
				assert.equal(error.message, 'unknown: Argument is not a MessageIdentifier', 'Error message does not match expected');
				return true;
			}, 'Erroneous MI not found.');

			assert.throws(() => {
				const { metadata } = babel.transform(`
					import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

					const {formatMessage} = IntlProvider.intl;
					const x = [{id: 'foo', defaultMessage: 'bar' }];
					formatMessage(x);
				`, { plugins: [[plugin, { test: true }]] });
			},
			(error) => {
				if (!(error instanceof SyntaxError)) return false;
				assert.equal(error.message, 'unknown: Argument is not a MessageIdentifier', 'Error message does not match expected');
				return true;
			}, 'Erroneous MI not found.');
		});

		it('Invalid argument count', () => {
			assert.throws(() => {
				const { metadata } = babel.transform(`
					import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

					const {formatMessage} = IntlProvider.intl;

					formatMessage({id: 'test.message', defaultMessage: '{hello} {name}' }, { name: 'Julian' }, { hello: 'Hello'} );
				`, { plugins: [[plugin, { test: true }]] });
			},
			(error) => {
				if (!(error instanceof SyntaxError)) return false;
				assert.equal(error.message, 'unknown: formatMessage takes one or two arguments', 'Error message does not match expected');
				return true;
			}, 'Erroneous argument count not found.');
			assert.throws(() => {
				const { metadata } = babel.transform(`
					import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

					const {formatMessage} = IntlProvider.intl;

					formatMessage();
				`, { plugins: [[plugin, { test: true }]] });
			},
			(error) => {
				if (!(error instanceof SyntaxError)) return false;
				assert.equal(error.message, 'unknown: formatMessage takes one or two arguments', 'Error message does not match expected');
				return true;
			}, 'Erroneous argument count not found.');
		});

		it('Invalid MI Properties', () => {
			assert.throws(() => {
				const { metadata } = babel.transform(`
					import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

					const {formatMessage} = IntlProvider.intl;

					formatMessage({id: 'test.message', defaultMessage: 'Hello', foo: 'bar' });
				`, { plugins: [[plugin, { test: true }]] });
			},
			(error) => {
				if (!(error instanceof SyntaxError)) return false;
				assert.equal(error.message, 'unknown: Found invalid property \'foo\'', 'Error message does not match expected');
				return true;
			}, 'Erroneous MI prop not found.');

			assert.throws(() => {
				const { metadata } = babel.transform(`
					import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

					const {formatMessage} = IntlProvider.intl;

					formatMessage({id: 3, defaultMessage: 'Hello'});
				`, { plugins: [[plugin, { test: true }]] });
			},
			(error) => {
				if (!(error instanceof SyntaxError)) return false;
				assert.equal(error.message, 'unknown: id needs to be a string literal', 'Error message does not match expected');
				return true;
			}, 'Erroneous MI prop type not found.');

			assert.throws(() => {
				const { metadata } = babel.transform(`
					import { IntlProvider } from '../../war/assets/js/common/Localization/LocalizationProvider.js';

					const {formatMessage} = IntlProvider.intl;

					formatMessage({id: 'foo', defaultMessage: []});
				`, { plugins: [[plugin, { test: true }]] });
			},
			(error) => {
				if (!(error instanceof SyntaxError)) return false;
				assert.equal(error.message, 'unknown: defaultMessage needs to be a string literal', 'Error message does not match expected');
				return true;
			}, 'Erroneous MI prop type not found.');
		});
	});

	it('Plugin order incorrect', () => {
		assert.throws(() => {
			const { metadata } = babel.transform(`
			`, { plugins: [[plugin, { test: false }]] });
		},
		(error) => {
			if (!(error instanceof SyntaxError)) return false;
			assert.equal(error.message, 'unknown: React-Intl plugins needs to be loaded before our formatMessage parser\nPlease re-order plugins in configuration', 'Error message does not match expected');
			return true;
		}, 'Plugin order not checked.');
	});
});

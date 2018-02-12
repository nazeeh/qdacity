import pluginTester from 'babel-plugin-tester';
import path from 'path';
import plugin from '../src/';

pluginTester({
	plugin: plugin,
	pluginName: 'babel-plugin-qdacity',
	/*fixtures: path.join(__dirname, '__fixtures__'),*/
	pluginOptions: { debug: true, test: true },
	tests: {
		'Dummy Test': `
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

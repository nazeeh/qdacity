//@ts-check
import React, {Component} from 'react';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import { FormattedMessage } from 'react-intl';

export default class ImageChooser extends Component {
	constructor(props) {
		super(props);
    }
    
    render() {
        return (
            <p>Image Chooser</p>
        );
    }
}
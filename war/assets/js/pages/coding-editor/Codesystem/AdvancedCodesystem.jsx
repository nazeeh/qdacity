import React from 'react';

import AdvancedCode from './AdvancedCode.jsx';

import SimpleCodesystem from './SimpleCodesystem.jsx';

export default class AdvancedCodesystem extends SimpleCodesystem {

	constructor(props) {
		super(props);
	}

	renderRoot(code, level, key) {
		return (
			<AdvancedCode
                level={level} 
                node={code} 
                selected={this.state.selected} 
                setSelected={this.setSelected} 
                key={key}
		        shouldHighlightNode={this.props.shouldHighlightNode}>
            </AdvancedCode>
		);
	}
}
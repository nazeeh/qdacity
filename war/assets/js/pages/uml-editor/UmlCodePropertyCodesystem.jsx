import React from 'react';

import UmlCodePropertyCode from './UmlCodePropertyCode.jsx';

import SimpleCodesystem from '../coding-editor/Codesystem/SimpleCodesystem.jsx';

export default class UmlCodePropertyCodesystem extends SimpleCodesystem {

	constructor(props) {
		super(props);
	}

	renderRoot(code, level, key) {
		return (
			<UmlCodePropertyCode
                level={level} 
                node={code} 
                selected={this.state.selected} 
                setSelected={this.setSelected} 
                key={key}
		        shouldHighlightNode={this.props.shouldHighlightNode}>
            </UmlCodePropertyCode>
		);
	}
}
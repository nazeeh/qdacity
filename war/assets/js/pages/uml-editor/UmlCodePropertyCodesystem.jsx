import React from 'react';

import UmlCodePropertyCode from './UmlCodePropertyCode.jsx';

import SimpleCodesystem from '../coding-editor/Codesystem/SimpleCodesystem.jsx';

export default class UmlCodePropertyCodesystem extends SimpleCodesystem {

	constructor(props) {
		super(props);
	}

	renderRoot(code, level, selected, setSelected, key, pageView, umlEditor) {
		return (
			<UmlCodePropertyCode
                    level={level} 
                    node={code} 
                    selected={selected} 
                    setSelected={setSelected} 
                    key={key}
                    pageView={pageView}
                    umlEditor={umlEditor}>
            </UmlCodePropertyCode>
		);
	}
}
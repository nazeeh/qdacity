import React from 'react';
import styled from 'styled-components';

import {
	StyledCode
} from '../coding-editor/Codesystem/SimpleCode.jsx';
import SimpleCode from '../coding-editor/Codesystem/SimpleCode.jsx';

const HighlightedCode = StyledCode.extend `
    color: ${props => props.selected ? (props.highlightNode ? '#ff0000' : '#fff') : (props.highlightNode ? '#ffff00' : '#000')};
    background-color: ${props => props.selected ? '#337ab7' : ''};
    &:hover {
        background: #63a0d4;
    }
`;

export default class UmlCodePropertyCodesystem extends SimpleCode {

	constructor(props) {
		super(props);
	}

	highlightNode() {
		return true; //this.props.pageView == PageView.UML && this.props.umlEditor.getMetaModelMapper().isCodeValidNode(this.props.node);
	}

	renderStyledNode(selected, level, className, key, highlightNode, onClick) {
		return (
			<HighlightedCode
                selected={selected}
                level={level}
                className={className}
                key={key}
                highlightNode={highlightNode}
                onClick={onClick}
                >
                {this.renderExpander(this.props.node)}
                {this.renderNodeIcon()}
                {this.renderNodeName()}
                {this.renderCodingCount()}
            </HighlightedCode>
		);
	}

	renderChildSimple(childCode, level, key) {
		return (
			<UmlCodePropertyCodesystem
                documentsView={this.props.documentsView}
                level={level}
                node={childCode}
                selected={this.props.selected}
                setSelected={this.props.setSelected}
                relocateCode={this.props.relocateCode}
                showFooter={this.props.showFooter}
                key={key}
                pageView={this.props.pageView}
            >
            </UmlCodePropertyCodesystem>
		);
	}
}
import React from 'react';
import styled from 'styled-components';

import {
	StyledCode
} from '../coding-editor/Codesystem/SimpleCode.jsx';
import {
	StyledExpander
} from '../coding-editor/Codesystem/SimpleCode.jsx';
import SimpleCode from '../coding-editor/Codesystem/SimpleCode.jsx';

const HighlightedCode = StyledCode.extend `
    font-weight: ${props => props.highlightNode ? 'bold' : 'normal'};
    
    color: ${props => props.selected ? (props.highlightNode ? '#fff' : '#707070') : (props.highlightNode ? '#000' : '#707070')};
    
    background-color: ${props => props.selected ? (props.highlightNode ? '#337ab7' : '#d0d0d0') : ''};
    &:hover {
        background: ${props => props.highlightNode ? '#63a0d4' : '#e0e0e0'};
    }
`;

const HighlightedExpander = StyledExpander.extend `
    padding-left:${props => props.hasChildren ? '' : '18px'};
    color: ${props => props.selected ? (props.highlightNode ? '#fff' : '#707070') : (props.highlightNode ? '#000' : '#707070')};
`;

export default class UmlCodePropertyCodesystem extends SimpleCode {

	constructor(props) {
		super(props);
	}

	renderStyledNode(selected, level, className, key, highlightNode, onClick) {
		return (
			<HighlightedCode
                selected={selected}
                highlightNode={highlightNode}
                level={level}
                className={className}
                key={key}
                onClick={onClick}
                >
                {this.renderExpander(this.props.node)}
                {this.renderNodeIcon()}
                {this.renderNodeName()}
                {this.renderCodingCount()}
            </HighlightedCode>
		);
	}

	renderSimpleExpander(hasChildren, selected, className, onClick, highlightNode, caret) {
		return (
			<HighlightedExpander 
                    hasChildren={hasChildren} 
                    selected = {selected} 
                    className={className}
                    onClick={onClick}
                    highlightNode={highlightNode}>
                    {caret}
                </HighlightedExpander>
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
		        shouldHighlightNode={this.props.shouldHighlightNode}
            >
            </UmlCodePropertyCodesystem>
		);
	}
}
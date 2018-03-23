import React from 'react';
import styled from 'styled-components';

import Expander from '../../../../common/styles/expander/Expander.jsx';

import DocumentDetailsItem from './DocumentDetailsItem.jsx';

const StyledContainer = styled.div`
	padding-right: 20px;
	margin-bottom: 15px;
`;

const StyledDocumentTitle = styled.div`
	font-weight: bold;
`;

export default class DocumentDetails extends React.Component {

	constructor(props) {
		super(props);

		this.renderExpanderHeader = this.renderExpanderHeader.bind(this);
	}

	render() {
		return (
			<StyledContainer>
				<Expander renderHeader={this.renderExpanderHeader}>
					{this.renderContent()}
				</Expander>
			</StyledContainer>
		);
	}

	renderExpanderHeader() {
		return (
			<StyledDocumentTitle>
				{this.props.document.title}
			</StyledDocumentTitle>
		);
	}

	renderContent() {
		const _this = this;

		const codingDocument = this.props.codingResult.getDocument(this.props.document.id);
		const codingOverlapCollection = codingDocument.getCodingOverlapCollection(this.props.selectedCode.codeID);

		return (
			<table style={{ borderSpacing: '5px', borderCollapse: 'separate' }}>
				<thead>
					<th>#</th>
					<th>% by {this.props.code.name}</th>
					<th>% by {this.props.selectedCode.name}</th>
					<th>Characters count {this.props.code.name}</th>
					<th>Characters count {this.props.selectedCode.name}</th>
					<th>Characters count overlap</th>
				</thead>
				<tbody>
					{(codingOverlapCollection) ? codingOverlapCollection.getCodingOverlaps().map((codingOverlap, index) => {
						return _this.renderItem(codingOverlap, index);
					}) : null}
				</tbody>
			</table>
		);
	}

	renderItem(codingOverlap, index) {
		return (
			<DocumentDetailsItem
				codingOverlap={codingOverlap}
				index={index}
			/>
		);
	}
}

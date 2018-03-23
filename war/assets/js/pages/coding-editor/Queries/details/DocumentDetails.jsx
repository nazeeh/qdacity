import React from 'react';
import styled from 'styled-components';

import Expander from '../../../../common/styles/expander/Expander.jsx';

import DocumentDetailsItem from './DocumentDetailsItem.jsx';

const StyledContainer = styled.div`
	padding-right: 20px;
	margin-bottom: 15px;
`;

const StyledDocumentTitle = styled.span`
	font-weight: bold;
`;

const StyledDocumentTitleCodingCount = styled.span`
	margin-left: 8px;
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
		const codingOverlapCount = this.props.codingDocument.getCodingOverlapCount(this.props.selectedCode.codeID);

		const title = this.props.document.title;
		const codingOverlapCountText = '(' + codingOverlapCount + ' coding overlap' + (codingOverlapCount == 1 ? '' : 's') + ')';

		return (
			<div>
				<StyledDocumentTitle>
					{title}
				</StyledDocumentTitle>
				<StyledDocumentTitleCodingCount>
					{codingOverlapCountText}
				</StyledDocumentTitleCodingCount>
			</div>
		);
	}

	renderContent() {
		const _this = this;

		const codingOverlapCollection = this.props.codingDocument.getCodingOverlapCollection(this.props.selectedCode.codeID);

		/*return (
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
		);*/
		return (
			<div>
				{(codingOverlapCollection) ? codingOverlapCollection.getCodingOverlaps().map((codingOverlap, index) => {
					return _this.renderItem(codingOverlap, index);
				}) : null}
			</div>
		);
	}

	renderItem(codingOverlap, index) {
		return (
			<DocumentDetailsItem
				code={this.props.code}
				selectedCode={this.props.selectedCode}
				codingOverlap={codingOverlap}
				index={index}
			/>
		);
	}
}

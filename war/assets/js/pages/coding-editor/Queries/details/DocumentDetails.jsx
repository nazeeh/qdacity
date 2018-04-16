import React from 'react';
import { FormattedMessage } from 'react-intl';
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

const StyledExpanderContent = styled.div`
	padding: 5px;
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

		const textCodingOverlap = (
			<FormattedMessage
				id="codeQueriesDetailsDocumentHeadlineCodingOverlap"
				defaultMessage="coding overlap"
			/>
		);
		const textCodingOverlaps = (
			<FormattedMessage
				id="codeQueriesDetailsDocumentHeadlineCodingOverlaps"
				defaultMessage="coding overlaps"
			/>
		);

		const codingOverlapCountText = [
			'(',
			codingOverlapCount,
			' ',
			(codingOverlapCount == 1 ? textCodingOverlap : textCodingOverlaps),
			')'
		];

		return (
			<div>
				<StyledDocumentTitle>
					{this.props.document.title}
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

		return (
			<StyledExpanderContent>
				{(codingOverlapCollection) ? codingOverlapCollection.getCodingOverlaps().map((codingOverlap, index) => {
					return _this.renderItem(codingOverlap, index, index == codingOverlapCollection.getCodingOverlaps().length - 1);
				}) : null}
			</StyledExpanderContent>
		);
	}

	renderItem(codingOverlap, index, isLastItem) {
		return (
			<DocumentDetailsItem
				code={this.props.code}
				selectedCode={this.props.selectedCode}
				codingOverlap={codingOverlap}
				index={index}
				isLastItem={isLastItem}
				openCodingEditor={this.props.openCodingEditor}
			/>
		);
	}
}

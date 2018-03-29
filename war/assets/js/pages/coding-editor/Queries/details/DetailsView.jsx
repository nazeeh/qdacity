import React from 'react';
import styled from 'styled-components';

import DocumentDetails from './DocumentDetails.jsx';

const StyledContainer = styled.div`
	overflow: auto;
	height: calc(100% - 45px);
`;

const StyledInfoBox = styled.div`
	margin-right: 20px;
	padding: 25px;
	text-align: center;
	border: 1px solid;
	border-color: ${props => props.theme.borderDefault};
	background-color: #f8f8f8;
`;

export default class DetailsView extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		// No code selected
		if (this.props.selectedCode == null) {
			return this.renderNoCodeSelected();
		}

		// If there are no overlaps,
		let foundOverlaps = false;

		for (let i = 0; i < this.props.documents.length; i++) {
			const codingDocument = this.props.codingResult.getDocument(this.props.documents[i].id);

			if (codingDocument.getCodingOverlapCount(this.props.selectedCode.codeID) > 0) {
				foundOverlaps = true;
				break;
			}
		}

		if (!foundOverlaps) {
			return this.renderZeroOverlaps();
		}

		// Render content
		return (
			<StyledContainer>
				{this.renderDocuments()}
			</StyledContainer>
		);
	}

	renderNoCodeSelected() {
		return (
			<StyledInfoBox>Please select a code from the list.</StyledInfoBox>
		);
	}

	renderZeroOverlaps() {
		return (
			<StyledInfoBox>No coding overlaps found.</StyledInfoBox>
		);
	}

	renderDocuments() {
		const _this = this;

		return this.props.documents.map(document => {
			return _this.renderDocument(document);
		});
	}

	renderDocument(document) {
		const codingDocument = this.props.codingResult.getDocument(document.id);

		if (codingDocument.getCodingOverlapCount(this.props.selectedCode.codeID) <= 0) {
			return '';
		}

		return (
			<DocumentDetails
				code={this.props.code}
				selectedCode={this.props.selectedCode}
				document={document}
				codingResult={this.props.codingResult}
				codingDocument={codingDocument}
				openCodingEditor={this.props.openCodingEditor}
			/>
		);
	}
}

import React from 'react';
import styled from 'styled-components';

import DocumentDetails from './DocumentDetails.jsx';

const StyledContainer = styled.div`
	overflow: auto;
	height: 100%;
`;

export default class DetailsView extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		// No code selected
		if (this.props.selectedCode == null) {
			return (
				<div>No code selected</div>
			);
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
			return (
				<div>0 Overlaps!</div>
			);
		}

		// Render content
		return (
			<StyledContainer>
				{this.renderDocuments()}
			</StyledContainer>
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
			/>
		);
	}
}

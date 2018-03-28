import React from 'react';
import styled from 'styled-components';

import DocumentDetails from './DocumentDetails.jsx';

const StyledDetailsContainer = styled.div`
	flex: 50%;
	max-width: 50%;
	overflow: auto;
	padding-left: 10px;
`;

export default class DetailsView extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		if (this.props.selectedCode == null) {
			return null;
		}

		return (
			<StyledDetailsContainer>
				{this.renderDocuments()}
			</StyledDetailsContainer>
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

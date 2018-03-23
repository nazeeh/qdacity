import React from 'react';
import styled from 'styled-components';

import DocumentDetails from './DocumentDetails.jsx';

const StyledDetailsContainer = styled.div`
	flex: 50%;
	overflow: auto;
`;

export default class DetailsView extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const _this = this;

		if (this.props.selectedCode == null) {
			return null;
		}

		return (
			<StyledDetailsContainer>
				{this.props.documents.map(document => {
					return _this.renderDocument(document);
				})}
			</StyledDetailsContainer>
		);
	}

	renderDocument(document) {
		const codingDocument = this.props.codingResult.getDocument(document.id);

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

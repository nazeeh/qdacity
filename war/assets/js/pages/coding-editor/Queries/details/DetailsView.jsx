import React from 'react';
import styled from 'styled-components';

import CodingOverlapText from './CodingOverlapText.jsx';

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
					return _this.renderDocumentDetails(document);
				})}
			</StyledDetailsContainer>
		);
	}

	renderDocumentDetails(document) {
		const _this = this;

		const codingDocument = this.props.codingResult.getDocument(document.id);
		const codingOverlapCollection = codingDocument.getCodingOverlapCollection(this.props.selectedCode.codeID);

		return (
			<div>
				<div>
					{document.title}
				</div>
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
							return _this.renderDocumentItem(codingOverlap, index);
						}) : null}
					</tbody>
				</table>
			</div>
		);
	}

	renderDocumentItem(codingOverlap, index) {
		return [
			<tr>
				<td>{index + 1}</td>
				<td>{codingOverlap.getOverlapPercentageByMainCode().toFixed(2)}</td>
				<td>{codingOverlap.getOverlapPercentageByOtherCode().toFixed(2)}</td>
				<td>{codingOverlap.getTextContent().getTextLengthMainCode()}</td>
				<td>{codingOverlap.getTextContent().getTextLengthOtherCode()}</td>
				<td>{codingOverlap.getTextContent().getTextLengthOverlap()}</td>
			</tr>,	
			<tr>
				<CodingOverlapText 
					codingOverlapText={codingOverlap.getTextContent()}
				/>
			</tr>		
		];
	}
}

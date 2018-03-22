import React from 'react';
import styled from 'styled-components';

import DocumentDetailsItem from './DocumentDetailsItem.jsx';

export default class DocumentDetails extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const _this = this;

		const codingDocument = this.props.codingResult.getDocument(this.props.document.id);
		const codingOverlapCollection = codingDocument.getCodingOverlapCollection(this.props.selectedCode.codeID);

		return (
			<div>
				<div>
					{this.props.document.title}
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
							return _this.renderItem(codingOverlap, index);
						}) : null}
					</tbody>
				</table>
			</div>
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

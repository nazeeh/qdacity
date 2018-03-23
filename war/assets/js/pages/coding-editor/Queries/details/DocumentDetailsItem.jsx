import React from 'react';
import styled from 'styled-components';

import { Collapsible } from '../../../../common/styles/expander/Collapsible.jsx';

import CodingOverlapText from './CodingOverlapText.jsx';

export default class DocumentDetailsItem extends React.Component {

	constructor(props) {
		super(props);

		this.textCollapsibleRef = null;
	}

	toggleText() {
		this.textCollapsibleRef.toggle();
	}	

	render() {
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
					<tr>
						<td>{this.props.index + 1}</td>
						<td>{this.props.codingOverlap.getOverlapPercentageByMainCode().toFixed(2)}</td>
						<td>{this.props.codingOverlap.getOverlapPercentageByOtherCode().toFixed(2)}</td>
						<td>{this.props.codingOverlap.getTextContent().getTextLengthMainCode()}</td>
						<td>{this.props.codingOverlap.getTextContent().getTextLengthOtherCode()}</td>
						<td>{this.props.codingOverlap.getTextContent().getTextLengthOverlap()}</td>
					</tr>	
					<tr>
						<td colSpan="6">
							<div>
								<button onClick={this.toggleText.bind(this)}>Toggle Text</button>
							</div>

							<Collapsible ref={(r) => {if (r) this.textCollapsibleRef = r}}>
								<CodingOverlapText
									codingOverlapText={this.props.codingOverlap.getTextContent()}
								/>
							</Collapsible>
						</td>
					</tr>	
				</tbody>
			</table>
		);
	}
}

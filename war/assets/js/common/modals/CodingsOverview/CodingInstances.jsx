import React from 'react'
import styled from 'styled-components';

export const StyledTextSegment = styled.div `
    font-size: 10pt;
    margin: 5px;
    display: block;
    background-color: ${props => props.selected ? props.theme.bgPrimaryHighlight : ''};

`;

export default class CodingInstances extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	renderList(){
		if (!this.props.documentsView.getDocuments) return;
		let textSegments= [];
		const docs = this.props.documentsView.getDocuments()
		for (var i in docs) {
			var doc = docs[i];
			var elements = doc.text;
			var found = $('coding', elements);
			var foundArray = $('coding[code_id=\'' + this.props.codeID + '\']', elements).map(function () {
				var tmp = {};
				tmp.id = $(this).attr('id');
				tmp.code_id = $(this).attr('code_id');
				tmp.author = $(this).attr('author');
				tmp.val = $(this).text();
				return tmp;

			});
			foundArray = foundArray.toArray();


			var idsAdded = []; // When a coding spans multiple HTML blocks, then
			// there will be multiple elements with the same ID


			var groupedSegments = {};
			for (var i = 0; i < foundArray.length; i++) {
			  var id = foundArray[i].id;
			  if (!groupedSegments[id]) {
			    groupedSegments[id] = "";
			  }
			  groupedSegments[id] += foundArray[i].val;
			}
			foundArray = [];
			for (var id in groupedSegments) {
			  foundArray.push(groupedSegments[id]);
			}

			textSegments = textSegments.concat(foundArray);
		}

		return textSegments.map((segment, index) => {
			if (segment === "") return;
			return (<div>
						<StyledTextSegment>{segment}</StyledTextSegment>
						<hr/>
					</div>);
		});
	}

	render(){
		return(
			<div>
				{this.renderList()}
			</div>
		);
	}
}
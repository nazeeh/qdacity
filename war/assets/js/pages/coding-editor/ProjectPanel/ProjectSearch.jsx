import React from 'react'

import StyledSearchField from '../../../common/styles/SearchField.jsx';
import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

export default class ProjectSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			search: "",
		};
		this.updateSearch = this.updateSearch.bind(this);
		this.searchProject = this.searchProject.bind(this);
	}

	updateSearch(e) {
		this.setState({
			search: e.target.value
		});
	}

	searchProject(){
		if (!this.props.documentsView.getDocuments) return;
		const docs =this.props.documentsView.getDocuments()
		for (var i in docs) {
			var doc = docs[i];
			if (doc.text.toLowerCase().indexOf(this.state.search.toLowerCase()) != -1){
			    alert(doc.text);
			}
		}
	}


	render(){
		return(
			<StyledSearchField className="searchfield" id="searchform">
				<input
					type="text"
					placeholder="Search for anything"
					value={this.state.search}
					onChange={this.updateSearch}
				/>
				<BtnDefault type="button" onClick={() => this.searchProject()}>
					<i className="fa fa-search  fa-lg"></i>
				</BtnDefault>
			</StyledSearchField>
		);
	}
}
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
		this.input = {};
		this.updateSearch = this.updateSearch.bind(this);
		this.searchProject = this.searchProject.bind(this);
	}

	updateSearch(e) {
		this.setState({
			search: e.target.value
		});
	}

	searchProject() {

		let results = {
			documentResults: this.searchDocuments(),
			memoResults: this.searchMemos()
		}
		this.props.setSearchResults(results);
	}

	searchDocuments() {
		let documents = [];
		if (!this.props.documentsView.getDocuments) return documents;
		const docs = this.props.documentsView.getDocuments();
		for (var i in docs) {
			var doc = docs[i];
			if (doc.text.toLowerCase().indexOf(this.state.search.toLowerCase()) != -1) {
				documents.push(doc);
			}
		}
		return documents;
	}

	searchMemos() {
		let codes = [];
		let codesystem = this.props.codesystemView.getAllCodes();
		for (var i in codesystem) {
			var code = codesystem[i];
			if (code.memo && code.memo.toLowerCase().indexOf(this.state.search.toLowerCase()) != -1) {
				codes.push(code);
			}
		}
		return codes;
	}

	componentDidMount(){
		this.input.focus();
	}

	render() {
		return (
			<StyledSearchField className="searchfield" id="searchform">
				<input
					ref={(c) => this.input = c}
					type="text"
					placeholder="Search for anything"
					value={this.state.search}
					onChange={this.updateSearch}
					onKeyPress={(e) => { if (e.key === 'Enter') this.searchProject();}}
				/>
				<BtnDefault type="button" onClick={() => this.searchProject()}>
					<i className="fa fa-search  fa-lg"></i>
				</BtnDefault>
			</StyledSearchField>
		);
	}
}
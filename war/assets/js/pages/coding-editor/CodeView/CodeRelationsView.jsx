import React from 'react';
import styled from 'styled-components';
import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';
import NewCodeRelation from '../../../common/modals/NewCodeRelation';

const StyledAddRelationBtn = styled.li `
	background-color: #FAFAFA !important;
	border-left-style: solid;
	border-left-width: thick;
	border-left-color: #337ab7;
	margin-bottom: 3px;
	&:hover {
        background: #337ab7 !important;
		color: #FFF;
    }
`;

const StyledRelationItem = styled.li `
	background-color: #DDD !important;
	border-left-style: solid;
	border-left-width: thick;
	border-left-color: #444;
`;

const StyledRelationName = styled.span `
	font-size: 12px;
	font-weight: bold;
`;

const StyledCodeName = styled.span `
	font-size: 16px;
`;

export default class CodeRelationsView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			relationships: [],
			selected: -1,
			sourceCode: -1
		};
		this.addRelationship = this.addRelationship.bind(this);
		this.getrelationships = this.getrelationships.bind(this);
	}

	setSourceCode(pId) {
		this.state.sourceCode = pId;
		this.setState({
			sourceCode: this.state.sourceCode
		});
	}

	setRelations(relations, pSourceId) {
		var _this = this;
		this.state.sourceCode = pSourceId;
		this.state.relationships = [];

		if (typeof relations == 'undefined') return;

		relations.forEach(function (relation) {
			var mmElement = _this.props.getElement(relation.mmElementId);
			var code = _this.props.getCodeByCodeID(relation.codeId);
			var codeName = "undefined";
			var mmElementName = "undefined";
			if (code != null) codeName = code.name;
			if (mmElement != null) mmElementName = mmElement.name;
			_this.addRelationship(relation.key.id, relation.codeId, codeName, relation.mmElementId, mmElementName);
		});

	}

	addRelationship(pRelId, pDstCodeId, pDstCodeName, pMmElementId, pName) {
		var rel = {};
		rel.dst = pDstCodeId;
		rel.dstName = pDstCodeName;
		rel.mmElementId = pMmElementId;
		rel.name = pName;
		rel.id = pRelId;

		this.state.relationships.push(rel);
	}


	removeRelationship(pId) {
		var index = this.state.relationships.findIndex(function (rel, index, array) {
			return rel.id == pId;
		});
		this.state.relationships.splice(index, 1);
		this.setState({
			relationships: this.state.relationships
		});
	}

	getrelationships() {
		return this.state.relationships;
	}

	createRelationship() {
		var _this = this;
		var newRelationModal = new NewCodeRelation(this.props.elements, this.props.getCodeSystem());
		newRelationModal.showModal().then(function (data) {
			var a = 1;
			CodesEndpoint.addRelationship(_this.state.sourceCode, data.codeId, data.mmElement.id).then(function (resp) {
				var mmElementName = data.mmElement.name;
				var code = _this.props.code;
				code.relations = resp.relations;
				_this.props.updateSelectedCode(code);
				_this.setRelations(code.relations, code.id);
				_this.forceUpdate();
			});
		});
	}

	deleteRelationship(relationshipId) {
		var _this = this;
		CodesEndpoint.removeRelationship(_this.state.sourceCode, relationshipId).then(function (resp) {
			_this.removeRelationship(relationshipId);
			var code = _this.props.code;
			code.relations = resp.relations;
			_this.props.updateSelectedCode(code);
			_this.forceUpdate();
		});
	}

	render() {
		this.setRelations(this.props.code.relations, this.props.code.id);
		var _this = this;
		return (
			<div className="list compactBoxList">
      <StyledAddRelationBtn className="btn-default clickable" onClick={() => {_this.createRelationship()}}>
								<i className="fa fa-plus fa-lg "></i>
								&nbsp;Add Relationship
	  </StyledAddRelationBtn>

        {
          this.state.relationships.map(function(rel) {
            return(
				<StyledRelationItem key={rel.id} className="clickable">
		            <a className="pull-right  btn  fa-stack fa-lg" onClick={() => {_this.deleteRelationship(rel.id)}}>
		            <i className="fa fa-square fa-stack-2x fa-cancel-btn-circle fa-hover"></i>
		            <i className="fa fa-trash fa-stack-1x fa-inverse fa-cancel-btn"></i>
		            </a>

		            <StyledRelationName>{rel.name}</StyledRelationName>
		            <br/>
		            <StyledCodeName> {rel.dstName}</StyledCodeName>
	            </StyledRelationItem>
			);
          })
        }
      </div>
		);
	}


}
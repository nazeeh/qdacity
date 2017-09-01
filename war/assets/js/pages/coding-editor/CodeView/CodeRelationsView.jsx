import React from 'react';
import styled from 'styled-components';
import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';
import NewCodeRelation from '../../../common/modals/NewCodeRelation';

const StyledHeadline = styled.div `
    font-size: 15px;
    margin-bottom: 6px;
    font-weight: bold;
`;

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

const StyledCodeName = styled.span `
	font-size: 14px;
    font-weight: ${props => props.highlight ? 'bold' : 'normal'};
`;

const StyledRelationName = styled.span `
    font-size: 14px;
    font-weight: bold;
    font-style: italic;
`;

const StyledButton = styled.a `
    margin-top: 9px;
    margin-right: 10px;
`;

export default class CodeRelationsView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			relationships: [],
			incomingRelationships: [],
			selected: -1,
			sourceCode: -1
		};
	}

	setSourceCode(pId) {
		this.state.sourceCode = pId;
		this.setState({
			sourceCode: this.state.sourceCode
		});
	}

	createRelationObject(relation) {
		let mmElement = this.props.getElement(relation.mmElementId);
		let sourceCode = this.props.getCodeById(relation.key.parent.id);
		let destinationCode = this.props.getCodeByCodeID(relation.codeId);

		let mmElementName = "undefined";
		let sourceCodeName = "undefined";
		let destinationCodeName = "undefined";

		if (mmElement != null) mmElementName = mmElement.name;
		if (sourceCode != null) sourceCodeName = sourceCode.name;
		if (destinationCode != null) destinationCodeName = destinationCode.name;

		return {
			id: relation.key.id,
			name: mmElementName,
			sourceName: sourceCodeName,
			destinationName: destinationCodeName,
			dst: relation.codeId,
			mmElementId: relation.mmElementId,
			relationshipCodeId: relation.relationshipCodeId
		};
	}

	setIncomingRelations(code) {
		const _this = this;

		this.state.incomingRelationships = [];

		let checkRelation = (relation) => {
			if (relation.codeId == code.codeID) {
				_this.state.incomingRelationships.push(_this.createRelationObject(relation));
			}
		};

		let checkCode = (c) => {
			if (c.relations != null) {
				c.relations.forEach((relation) => {
					checkRelation(relation);
				});
			}

			if (c.children != null) {
				c.children.forEach((child) => {
					checkCode(child);
				});
			}
		};

		let codesystem = this.props.getCodeSystem();

		checkCode(codesystem[0]);
	}

	setRelations(relations, pSourceId) {
		var _this = this;
		this.state.sourceCode = pSourceId;
		this.state.relationships = [];

		if (typeof relations == 'undefined') return;

		relations.forEach((relation) => {
			_this.addRelationship(relation);
		});
	}

	addRelationship(relation) {
		this.state.relationships.push(this.createRelationObject(relation));
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

	deleteRelationship(relation) {
		var _this = this;
		CodesEndpoint.removeRelationship(_this.state.sourceCode, relation.id).then(function (resp) {
			// If the relationship belongs to a relationship-code, update the relationship-code and set the relation to null
			if (relation.relationshipCodeId != null) {
				let relationshipCode = _this.props.getCodeById(relation.relationshipCodeId);
				relationshipCode.relationshipCode = null;
				relationshipCode.mmElementIDs = [];

				CodesEndpoint.updateCode(relationshipCode).then((resp2) => {
					// Do nothing
				});
			}

			_this.removeRelationship(relation.id);
			var code = _this.props.code;
			code.relations = resp.relations;
			_this.props.updateSelectedCode(code);
			_this.forceUpdate();

		});
	}

	createRelationshipCode(relation) {
		const name = this.props.code.name + " " + relation.name + " " + relation.destinationName;
		this.props.createCode(name, relation.id, this.state.sourceCode, true);
	}

	goToRelationshipCode(relation) {
		this.props.selectCode(this.props.getCodeById(relation.relationshipCodeId));
	}

	renderCreateRelationshipCodeButton(relation) {
		const _this = this;

		if (relation.relationshipCodeId == null) {
			return (
				<StyledButton className="pull-right btn btn-default" onClick={() => {_this.createRelationshipCode(relation)}}><i className="fa fa-plus"></i>  Create relationship code</StyledButton>
			);
		} else {
			return null;
		}
	}

	renderGoToRelationshipCodeButton(relation) {
		const _this = this;

		if (relation.relationshipCodeId != null) {
			return (
				<StyledButton className="pull-right btn btn-default" onClick={() => {_this.goToRelationshipCode(relation)}}><i className="fa fa-arrow-right"></i>  Go to relationship code</StyledButton>
			);
		} else {
			return null;
		}
	}

	renderAddRelationButton(onClick) {
		return (
			<StyledAddRelationBtn className="btn-default clickable" onClick={onClick}>
                <i className="fa fa-plus fa-lg "></i>
                &nbsp;Add Relationship
            </StyledAddRelationBtn>
		);
	}

	renderOutgoingRelations() {
		var _this = this;

		this.setRelations(this.props.code.relations, this.props.code.id);

		return (
			<div className="col-sm-7 list compactBoxList">
                <StyledHeadline>Outgoing relations</StyledHeadline>
                    
                {_this.renderAddRelationButton(() => {_this.createRelationship()})}

                {
                    this.state.relationships.map(function(rel) {
                        return (
                            <StyledRelationItem key={rel.id} className="clickable">
                                <a className="pull-right  btn  fa-stack fa-lg" onClick={() => {_this.deleteRelationship(rel)}}>
                                    <i className="fa fa-square fa-stack-2x fa-cancel-btn-circle fa-hover"></i>
                                    <i className="fa fa-trash fa-stack-1x fa-inverse fa-cancel-btn"></i>
                                </a>
                            
                                {_this.renderCreateRelationshipCodeButton(rel)}
                                {_this.renderGoToRelationshipCodeButton(rel)}

                                <StyledCodeName>{rel.sourceName}</StyledCodeName>
                                <br/>
                                <StyledRelationName>{rel.name + ' '}</StyledRelationName>
                                <StyledCodeName highlight="true"> {rel.destinationName}</StyledCodeName>
                            </StyledRelationItem>
                        );
                    })
                }
            </div>
		);
	}

	renderIncomingRelations() {
		const _this = this;

		this.setIncomingRelations(this.props.code);

		return (
			<div className="col-sm-5 list compactBoxList">
		        <StyledHeadline>Incoming relations</StyledHeadline>

                {_this.renderAddRelationButton(() => {})}

                {
                    _this.state.incomingRelationships.map((rel) => {
                        return(
                            <StyledRelationItem key={rel.id}>
                                <StyledCodeName highlight="true">{rel.sourceName}</StyledCodeName>
                                <StyledRelationName>{' ' + rel.name}</StyledRelationName>
                                <br/>
                                <StyledCodeName>{rel.destinationName}</StyledCodeName>
                            </StyledRelationItem>
                        );
                    })
                }
            </div>
		);
	}

	render() {
		return (
			<div>
                {this.renderIncomingRelations()}
		        {this.renderOutgoingRelations()}
            </div>
		);
	}
}
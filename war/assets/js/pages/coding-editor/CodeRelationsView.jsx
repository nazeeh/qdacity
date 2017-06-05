import React from 'react';
import CodesEndpoint from '../../common/endpoints/CodesEndpoint';
import NewCodeRelation from '../../common/modals/NewCodeRelation';

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

	getStyles() {
		return {
			lightButton: {
				backgroundColor: "#FAFAFA",
				borderLeftStyle: "solid",
				borderLeftWidth: "thick",
				borderLeftColor: "#337ab7",
				marginBottom: "3px"
			},
			listItem: {
				backgroundColor: "#DDD",
				borderLeftStyle: "solid",
				borderLeftWidth: "thick",
				borderLeftColor: "#444"
			},
			relation: {
				fontSize: "12px",
				fontWeight: "bold"
			},
			dstCode: {
				fontSize: "16px"
			}
		};
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
		this.setState({
			relationships: this.state.relationships,
			sourceCode: this.state.sourceCode,
		});

		if (typeof relations == 'undefined') return;

		relations.forEach(function (relation) {
			var mmElement = _this.props.metaModelView.getElement(relation.mmElementId);
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
		this.setState({
			relationships: this.state.relationships
		});
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
		var newRelationModal = new NewCodeRelation(this.props.metaModelView, this.props.getCodeSystem());
		newRelationModal.showModal().then(function (data) {
			var a = 1;
			CodesEndpoint.addRelationship(_this.state.sourceCode, data.codeId, data.mmElementId).then(function (resp) {
				var mmElementName = _this.props.metaModelView.getElement(data.mmElementId).name;
				var code = _this.props.getSelectedCode();
				code.relations = resp.relations;
				_this.props.updateSelectedCode(code);
				_this.setRelations(code.relations, code.id);
			});
		});
	}

	deleteRelationship(relationshipId) {
		var _this = this;
		CodesEndpoint.removeRelationship(_this.state.sourceCode, relationshipId).then(function (resp) {
			_this.removeRelationship(relationshipId);
			var code = _this.props.getSelectedCode();
			code.relations = resp.relations;
			_this.props.updateSelectedCode(code);
		});
	}

	render() {
		const styles = this.getStyles();
		var _this = this;
		return (
			<div className="list compactBoxList">
      <li id="allRelationBtn"  className="btn-default clickable" style={styles.lightButton} onClick={() => {_this.createRelationship()}}>
								<i className="fa fa-plus fa-lg "></i>
								&nbsp;Add Relationship
	  </li>
	
        {
          this.state.relationships.map(function(rel) {
            return <li key={rel.id} className="clickable" style={styles.listItem}>
            <a className="pull-right  btn  fa-stack fa-lg" onClick={() => {_this.deleteRelationship(rel.id)}}>
            <i className="fa fa-square fa-stack-2x fa-cancel-btn-circle fa-hover"></i>
            <i className="fa fa-trash fa-stack-1x fa-inverse fa-cancel-btn"></i>
            </a>
            
            <span style={styles.relation}>{rel.name}</span>
            <br/>
            <span style={styles.dstCode}> {rel.dstName}</span> 
            
            </li>
          })
        }
      </div>
		);
	}


}
import React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import MetaModelView from "./MetaModelView.jsx";
import CodeRelationsView from "./CodeRelationsView.jsx";
import MetaModelElement from "./MetaModelElement";
import SimpleCodesystem from "../Codesystem/SimpleCodesystem.jsx";

import MetaModelEntityEndpoint from "../../../common/endpoints/MetaModelEntityEndpoint";
import CodesEndpoint from "../../../common/endpoints/CodesEndpoint";

const StyledCodeviewComponent = styled.div`
  padding: 8px 8px 0px 8px;
`;

export default class MetaModel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      code: {},
      elements: {},
      selected: []
    };

    this.sourceCodeCodesystemRef = null;
    this.destinationCodeCodesystemRef = null;

    this.getElement = this.getElement.bind(this);
    this.addSelected = this.addSelected.bind(this);
    this.setElements = this.setElements.bind(this);
    this.setActiveElement = this.setActiveElement.bind(this);
    this.updateActiveElement = this.updateActiveElement.bind(this);
    this.relatinoshipSourceChanged = this.relatinoshipSourceChanged.bind(this);
    this.relatinoshipDestinationChanged = this.relatinoshipDestinationChanged.bind(
      this
    );
  }

  setElements(elements) {
    this.setState({
      elements: elements
    });
  }

  setActiveIds(elementIds) {
    var _this = this;

    _this.resetSelection();

    if (elementIds != null) {
      elementIds.forEach(elementId => _this.setActiveId(elementId));
    } else {
      this.setActiveId(null);
    }
  }

  setActiveId(elementId) {
    let element = this.getElement(elementId);

    if (typeof element != "undefined" && element != null) {
      this.setActiveElement(element);
    } else {
      this.resetSelection();
    }
  }

  updateActiveElement(element) {
    const previousMetaModelElementIds =
      this.props.code.mmElementIDs != null
        ? this.props.code.mmElementIDs.slice(0)
        : [];

    this.setActiveElement(element);
    this.props.code.mmElementIDs = this.state.selected.slice(0);

    if (element.type == "RELATIONSHIP") {
      if (previousMetaModelElementIds.length != 0) {
        for (let i = 0; i < previousMetaModelElementIds.length; i++) {
          if (
            this.getElement(previousMetaModelElementIds[i]).type !=
            "RELATIONSHIP"
          ) {
            // Changed from normal code to relationship code
            this.convertNormalCodeToRelationshipCode();
            return;
          }
        }
      } else {
        // Changed from normal code to relationship code
        this.convertNormalCodeToRelationshipCode();
        return;
      }
    } else {
      if (previousMetaModelElementIds.length != 0) {
        for (let i = 0; i < previousMetaModelElementIds.length; i++) {
          if (
            this.getElement(previousMetaModelElementIds[i]).type ==
            "RELATIONSHIP"
          ) {
            // Changed from relationship code to normal code
            this.convertRelationshipCodeToNormalCode();
            return;
          }
        }
      }
    }

    if (!this.isRelationshipCode()) {
      this.props.updateSelectedCode(this.props.code, true);
    } else {
      this.props.updateSelectedCode(this.props.code, false);
      this.relationshipCodeMetaModelChanged();
    }

    this.forceUpdate();
  }

  setActiveElement(element) {
    const _this = this;

    // Compare element with selection
    this.state.selected.forEach(selectedId => {
      const selected = _this.getElement(selectedId);

      if (element.type != selected.type) {
        const groupId = _this.state.elements[selected.getGroup()];
        _this.resetSelectionForGroup(groupId);
      }
    });

    let group = this.state.elements[element.getGroup()];

    this.resetSelectionForGroup(group);

    element.toggleSelected();

    this.selectGeneralizations(element.getId(), group);
    this.addSelected(element.getId());
  }

  selectGeneralizations(elementID, group) {
    let _this = this;
    group.forEach(function(el) {
      if (el.hasSpecialization(elementID)) {
        el.setSelected(true);
        //recursion
        _this.selectGeneralizations(el.getId(), group);
      }
    });
  }

  resetSelection() {
    for (let key in this.state.elements) {
      this.resetSelectionForGroup(this.state.elements[key]);
    }
  }

  resetSelectionForGroup(group) {
    let _this = this;

    group.forEach(function(el) {
      el.setSelected(false);

      let index = _this.state.selected.indexOf(el.id);
      if (index > -1) {
        _this.state.selected.splice(index, 1);
      }
    });
  }

  addSelected(id) {
    this.state.selected.push(id);
  }

  getElement(elementId) {
    let idFilter = function(el) {
      return el.getId() === elementId;
    };

    for (let key in this.state.elements) {
      let element = this.state.elements[key].find(idFilter);

      if (element != null) {
        return element;
      }
    }

    return null;
  }

  setCode(code) {
    this.setState({
      code: code
    });
  }

  saveSettings() {
    this.props.code.mmElementIDs = this.state.selected;
    this.props.updateSelectedCode(this.props.code, true);
  }

  isRelationshipCode() {
    const _this = this;

    let isRelationship = false;

    this.state.selected.forEach(selectedId => {
      const selected = _this.getElement(selectedId);
      if (selected.type == "RELATIONSHIP") {
        isRelationship = true;
      }
    });

    return isRelationship;
  }

  convertRelationshipCodeToNormalCode() {
    const _this = this;

    let relation = this.props.code.relationshipCode;

    if (relation != null) {
      CodesEndpoint.removeRelationship(
        relation.key.parent.id,
        relation.key.id
      ).then(resp => {
        // Update the code
        const storedCode = _this.props.getCodeByCodeID(resp.codeID);
        storedCode.relations = resp.relations;

        // Update metamodel and set relationshipCode to null
        _this.props.code.relationshipCode = null;

        _this.props.updateSelectedCode(_this.props.code, true);
      });
    }
  }

  convertNormalCodeToRelationshipCode() {
    const _this = this;

    CodesEndpoint.removeAllRelationships(this.props.code.id).then(resp => {
      // Update the code
      const storedCode = _this.props.getCodeByCodeID(resp.codeID);
      storedCode.relations = resp.relations;

      // Update metamodel
      _this.props.updateSelectedCode(_this.props.code, true);
    });
  }

  relationshipCodeMetaModelChanged() {
    const _this = this;

    CodesEndpoint.updateRelationshipCodeMetaModel(
      this.props.code.id,
      this.props.code.mmElementIDs[0]
    ).then(resp => {
      if (_this.props.code.relationshipCode != null) {
        _this.props.code.relationshipCode.mmElementId =
          _this.props.code.mmElementIDs[0];

        // Update the relation
        let code = _this.props.getCodeById(resp.relationshipCode.key.parent.id);

        for (let i = 0; i < code.relations.length; i++) {
          let rel = code.relations[i];

          if (rel.key.id == resp.relationshipCode.key.id) {
            rel.mmElementId = _this.props.code.mmElementIDs[0];
            break;
          }
        }
      }
    });
  }

  relatinoshipSourceChanged(sourceCode) {
    this.updateRelationShipCode(sourceCode, null);
  }

  relatinoshipDestinationChanged(destinationCode) {
    this.updateRelationShipCode(null, destinationCode);
  }

  updateRelationShipCode(newSourceCode, newDestinationCode) {
    const _this = this;

    const updateCode = (relationSourceCode, newRelation) => {
      CodesEndpoint.updateRelationshipCode(
        _this.props.code.id,
        relationSourceCode.id,
        newRelation.key.id
      ).then(resp3 => {
        _this.props.code.relationshipCode = resp3.relationshipCode;

        // Update the relation
        for (let i = 0; i < relationSourceCode.relations.length; i++) {
          let rel = relationSourceCode.relations[i];

          if (rel.key.id == newRelation.key.id) {
            rel.relationshipCodeId = resp3.id;
            break;
          }
        }
      });
    };

    const addNewRelationship = (
      newRelationSourceId,
      newRelationDestinationCodeId,
      relationMetaModelId
    ) => {
      CodesEndpoint.addRelationship(
        newRelationSourceId,
        newRelationDestinationCodeId,
        relationMetaModelId,
        false
      ).then(resp2 => {
        // Update the code
        const relationSourceCode = _this.props.getCodeByCodeID(resp2.codeID);
        relationSourceCode.relations = resp2.relations;

        // Find relation
        let newRelation = null;

        for (let i = 0; i < resp2.relations.length; i++) {
          let rel = resp2.relations[i];

          if (
            rel.mmElementId == relationMetaModelId &&
            rel.codeId == newRelationDestinationCodeId &&
            rel.key.parent.id == newRelationSourceId
          ) {
            newRelation = rel;
            break;
          }
        }

        updateCode(relationSourceCode, newRelation);
      });
    };

    const removeOldRelationship = relation => {
      CodesEndpoint.removeRelationship(
        relation.key.parent.id,
        relation.key.id
      ).then(resp => {
        // Update the code
        const storedCode = _this.props.getCodeByCodeID(resp.codeID);
        storedCode.relations = resp.relations;

        // Select relation source and destination
        let newRelationSourceId = null;

        if (newSourceCode != null) {
          newRelationSourceId = newSourceCode.id;
        } else {
          newRelationSourceId = relation.key.parent.id;
        }

        let newRelationDestinationCodeId = null;

        if (newDestinationCode != null) {
          newRelationDestinationCodeId = newDestinationCode.codeID;
        } else {
          newRelationDestinationCodeId = relation.codeId;
        }

        addNewRelationship(
          newRelationSourceId,
          newRelationDestinationCodeId,
          relation.mmElementId
        );
      });
    };

    let relation = this.props.code.relationshipCode;

    // Remove relation, add relation, update relationship-code
    if (relation != null) {
      removeOldRelationship(relation);
    } else {
      // Create a relation
      let sourceId = null;
      let destinationCodeId = null;

      if (newSourceCode != null) {
        sourceId = newSourceCode.id;
      } else {
        sourceId = this.sourceCodeCodesystemRef.getSelected().id;
      }
      if (newDestinationCode != null) {
        destinationCodeId = newDestinationCode.codeID;
      } else {
        destinationCodeId = this.destinationCodeCodesystemRef.getSelected()
          .codeID;
      }

      if (sourceId != null && destinationCodeId != null) {
        addNewRelationship(
          sourceId,
          destinationCodeId,
          this.props.code.mmElementIDs[0]
        );
      }
    }
  }

  renderContent() {
    const _this = this;

    if (!this.isRelationshipCode()) {
      return (
        <div>
          <div className="col-sm-6">
            <CodeRelationsView
              {...this.props}
              code={this.props.code}
              getElement={this.getElement}
              elements={this.state.elements}
              getCodeById={this.props.getCodeById}
              getCodeByCodeID={this.props.getCodeByCodeID}
              getCodesystem={this.props.getCodeSystem}
              createCode={this.props.createCode}
              selectCode={this.props.selectCode}
              deleteRelationship={this.props.deleteRelationship}
            />
          </div>
        </div>
      );
    } else {
      const sourceCode = this.props.code.relationshipCode
        ? this.props.getCodeById(this.props.code.relationshipCode.key.parent.id)
        : null;
      const destinationCode = this.props.code.relationshipCode
        ? this.props.getCodeByCodeID(this.props.code.relationshipCode.codeId)
        : null;

      let isCodeSelectable = code => {
        return code.relationshipCode == null && code.id != _this.props.code.id;
      };

      return (
        <div>
          <div className="col-sm-3">
            <FormattedMessage
              id="metamodel.source_code"
              defaultMessage="Source-Code"
            />:
            <SimpleCodesystem
              ref={c => {
                if (c) this.sourceCodeCodesystemRef = c;
              }}
              height="200"
              selected={sourceCode}
              codesystem={this.props.getCodeSystem()}
              notifyOnSelected={this.relatinoshipSourceChanged}
              isCodeSelectable={isCodeSelectable}
            />
          </div>
          <div className="col-sm-3">
            <FormattedMessage
              id="metamodel.dest_code"
              defaultMessage="Destination-Code"
            />:
            <SimpleCodesystem
              ref={c => {
                if (c) this.destinationCodeCodesystemRef = c;
              }}
              height="200"
              selected={destinationCode}
              codesystem={this.props.getCodeSystem()}
              notifyOnSelected={this.relatinoshipDestinationChanged}
              isCodeSelectable={isCodeSelectable}
            />
          </div>
        </div>
      );
    }
  }

  render() {
    const _this = this;

    this.setActiveIds(this.props.code.mmElementIDs);

    return (
      <StyledCodeviewComponent>
        <div>
          <div className="col-sm-6">
            <MetaModelView
              code={this.props.code}
              selected={this.state.selected}
              elements={this.state.elements}
              updateActiveElement={this.updateActiveElement}
              setElements={this.setElements}
            />
          </div>
          {this.renderContent()}
        </div>
      </StyledCodeviewComponent>
    );
  }
}

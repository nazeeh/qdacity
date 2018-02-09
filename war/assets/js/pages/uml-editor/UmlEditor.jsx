import React from "react";
import IntlProvider from "../../common/Localization/LocalizationProvider";
import styled from "styled-components";

import ConsistencyManager from "./ConsistencyManager.js";

import MetaModelMapper from "./mapping/MetaModelMapper.js";
import { DefaultRuleSet } from "./DefaultRuleSet.js";

import CreateClassFieldAction from "./mapping/actions/CreateClassFieldAction.js";
import CreateClassMethodAction from "./mapping/actions/CreateClassMethodAction.js";

import CodePositionManager from "./CodePositionManager.js";

import Toolbar from "./toolbar/Toolbar.jsx";
import GraphView from "./view/graph/GraphView.jsx";

import UmlCodePropertyModal from "../../common/modals/UmlCodePropertyModal";

import CodesEndpoint from "../../common/endpoints/CodesEndpoint";
import MetaModelEntityEndpoint from "../../common/endpoints/MetaModelEntityEndpoint";
import MetaModelRelationEndpoint from "../../common/endpoints/MetaModelRelationEndpoint";

const StyledUmlEditor = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  border-left: 1px solid #b0b0b0;
`;

export default class UmlEditor extends React.Component {
  constructor(props) {
    super(props);

    this.initialized = false;

    this.graphView = null;
    this.toolbar = null;

    this.codePositionManager = null;

    this.metaModelMapper = null;

    this.mmEntities = null;
    this.mmRelation = null;

    this.codesystemLoaded = false;
    this.metamodelLoaded = false;

    this.codesystemFinishedLoading = this.codesystemFinishedLoading.bind(this);
  }

  getToolbar() {
    return this.toolbar;
  }

  getGraphView() {
    return this.graphView;
  }

  getMetaModelMapper() {
    return this.metaModelMapper;
  }

  getMetaModelEntities() {
    return this.mmEntities;
  }

  getMetaModelRelations() {
    return this.mmRelations;
  }

  getMetaModelEntityById(id) {
    return this.mmEntities.find(mmEntity => mmEntity.id == id);
  }

  getMetaModelEntityByName(name) {
    return this.mmEntities.find(mmEntity => mmEntity.name == name);
  }

  componentDidMount() {
    this.loadMetaModel();
  }

  loadMetaModel() {
    const _this = this;

    MetaModelEntityEndpoint.listEntities(1).then(function(resp) {
      _this.mmEntities = resp.items || [];

      MetaModelRelationEndpoint.listRelations(1).then(function(resp) {
        _this.mmRelations = resp.items || [];

        _this.metaModelFinishedLoading();
      });
    });
  }

  metaModelFinishedLoading() {
    this.metaModelLoaded = true;

    if (this.codesystemLoaded && !this.initialized) {
      this.initialized = true;
      this.initialize();
    }
  }

  codesystemFinishedLoading() {
    this.codesystemLoaded = true;

    if (this.metaModelLoaded && !this.initialized) {
      this.initialized = true;
      this.initialize();
    }
  }

  initialize() {
    const _this = this;

    this.consistencyManager = new ConsistencyManager(this);
    this.codePositionManager = new CodePositionManager();

    this.initializeMapping();

    this.initializeSelection();

    this.initCellsMovedEventListener();

    this.codePositionManager.listCodePositions(
      this.props.codesystemId,
      umlCodePositions => {
        _this.initializeNodes();
      }
    );
  }

  initializeMapping() {
    this.metaModelMapper = new MetaModelMapper(this);
    this.metaModelMapper.registerRules(DefaultRuleSet);
  }

  initializeSelection() {
    const _this = this;

    this.graphView.addSelectionChangedEventListener((sender, evt) => {
      const cells = sender.cells;

      if (!_this.graphView.isConnectingEdge()) {
        if (cells != null && cells.length >= 1) {
          const cell = cells[0];

          if (_this.graphView.isCellUmlClass(cell)) {
            const code = _this.getCodeByNode(cell);
            this.props.codesystemView.setSelected(code);
          } else if (_this.graphView.isCellEdge(cell)) {
            const relationshipCode = _this.getRelationshipCodeByRelationId(
              cell.value.getRelationId()
            );

            // Relation can exist without a relationship code
            if (relationshipCode != null) {
              this.props.codesystemView.setSelected(relationshipCode);
            }
          }
        }
      }
    });
  }

  initializeNodes() {
    let codes = this.getCodes();

    let relations = [];

    // Map codes first and relations after
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];

      this.consistencyManager.initializeCode(code);
    }

    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];

      // Relations mapping
      if (code.relations != null) {
        for (let j = 0; j < code.relations.length; j++) {
          const relation = code.relations[j];

          this.consistencyManager.initializeCodeRelation(relation);
        }
      }
    }
  }

  initCellsMovedEventListener() {
    let _this = this;

    this.graphView.addCellsMovedEventListener(function(sender, event) {
      let cells = event.properties.cells;
      let dx = event.properties.dx;
      let dy = event.properties.dy;

      let umlCodePositions = [];

      cells.forEach(cell => {
        if (_this.graphView.isCellUmlClass(cell)) {
          let code = _this.getCodeByNode(cell);

          let codePosition = _this.codePositionManager.getCodePosition(
            code.codeID
          );
          codePosition.x = cell.getGeometry().x;
          codePosition.y = cell.getGeometry().y;

          umlCodePositions.push(codePosition);
        }
      });

      _this.codePositionManager.insertOrUpdateCodePositions(umlCodePositions);
    });
  }

  codesystemSelectionChanged(code) {
    // Selected code has a node
    let node = this.getNodeByCodeId(code.id);

    if (code.relationshipCode != null) {
      let relationId = code.relationshipCode.key.id;
      let edge = this.graphView.getEdgeByRelationId(relationId);

      // Select code if the edge does not exist
      if (edge == null) {
        let sourceCode = this.getCodeById(code.relationshipCode.key.parent.id);
        let destinationCode = this.getCodeById(code.relationshipCode.codeId);

        if (sourceCode != null) {
          node = this.getNodeByCodeId(sourceCode.id);
        } else if (destinationCode != null) {
          node = this.getNodeByCodeId(destinationCode.id);
        }
      } else {
        node = edge;
      }
    }

    // Prevent loops
    if (!this.graphView.isCellSelected(node)) {
      // Reset edge if connecting
      if (this.graphView.isConnectingEdge()) {
        this.graphView.resetConnectingEdge();
      }

      // Clear selection
      this.graphView.clearSelection();

      // Select node
      if (node != null) {
        this.graphView.selectCell(node);
        this.graphView.panToCell(node, false);
      }
    }
  }

  /**
   * Callback for the graphView zoom function.
   */
  onZoom(percentage) {
    this.umlEditor.toolbar.onZoom(percentage);
  }

  /**
   * Opens a modal, where the user can select a can select a code for a new class field.
   */
  openClassFieldModal(cell) {
    const { formatMessage } = IntlProvider.intl;
    const _this = this;

    const code = this.getCodeByNode(cell);

    const relationMetaModelEntityName = this.metaModelMapper.getClassFieldRelationEntityName();
    const mappingIdentifier = new CreateClassFieldAction().getIdentifier();

    const addFieldModal = new UmlCodePropertyModal(
      this,
      formatMessage({
        id: "umleditor.add_field",
        defaultMessage: "Add new Field"
      }),
      code,
      _this.props.codesystemView,
      relationMetaModelEntityName,
      mappingIdentifier
    );

    addFieldModal.showModal().then(function(data) {
      _this.createField(code, data.selectedCode);
    });
  }

  /**
   * Opens a modal, where the user can select a can select a code for a new class method.
   */
  openClassMethodModal(cell) {
    const { formatMessage } = IntlProvider.intl;
    const _this = this;

    const code = this.getCodeByNode(cell);

    const relationMetaModelEntityName = this.metaModelMapper.getClassMethodRelationEntityName();
    const mappingIdentifier = new CreateClassMethodAction().getIdentifier();

    const addMethodModal = new UmlCodePropertyModal(
      this,
      formatMessage({
        id: "umleditor.add_method",
        defaultMessage: "Add new Method"
      }),
      code,
      _this.props.codesystemView,
      relationMetaModelEntityName,
      mappingIdentifier
    );

    addMethodModal.showModal().then(function(data) {
      _this.createMethod(code, data.selectedCode);
    });
  }

  /**
   * Returns an array containing all codes.
   */
  getCodes() {
    // Convert codes into a simple array
    let codes = [];

    let convertCodeIntoSimpleArray = code => {
      codes.push(code);

      if (code.children) {
        code.children.forEach(convertCodeIntoSimpleArray);
      }
    };

    this.props.codesystemView
      .getCodesystem()
      .forEach(convertCodeIntoSimpleArray);

    return codes;
  }

  /**
   * Returns the code with the given id.
   */
  getCodeById(id) {
    return this.props.getCodeById(id);
  }

  /**
   * Returns the code with the given codeId.
   */
  getCodeByCodeId(codeId) {
    return this.props.getCodeByCodeId(codeId);
  }

  /**
   * Returns the code connected to the given node.
   */
  getCodeByNode(node) {
    const cellValue = node.value;
    return this.getCodeById(cellValue.getCodeId());
  }

  /**
   * Returns the node connected to the given code (id).
   */
  getNodeByCodeId(id) {
    return this.graphView.getNodeByCodeId(id);
  }

  /**
   * Returns the relationship code with the given relation id.
   */
  getRelationshipCodeByRelationId(relationId) {
    let allCodes = this.getCodes();

    for (let i = 0; i < allCodes.length; i++) {
      if (allCodes[i].relationshipCode != null) {
        if (allCodes[i].relationshipCode.key.id == relationId) {
          return allCodes[i];
        }
      }
    }

    return null;
  }

  /**
   * Returns the relation (with the given id) of a specific code. If the relation does not exist, this method returns null.
   * @param {any} relationId
   */
  getRelationOfCode(code, relationId) {
    if (code.relations != null) {
      for (let i = 0; i < code.relations.length; i++) {
        if (code.relations[i].key.id == relationId) {
          return code.relations[i];
        }
      }
    }
    return null;
  }

  /**
   * Does the code have a corresponding node? Checks if the code is mapped in the uml editor (as a class object).
   */
  isCodeMapped(code) {
    return this.getNodeByCodeId(code.id) != null;
  }

  /**
   * Updates the meta-model of the code in the database. This method will insert a new meta-model, which ensures, that the code is mapped in the uml-editor.
   */
  makeCodeVisibleInEditor(codeId) {
    const code = this.getCodeByCodeId(codeId);

    const newMMElementIds = [];

    const newMMElement = this.getMetaModelEntityByName(
      this.metaModelMapper.getDefaultUmlClassMetaModelName()
    );
    newMMElementIds.push(newMMElement.id);

    // Save old mmElementIds
    if (code.mmElementIDs != null) {
      for (let i = 0; i < code.mmElementIDs.length; i++) {
        const mmElement = this.getMetaModelEntityById(code.mmElementIDs[i]);

        if (mmElement.group != newMMElement.group) {
          newMMElementIds.push(mmElement.id);
        }
      }
    }

    code.mmElementIDs = newMMElementIds;

    this.props.syncService.codes.updateCode(code).then(resp => {
      code.mmElementIDs = resp.mmElementIDs;
      this.props.updateCode(code);
    });
  }

  /**
   * Creates a new edge with type aggregation.
   */
  createEdgeAggregation(sourceCode, destinationCode) {
    this.createEdge(
      sourceCode,
      destinationCode,
      EdgeType.AGGREGATION,
      edgeNode
    );
  }

  /**
   * Creates a new edge with type generalization.
   */
  createEdgeGeneralization(sourceCode, destinationCode) {
    this.createEdge(
      sourceCode,
      destinationCode,
      EdgeType.GENERALIZATION,
      edgeNode
    );
  }

  /**
   * Creates a new edge with type association.
   */
  createEdgeDirectedAssociation(sourceCode, destinationCode) {
    this.createEdge(
      sourceCode,
      destinationCode,
      EdgeType.DIRECTED_ASSOCIATION,
      edgeNode
    );
  }

  /**
   * Adds a new edge to the database.
   */
  createEdge(sourceCode, destinationCode, edgeType) {
    const relationMetaModelEntityName = this.metaModelMapper.getEdgeRelationEntityName(
      edgeType
    );

    this.createRelation(
      sourceCode,
      destinationCode,
      relationMetaModelEntityName
    );
  }

  /**
   * Adds a new field to the database.
   */
  createField(sourceCode, destinationCode) {
    const relationMetaModelEntityName = this.metaModelMapper.getClassFieldRelationEntityName();

    this.createRelation(
      sourceCode,
      destinationCode,
      relationMetaModelEntityName
    );
  }

  /**
   * Adds a new method to the database.
   */
  createMethod(sourceCode, destinationCode) {
    const relationMetaModelEntityName = this.metaModelMapper.getClassMethodRelationEntityName();

    this.createRelation(
      sourceCode,
      destinationCode,
      relationMetaModelEntityName
    );
  }

  /**
   * Create a new relation in the database.
   */
  createRelation(sourceCode, destinationCode, relationMetaModelEntityName) {
    const _this = this;

    const relationMetaModelEntity = this.getMetaModelEntityByName(
      relationMetaModelEntityName
    );

    // Update database
    CodesEndpoint.addRelationship(
      sourceCode.id,
      destinationCode.codeID,
      relationMetaModelEntity.id
    ).then(resp => {
      sourceCode.relations = resp.relations;

      _this.props.updateCode(sourceCode);
    });
  }

  /**
   * Delete a class field relation from the database. This method does not directly update the uml-editor.
   */
  deleteEdge(cell, relationId) {
    const code = this.getCodeByNode(cell);
    this.deleteRelation(code, relationId);
  }

  /**
   * Delete a class field relation from the database. This method does not directly update the uml-editor.
   */
  deleteClassField(cell, relationId) {
    const code = this.getCodeByNode(cell);
    this.deleteRelation(code, relationId);
  }

  /**
   * Delete a class method relation from the database. This method does not directly update the uml-editor.
   */
  deleteClassMethod(cell, relationId) {
    const code = this.getCodeByNode(cell);
    this.deleteRelation(code, relationId);
  }

  /**
   * Deletes a relation from the database. This method does not directly update the uml-editor.
   */
  deleteRelation(code, relationId) {
    this.props.deleteRelationship(code.id, relationId);
  }

  /**
   * Adds a node to the graph. Does not update the database.
   */
  addNode(code) {
    const _this = this;

    const node = this.graphView.addNode(code.id, code.name);

    let x = 0;
    let y = 0;

    // Register code position
    let codePosition = this.codePositionManager.getCodePosition(code.codeID);

    if (codePosition == null) {
      [x, y] = this.graphView.getFreeNodePosition(node);

      // insert into database
      codePosition = this.codePositionManager.createCodePositionObject(
        null,
        code.codeID,
        code.codesystemID,
        x,
        y
      );
      this.codePositionManager.insertOrUpdateCodePosition(codePosition);
    } else {
      x = codePosition.x;
      y = codePosition.y;
    }

    this.graphView.moveNode(node, x, y);
    this.graphView.recalculateNodeSize(node);
  }

  /**
   * Renames a node in the graph. Does not update the database.
   */
  renameNode(code) {
    const node = this.getNodeByCodeId(code.id);
    this.graphView.renameNode(node, code.name);
  }

  /**
   * Is called when an unmapped code is renamed.
   */
  unmappedCodeWasRenamed(code) {
    this.graphView.refreshAllNodes();
  }

  /**
   * Removes a node from the graph. Does not update the database.
   */
  removeNode(code) {
    const node = this.getNodeByCodeId(code.id);
    this.graphView.removeNode(node);
  }

  /**
   * Adds a class field to a node in the graph. Does not update the database.
   */
  addClassField(sourceCode, destinationCode, relation) {
    const sourceNode = this.getNodeByCodeId(sourceCode.id);

    const fieldText = this.metaModelMapper.getClassFieldText(relation);
    this.graphView.addClassField(sourceNode, relation.key.id, "+", fieldText);
  }

  /**
   * Removes a class field from a node in the graph. Does not update the database.
   */
  removeClassField(code, relation) {
    const node = this.getNodeByCodeId(code.id);

    this.graphView.removeClassField(node, relation.key.id);
  }

  /**
   * Adds a class method to a node to the graph. Does not update the database.
   */
  addClassMethod(sourceCode, destinationCode, relation) {
    const sourceNode = this.getNodeByCodeId(sourceCode.id);

    const methodText = this.metaModelMapper.getClassMethodText(relation);
    this.graphView.addClassMethod(sourceNode, relation.key.id, "+", methodText);
  }

  /**
   * Removes a class method from a node in the graph. Does not update the database.
   */
  removeClassMethod(code, relation) {
    const node = this.getNodeByCodeId(code.id);

    this.graphView.removeClassMethod(node, relation.key.id);
  }

  /**
   * Adds an edge between two nodes in the graph. Does not update the database.
   */
  addEdge(sourceCode, destinationCode, relation, edgeType) {
    const sourceNode = this.getNodeByCodeId(sourceCode.id);
    const destinationNode = this.getNodeByCodeId(destinationCode.id);

    const edge = this.graphView.addEdge(
      sourceNode,
      destinationNode,
      relation.key.id,
      edgeType
    );
  }

  /**
   * Removes an edge from a node in the graph. Does not update the database.
   */
  removeEdge(code, relation) {
    const node = this.getNodeByCodeId(code.id);

    this.graphView.removeEdge(node, relation.key.id);
  }

  /**
   * Called from outside after a code was removed.
   */
  codeRemoved(code) {
    this.consistencyManager.codeRemoved(code);
    this.codePositionManager.deleteCodePosition(code.codeID);
  }

  /**
   * Called from outside after a code was updated.
   */
  codeUpdated(code) {
    this.consistencyManager.codeUpdated(code);

    if (this.props.codesystemView.getSelected().id == code.id) {
      let node = this.getNodeByCodeId(code.id);

      if (node != null) {
        this.graphView.selectCell(node);
        this.graphView.panToCell(node, false);
      }
    }
  }

  render() {
    const _this = this;

    return (
      <StyledUmlEditor>
        <Toolbar
          ref={toolbar => {
            if (toolbar != null) this.toolbar = toolbar;
          }}
          className="row no-gutters"
          umlEditor={_this}
          createCode={_this.props.createCode}
          syncService={this.props.syncService}
        />
        <GraphView
          ref={graphView => {
            if (graphView != null)
              _this.graphView = graphView.decoratedComponentInstance;
          }}
          umlEditor={_this}
          onZoom={_this.onZoom}
          toggleCodingView={this.props.toggleCodingView}
        />
      </StyledUmlEditor>
    );
  }
}

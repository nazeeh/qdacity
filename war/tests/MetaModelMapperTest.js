import { EdgeType } from '../assets/js/pages/uml-editor/EdgeType.js';
import MetaModelMapper from '../assets/js/pages/uml-editor/MetaModelMapper.js';
import UmlClass from '../assets/js/pages/uml-editor/UmlClass.js';
import UmlEditorView from '../assets/js/pages/uml-editor/UmlEditorView.js';

describe("MetaModelMapper::map", function() {
	
	class UmlEditorViewMock extends UmlEditorView {
		constructor() {
			super(null);
			this.state = '';
		}
		
		getState() {
			return this.state;
		}
		
		init(container) {
			// do nothing
		}
		
		addEdge(nodeFrom, nodeTo, edgeType) {
			this.state = edgeType;
		}
		
		addClassField(node, text) {
			this.state = 'field' + text;
		}
		
		addClassMethod(node, text) {
			this.state = 'method' + text;
		}
	}	
	

	let umlEditorView;
	let metaModelMapper;
	let mmEntities;
	let source;
	let destination;
	
	beforeEach(function() {
		umlEditorView = new UmlEditorViewMock();		
		
		mmEntities = [
			{
				'id': 1,
				'name': 'Actor'
			}
		];
		
		metaModelMapper = new MetaModelMapper(umlEditorView, mmEntities);
		
		source = new UmlClass({
			'name': 'Test_Code_01', 
			'mmElementIDs': []
		}, {
			'dummy': true
		});

		destination = new UmlClass({
			'name': 'Test_Code_02', 
			'mmElementIDs': []
		}, {
			'dummy': true
		});
	});

	it('creates a generalization', function() {
		let metaModelEntity = {
			'name': 'is a'
		};
		
		metaModelMapper.map(metaModelEntity, source, destination);
		
		expect(umlEditorView.getState()).toBe(EdgeType.GENERALIZATION);
	});

	it('creates an aggregation', function() {
		let metaModelEntity = {
			'name': 'is part of'
		};
		
		metaModelMapper.map(metaModelEntity, source, destination);
		
		expect(umlEditorView.getState()).toBe(EdgeType.AGGREGATION);
	});
		
	it('creates a directed association', function() {
		let metaModelEntity = {
			'name': 'is related to'
		};
		
		metaModelMapper.map(metaModelEntity, source, destination);
		
		expect(umlEditorView.getState()).toBe(EdgeType.DIRECTED_ASSOCIATION);
	});

	it('does nothing for "is consequence of"', function() {
		let metaModelEntity = {
			'name': 'is consequence of'
		};
		
		metaModelMapper.map(metaModelEntity, source, destination);
		
		expect(umlEditorView.getState()).toBe('');
	});

	it('does nothing for "causes"', function() {
		let metaModelEntity = {
			'name': 'causes'
		};
		
		metaModelMapper.map(metaModelEntity, source, destination);
		
		expect(umlEditorView.getState()).toBe('');
	});

	it('does nothing for "performs"', function() {
		let metaModelEntity = {
			'name': 'performs'
		};
		
		metaModelMapper.map(metaModelEntity, source, destination);
		
		expect(umlEditorView.getState()).toBe('');
	});
	
	it('does nothing for an unknown type', function() {
		let metaModelEntity = {
			'name': 'unknown value'
		};
		
		metaModelMapper.map(metaModelEntity, source, destination);
		
		expect(umlEditorView.getState()).toBe('');
	});

	it('creates a field', function() {
		let metaModelEntity = {
			'name': 'is related to'
		};
		
		destination.code.mmElementIDs = [1];
		
		metaModelMapper.map(metaModelEntity, source, destination);
		
		expect(umlEditorView.getState()).toBe('field' + '+ Test_Code_01: type');
	});

	it('creates a method', function() {
		let metaModelEntity = {
			'name': 'influences'
		};
		
		metaModelMapper.map(metaModelEntity, source, destination);
		
		expect(umlEditorView.getState()).toBe('method' + '+ Test_Code_02(type): type');
	});
});


describe("MetaModelMapper::codeHasMetaModelEntity", function() {

	let metaModelMapper;
	let mmEntities;
	let code;
	
	beforeEach(function() {
		mmEntities = [
			{
				'id': 14,
				'name': 'Actor'
			},
			{
				'id': 1000,
				'name': 'Object'
			},
			{
				'id': 231321131,
				'name': 'Aspect'
			}
		];
		
		metaModelMapper = new MetaModelMapper(null, mmEntities);
		
		code = { 
				'name': 'Test_Code_01', 
				'mmElementIDs': [231321131, 9534892421, 1, 14]
		};
	});

	it('tests that the code contains the required metamodel-entities', function() {
		let mmEntityName1 = 'Actor';
		let mmEntityName2 = 'Aspect';
		
		let result1 = metaModelMapper.codeHasMetaModelEntity(code, mmEntityName1);
		expect(result1).toBe(true);
		
		let result2 = metaModelMapper.codeHasMetaModelEntity(code, mmEntityName2);
		expect(result2).toBe(true);
	});	
	
	it('tests that the code does not contain the required metamodel-entity (the entity does not exist in mmEntities)', function() {
		let mmEntityName = 'Does not Exist';
		
		let result = metaModelMapper.codeHasMetaModelEntity(code, mmEntityName);
		expect(result).toBe(false);
	});	

	it('tests that the code does not contain the required metamodel-entity (the entity exists in mmEntities)', function() {
		let mmEntityName = 'Actor';

		code = { 
				'name': 'Test_Code_01', 
				'mmElementIDs': [231321131, 9534892421, 1]
		};
		
		let result = metaModelMapper.codeHasMetaModelEntity(code, mmEntityName);
		expect(result).toBe(false);
	});	
	
	it('tests that the function returns false with an invalid value for the metamodel-entity name', function() {		
		let mmEntityName = null;

		let result = metaModelMapper.codeHasMetaModelEntity(code, mmEntityName);
		expect(result).toBe(false);
	});	

	it('tests that an error is thrown, if the code is null or undefined', function() {
		let mmEntityName = 'Actor';

		const funcNull = function() { metaModelMapper.codeHasMetaModelEntity(null, mmEntityName) };
		expect(funcNull).toThrowError('Code must not be null or undefined');
		
		const funcUndefined = function() { metaModelMapper.codeHasMetaModelEntity(undefined, mmEntityName) };
		expect(funcUndefined).toThrowError('Code must not be null or undefined');
	});	
});

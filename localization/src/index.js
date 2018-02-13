import { Identifier, ImportDefaultSpecifier, ImportSpecifier, LVal, MemberExpression, Expression, ImportNamespaceSpecifier, CallExpression, conditionalExpression, ImportDeclaration, File, BinaryExpression, binaryExpression } from 'babel-types';
import * as t from 'babel-types';
import * as p from 'path';
import { NodePath } from 'babel-traverse';

/*
 * This plugin will parse all formatMessage calls in our code and add them
 * to the react-intl metadata, that we extract later (see gulpfile)
 *
 *
 * Many of the paths are overly specific and verbose.
 * This is simply to make finding errors easier.
 * Every ignored code style is annotated and everything unknown
 * can be logged to console if debug is set to true.
 * This allows for quick inspection if any formatMessage is ignored.
 * Without all explicit ignored paths output of node paths will quickly
 * extent over 100s of lines of json that have to be manually inspected.
 * One might simplify this later when extensively tested and strip it down to
 * important paths only. Which should be easy due to our extensive annotation.
 */

///@ts-check
/// <reference types='babel-core' />
let debug = false;

/**
 * Walk all ImportDeclarations and search for the import specifier provided as first parameter
 * within the path <path>.
 *
 * @param {ImportDefaultSpecifier|ImportSpecifier|ImportNamespaceSpecifier} search_specifier specifier to search for
 * @param {NodePath} path the containing node path
 * @returns {ImportDeclaration}
 */
function resolveImport(search_specifier, path) {
	// walk up to the program
	const program = path.findParent(current => t.isProgram(current));
	let importDeclaration = null;

	program.traverse({
		// subscribe to all import declarations
		ImportDeclaration(path, state) {
			const specifiers = path.get('specifiers');
			for (const specifier of specifiers) {
				if (specifier.node === search_specifier) {
					importDeclaration = path;
					path.stop();
					break;
				}
			}
		}
	});
	return importDeclaration;
}

/**
 * Takes an LVal and its RVal and tries to figure out how the assignment
 * is desctructuring the RVal
 *
 * @param {LVal} identity destructuring statement
 * @param {Identifier} identifier assigned identifier
 * @returns {string}
 */
function resolveObjectDestructor(identity, identifier) {
	if (t.isObjectPattern(identity)) {
		for (const property of identity.properties) {
			// walk the properties and see if any match
			if (t.isRestProperty(property)) {
				// ignore rest properties ...foo
				continue;
			} else if (t.isObjectProperty(property)) {
				if (t.isIdentifier(property.value)) {
					// see if property is the one being referenced
					if (property.value.name == identifier.name) {
						if (t.isIdentifier(property.key)) {
							return property.key.name;
						}
						break;
					}
					continue;
				} else {
					// property.value is not an identifier
					// this would be needed for complex destructurings
					// we do not support this
					if (debug) {
						console.error(property.value);
						throw identity.buildCodeFrameError('property.value is not an identifier');
					}
					return null;
				}
			}
			// neither rest nor object. Not used yet.
			if (debug) {
				console.error(property);
				throw identity.buildCodeFrameError('neither rest nor opject identifier');
			}
			return null;
		}
		return null;
	} else if (t.isIdentifier(identity)) {
		// simple assignement foo = bar;
		return null;
	}
	// something we did not consider yet
	if (debug) {
		throw identity.buildCodeFrameError('unknown destructuring');
	}
	return null;
}

/**
 * Resolves any identifier to its real name / full identifier path
 * This recursively resolves an identifier up to its definition
 *
 * @param {Identifier} identifier identifier to resolve
 * @param {NodePath} path path/node where the identifier is
 * @returns {Array<string>}
 */
function resolveIdentifier(identifier, path) {
	// unresolvable identifier (most likely a global)

	if(!path.scope.hasBinding(identifier.name, false)) {
		return null;
	}

	// find the binding of the identifier (place of definition)
	const binding = path.scope.getBinding(identifier.name);
	if (!binding) {
		return null;
	}

	if (!binding.constant) {
		// constant violation, we neither handle reassignments
		// nor constant expressions nor late assignments
		// so statements like let x; x=3; will be ignored
		// it has to be const formatMessage = ...;
		return null;
	}
	const { path: bindingPath } = binding;
	const bindingNode = bindingPath.node;

	if(t.isIdentifier(bindingNode)) {
		const parentNode = bindingPath.parent;
		if(t.isFunction(parentNode)) {
			// function parameter, we cannot easily depict what it is
			if (parentNode.params.some(lval => {
				if(t.isIdentifier(lval)) {
					return lval.name == identifier.name;
				} else if(t.isMemberExpression(lval)) {
					const members = walkMembers(lval);
					if(members == null) return null;
					const prop = members.pop();
					if (prop == null) return null;
					return prop == identifier.name;
				} else if(t.isRestElement(lval)) {
					// ignore rest elements, treat them as no match
					return false;
				}
			})) {
				return null;
			}

			if (debug) {
				throw bindingPath.buildCodeFrameError('cannot find element in params');
			}
		}
		if (debug) {
			throw bindingPath.buildCodeFrameError('unresolvable recursive binding');
		}
	}

	if (t.isVariableDeclarator(bindingNode)) {
		// variable declaration resolve recursively
		const initalization = bindingNode.init;
		const identity = bindingNode.id;
		const object_subkey = resolveObjectDestructor(identity, identifier);

		if (t.isIdentifier(initalization)) {
			// follow rvalue identifier
			const fullIdent = resolveIdentifier(initalization, bindingPath);
			if (fullIdent == null) return null;
			if (object_subkey) fullIdent.push(object_subkey);
			return fullIdent;
		} else if (t.isMemberExpression(initalization)) {
			// member expression => ((IntlProvider).intl).formatMessage
			const fullIdent = walkMembers(initalization, bindingPath);
			if (fullIdent == null) return null;
			if (object_subkey) fullIdent.push(object_subkey);
			return fullIdent;
		} else if(t.isObjectExpression(initalization)) {
			if (!object_subkey) {
				return [identifier.name];
			}
			// most likely useless construct
			const { properties } = initalization;
			for (const property of properties) {
				if(t.isObjectProperty(property)) {
					if(!t.isIdentifier(property.key)) {
						continue;
					}
					if(property.key.name == object_subkey) {
						if(t.isIdentifier(property.value)) {
							return resolveIdentifier(property.value, bindingPath);
						}
					}
				}
			}
		} else if (t.isNewExpression(initalization)) {
			// object initialization, shouldn't be important for us
			return [];
		} else if(t.isCallExpression(initalization)) {
			// ignore call expressions
			return [];
		} else if(t.isLogicalExpression(initalization)) {
			// ignore logical expressions
			return [];
		} else if(t.isThisExpression(initalization)) {
			// ignore assignements from this (this might cause issues)
			return [];
		} else if(t.isArrayExpression(initalization)) {
			// ignore new array expressions like [1,3,4]...
			return [];
		} else if(t.isUnaryExpression(initalization)) {
			// either void or numeric assignment which can be ignored.
			return [];
		} else if(t.isAwaitExpression(initalization)) {
			// ignore await statement
			return [];
		} else if(t.isFunctionExpression(initalization)) {
			// ignore function expressions like (const x = () => 3)
			return [];
		} else if(t.isConditionalExpression(initalization)) {
			// ignore ternary assignments like (const t = isX ? foo : bar)
			return [];
		} else if(t.isStringLiteral(initalization)) {
			// intl will not be a string literal
			return [];
		}

		// unkown variable declaration
		if (debug) {
			console.error(bindingNode);
			throw bindingPath.buildCodeFrameError('unknown variable declarator');
		}
		return [];
	} else if (t.isFunctionDeclaration(bindingNode)) {
		// function declaration just return identifier as is
		const identifier = bindingNode.id;
		return [identifier.name];
	} else if (t.isClassDeclaration(bindingNode)) {
		// class declaration not important for us
		return null;
	} else if (
		t.isImportSpecifier(bindingNode) ||
		t.isImportNamespaceSpecifier(bindingNode) ||
		t.isImportDefaultSpecifier(bindingNode)
	) {
		// identifier is an import, search declaration and resolve file
		const importDeclaration = resolveImport(bindingNode, bindingPath);
		if (t.isImportDeclaration(importDeclaration)) {
			return [importDeclaration.node.source.value];
		}

		if(debug) {
			console.error(bindingNode);
			throw bindingPath.buildCodeFrameError('cannot resolve import');
		}
		return null;
	} else if(t.isFunctionExpression(bindingNode)) {
		// most likely a getter, proxy or autogenerated function polyfill
		return [];
	}

	if(debug) {
		console.error(binding);
		console.error(bindingNode);
		throw bindingPath.buildCodeFrameError('unknown identifier type');
	}
	return [];
}

/**
 * Checks if an full ident matches the critera to be a possible
 * formatMessage candidate
 *
 * @param {Array<string>} fullIdentifier
 * @returns {bool}
 */
function isFormatMessage(fullIdentifier) {
	if(!fullIdentifier) return false;
	const importPath = fullIdentifier.shift() || '';
	if (!importPath.match(/LocalizationProvider/)) return false;
	const importName = fullIdentifier.shift() || '';
	if (!importName.match(/IntlProvider/)) {
		if(importName) fullIdentifier.unshift(importName);
	}
	const intl = fullIdentifier.shift() || '';
	if (!intl.match(/intl/)) return false;
	const formatMessage = fullIdentifier.shift() || '';
	return formatMessage.match(/formatMessage/) != undefined;
}

/**
 * Follow a member expression chain to its completion
 * like: a.b.c.d.e.f. Resolves a-f.
 *
 * @param {MemberExpression|Expression} objectOrMemberExpression
 * @param {NodePath} path
 * @returns {Array<string>}
 */
function walkMembers(objectOrMemberExpression, path) {
	if(t.isMemberExpression(objectOrMemberExpression)) {
		// keep walking the chain
		const fullIdent = walkMembers(objectOrMemberExpression.object, path);
		if (fullIdent == null) return null;
		fullIdent.push(objectOrMemberExpression.property.name);
		return fullIdent;
	} else if(t.isIdentifier(objectOrMemberExpression)) {
		// reached the end. The rvalue is an identifier
		return resolveIdentifier(objectOrMemberExpression, path);
	} else if(t.isLogicalExpression(objectOrMemberExpression)) {
		// we do not handle any || and && statements
		return null;
	} else if(
		t.isThisExpression(objectOrMemberExpression) ||
		t.isCallExpression(objectOrMemberExpression) ||
		t.isFunctionExpression(objectOrMemberExpression) ||
		t.isNewExpression(objectOrMemberExpression) ||
		t.isArrayExpression(objectOrMemberExpression) ||
		t.isBinaryExpression(objectOrMemberExpression) ||
		t.isUnaryExpression(objectOrMemberExpression)
	) {
		// ignore access to this
		// ignore any non static expression
		return null;
	} else {
		// unexpected should never be reachable
		if (debug) {
			console.error(objectOrMemberExpression);
			throw path.buildCodeFrameError('impossible member access construct');
		}
		return [];
	}
}

/**
 * Tries to concatenate parts of a string that had been written as multiple string literals
 *
 * @param {BinaryExpression} binExpression
 */
function concatLiterals(binExpression) {
	if(binExpression.operator != '+') return null;
	const parts = [];
	if(t.isStringLiteral(binExpression.left)) {
		parts.push(binExpression.left.value);
	} else if(t.isBinaryExpression(binExpression.left)) {
		parts.push(concatLiterals(binExpression.left));
	}
	if(t.isStringLiteral(binExpression.right)) {
		parts.push(binExpression.right.value);
	} else if(t.isBinaryExpression(binExpression.right)) {
		parts.push(concatLiterals(binExpression.right));
	}
	if (parts.some(x => x == null)) return null;
	return parts.join('');
}

/**
 * Takes a call expression's arguments and extracts the message identifier from it
 *
 * @param {Array<Expression>} args arguments to call expression
 * @param {NodePath} path path of call expression
 * @param {object} state
 * @param {File} state.file
 * @returns {object} message identifier
 */
function extractMessageIdentifier(args, path, state) {
	if(args.length < 1 || args.length > 2) {
		// check argument count
		throw path.buildCodeFrameError('formatMessage takes one or two arguments');
	}

	const messageIdentifier = args[0];
	const params = args[1] || null;

	if(t.isObjectExpression(messageIdentifier)) {
		// get metadata like line number and filename containing formatMessage call
		const { properties } = messageIdentifier;
		const {start, end} = path.node.loc;
		const data = {
			file: p.relative(process.cwd(), state.file.opts.filename),
			start: start,
			end: end
		};
		// walk properties of the first argument of
		// the formatMesssage call
		for (const property of properties) {
			if (!t.isObjectProperty(property)) {
				// there should not be anything else than an object property
				// in the list of properties
				throw path.buildCodeFrameError('Do not use anything else than object properties. Especially do not use a RestExpression');
			}

			if(property.key.name == 'id') {
				// found message identifier - identifier
				if (t.isStringLiteral(property.value)) {
					data.id = property.value.value;
					continue;
				}
				throw path.buildCodeFrameError('id needs to be a string literal');
			} else if(property.key.name == 'defaultMessage') {
				// found message identifier - fallback message
				if (t.isStringLiteral(property.value)) {
					data.defaultMessage = property.value.value;
					continue;
				} else if(t.isBinaryExpression(property.value)) {
					data.defaultMessage = concatLiterals(property.value);
					if (data.defaultMessage != null)
						continue;
				}
				throw path.buildCodeFrameError('defaultMessage needs to be a string literal');
			} else if(property.key.name == 'values') {
				throw path.buildCodeFrameError('Values is the second argument to formatMessage, to not include it in the MessageIdentifier as it will not work as expected.');
			} else if(property.key.name == 'description') {
				// found message identifier - optional description
				if (t.isStringLiteral(property.value)) {
					data.description = property.value.value;
					continue;
				}
				console.error('Description is not a string literal so it was ignored');
			}
			// found a key that is not a part of the message identifier
			throw path.buildCodeFrameError(`Found invalid property '${property.key.name}'`);
		}
		// return the constructed message identifier
		return data;
	}
	// invalid argument type
	if(debug) console.error(args);
	throw path.buildCodeFrameError('Argument is not a MessageIdentifier');
}

/**
 * Babel plugin entry function; must return an object
 */

const MESSAGES = Symbol('formatMessages');

export default function() {
	return {
		/**
		 * Function called before entering/parsing a program
		 * @param {File} state
		 */
		pre(state) {
			state.set(MESSAGES, new Map());
			debug = this.opts.debug || false;
		},
		/**
		 * Function called after leaving a program
		 * @param {File} state
		 */
		post(state) {
			if (!state.metadata || !state.metadata['react-intl']) {
				if(this.opts.test) {
					state.metadata['react-intl'] = { messages: [] };
				} else {
					throw state.path.buildCodeFrameError(
						'React-Intl plugins needs to be loaded before our formatMessage parser\n' +
						'Please re-order plugins in configuration'
					);
				}
			}
			/**
			 * @type {Map<string,object>}
			 */
			const messageIdentifiers = state.get(MESSAGES);
			for(const message of state.metadata['react-intl'].messages) {
				if(messageIdentifiers.has(message.id)) {
					const collidingIdentifier = messageIdentifiers.get(message.id);
					if(collidingIdentifier.defaultMessage != message.defaultMessage) {
						throw state.path.buildCodeFrameError(
							`Detected colliding identifier ${message.id} in file`
						);
					}
				} else {
					messageIdentifiers.set(message.id, message);
				}
			}

			if(messageIdentifiers.size > 0) {
				// write result pack to metadata to be extracted by gulp
				state.metadata['react-intl'].messages = Array.from(messageIdentifiers.values());
			}
		},
		/**
		 * list of visitors that shall be called while walking the ast
		 */
		visitor: {
			/**
			 * Enter on call expressions
			 *
			 * @param {NodePath} path
			 * @param {object} state
			 */
			CallExpression(path, state) {
				const {callee, arguments: args} = path.node;
				let identifier = null;

				// resolve where functions were imported/defined from/at
				if (t.isIdentifier(callee)) {
					identifier = resolveIdentifier(callee, path);
				} else if(t.isMemberExpression(callee)) {
					// foo.bar() see if it is a namespace or otherwise ignore it
					identifier = walkMembers(callee, path);
					//console.log(callee.object.name, callee.property.name);
				} else if(t.isCallExpression(callee) || t.isFunctionExpression(callee) || t.isArrowFunctionExpression(callee)) {
					// call expression call expression foo()();
					// we will ignore those
					return;
				} else {
					// unkown type of callexpression
					if (debug) {
						console.error(callee);
						throw path.buildCodeFrameError('unkown call expression');
					}
					return;
				}
				if (identifier == null) {
					return;
				}
				if(isFormatMessage(Array.from(identifier))) {
					const messageIdentifier = extractMessageIdentifier(args, path, state);
					if (!messageIdentifier) return;
					/**
					 * @type {Map<string,object>}
					 */
					const map = state.file.get(MESSAGES);
					if(map.has(messageIdentifier.id)) {
						const collidingIdentifier = map.get(messageIdentifier.id);
						if(collidingIdentifier.defaultMessage != messageIdentifier.defaultMessage) {
							throw path.buildCodeFrameError(`Colliding message identifier ${messageIdentifier.id} detected.`);
						}
					} else {
						map.set(messageIdentifier.id, messageIdentifier);
					}
				}
			}
		}
	};
}

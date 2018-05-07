/**
 * This file uses commonjs module syntax and non-JSX React calls to be
 * interoperable in the frontend (React/Babel) and the realtime-service
 * (nodejs)
 */

const React = require('react');
const { Data } = require('slate');

module.exports = [
	{
		deserialize(el, next) {
			switch (el.tagName.toLowerCase()) {
				case 'p':
					return {
						object: 'block',
						type: 'paragraph',
						data: Data.create({
							falsenegcount: el.getAttribute('falsenegcount') || 0
						}),
						nodes: next(el.childNodes)
					};
				case 'b':
					return {
						object: 'mark',
						type: 'bold',
						nodes: next(el.childNodes)
					};
				case 'i':
					return {
						object: 'mark',
						type: 'italic',
						nodes: next(el.childNodes)
					};
				case 'u':
					return {
						object: 'mark',
						type: 'underline',
						nodes: next(el.childNodes)
					};
				case 'coding':
					return {
						object: 'mark',
						type: 'coding',
						data: Data.create({
							id: el.getAttribute('id'),
							code_id: el.getAttribute('code_id'),
							title: el.getAttribute('title'),
							author: el.getAttribute('author')
						}),
						nodes: next(el.childNodes)
					};
				case 'span':
					if (el.className.toLowerCase() === 'size')
						return {
							object: 'mark',
							type: 'fontsize',
							data: Data.create({
								size: el.style.fontSize
							}),
							nodes: next(el.childNodes)
						};
					if (el.className.toLowerCase() === 'font')
						return {
							object: 'mark',
							type: 'fontface',
							data: Data.create({
								font: el.style.fontFamily
							}),
							nodes: next(el.childNodes)
						};
				default:
					return;
			}
		},
		serialize(obj, children) {
			if (obj.object === 'block' && obj.type === 'paragraph') {
				return React.createElement(
					'p',
					{
						falsenegcount: obj.data.get('falsenegcount')
					},
					children
				);
			}
			if (obj.object === 'mark') {
				switch (obj.type) {
					case 'bold':
						return React.createElement('b', null, children);
					case 'italic':
						return React.createElement('i', null, children);
					case 'underline':
						return React.createElement('u', null, children);
					case 'coding':
						return React.createElement(
							'coding',
							{
								id: obj.data.get('id'),
								'data-code-id': obj.data.get('code_id'),
								title: obj.data.get('title'),
								'data-author': obj.data.get('author')
							},
							children
						);
					case 'fontsize':
						return React.createElement(
							'span',
							{
								className: 'size',
								style: { fontSize: obj.data.toJS().size }
							},
							children
						);
					case 'fontface':
						return React.createElement(
							'span',
							{
								className: 'font',
								style: { fontFamily: obj.data.toJS().font }
							},
							children
						);
					default:
						return;
				}
			}
		}
	}
];

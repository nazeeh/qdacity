import React from 'react';
import { Data } from 'slate';

const documentSchema = [

	// Rule for <p> tags
	{
		deserialize(el, next) {
			if (el.tagName.toLowerCase() === 'p') {
				return {
					object: 'block',
					type: 'paragraph',
					data: Data.create({
						falsenegcount: el.getAttribute('falsenegcount') || 0,
					}),
					nodes: next(el.childNodes)
				}
			}
		},
		serialize(obj, children) {
			if (obj.object === 'block') {
				switch (obj.type) {
					case 'paragraph':
						return (
							<p
								falsenegcount={obj.data.get('falsenegcount')}
							>
								{children}
							</p>
						);
					default: return
				}
			}
		}
	},

	// Rule for <b>, <i>, <u>
	{
		deserialize(el, next) {
			switch(el.tagName.toLowerCase()) {
				case 'b': return {
					object: 'mark',
					type: 'bold',
					nodes: next(el.childNodes),
				};
				case 'i': return {
					object: 'mark',
					type: 'italic',
					nodes: next(el.childNodes),
				};
				case 'u': return {
					object: 'mark',
					type: 'underline',
					nodes: next(el.childNodes),
				};
				default: return;
			}
		},
		serialize(obj, children) {
			if (obj.object === 'mark') {
				switch (obj.type) {
					case 'bold': return <b>{children}</b>;
					case 'italic': return <i>{children}</i>;
					case 'underline': return <u>{children}</u>;
					default: return;
				}
			}
		}
	},

	// Coding rule
	{
		deserialize(el, next) {
			if (el.tagName.toLowerCase() === 'coding') {
				return {
					object: 'mark',
					type: 'coding',
					data: Data.create({
						id: el.getAttribute('id'),
						code_id: el.getAttribute('code_id'),
						title: el.getAttribute('title'),
						author: el.getAttribute('author'),
					}),
					nodes: next(el.childNodes)
				};
			}
		},
		serialize(obj, children) {
			if (obj.object === 'mark' && obj.type === 'coding') {
				return (
					<coding
						id={obj.data.get('id')}
						data-code-id={obj.data.get('code_id')}
						title={obj.data.get('title')}
						data-author={obj.data.get('author')}
					>
						{children}
					</coding>
				);
			}
		}
	},

	// Font size tag rule
	{
		deserialize(el, next) {
			if (el.tagName.toLowerCase() === 'span' && el.className.toLowerCase() === 'size') {
				return {
					object: 'mark',
					type: 'fontsize',
					data: Data.create({
						size: el.style.fontSize,
					}),
					nodes: next(el.childNodes)
				};
			}
		},
		serialize(obj, children) {
			if (obj.object === 'mark' && obj.type === 'fontsize') {
				return (
					<span
						className='size'
						style={{ fontSize: obj.data.toJS().size }}
					>
						{children}
					</span>
				);
			}
		}
	},

	// Font face tag rule
	{
		deserialize(el, next) {
			if (el.tagName.toLowerCase() === 'span' && el.className.toLowerCase() === 'font') {
				return {
					object: 'mark',
					type: 'fontface',
					data: Data.create({
						font: el.style.fontFamily,
					}),
					nodes: next(el.childNodes)
				};
			}
		},
		serialize(obj, children) {
			if (obj.object === 'mark' && obj.type === 'fontface') {
				return (
					<span
						className='font'
						style={{ fontFamily: obj.data.toJS().font }}
					>
						{children}
					</span>
				);
			}
		}
	},
];

export default documentSchema;

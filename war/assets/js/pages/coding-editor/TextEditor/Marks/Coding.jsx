import React from 'react';

const Coding = props => {

	const data = props.mark.data.toJS();

	return (
		<span
			data-mark-type={props.mark.type}
			data-coding-id={data.id}
			data-coding-codeid={data.code_id}
			data-coding-title={data.title}
		>
			{props.children}
		</span>
	);
};

export default Coding;

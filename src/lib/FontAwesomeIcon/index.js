import React from 'react';

export function FontAwesomeIcon(props) {
	const classNames = [
		props.className,
		"fa",
		"fas",
		props.icon ? `fa-${props.icon}` : ''
	];

	return (
		<i {...props} className={classNames.join(' ')} />
	);
}
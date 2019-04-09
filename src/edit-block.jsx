import React from 'react';

export default class FenceBuilderEditor extends React.PureComponent {
	render() {
		const styles = {
			backgroundImage: `url(/wp-content/plugins/gecko-fence-builder/src/preview.png)`,
			backgroundRepeat: 'no-repeat',
			backgroundSize: 'contain',
			height: '500px',
			width: '1340px',
	};
		return (<div style={styles}></div>);
	}
}
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTh } from '@fortawesome/free-solid-svg-icons';
import {
	registerBlockType
} from '@wordpress/blocks';
import {
	compose
} from '@wordpress/compose';

import {
	InspectorControls,
} from '@wordpress/editor';

import {
	PanelBody,
	PanelRow,
	TextControl,
	RangeControl,
	ToggleControl,
	SelectControl,
	FormFileUpload,
	Button
} from '@wordpress/components';

import FenceBuilder from './edit-block.jsx';

const settings = {
	title: 'Fence Builder',
	icon: <FontAwesomeIcon icon={faTh} />,
	category: 'gecko',
	description: 'Displays the fence builder grid.',
	supports: {
		customClassName: false,
	},
	attributes: {
	},
	edit: (props) => {

		return ([
			<InspectorControls>
			</InspectorControls>,
			<FenceBuilder />
		]);
	},
	save: (props) => {
		return null;
	}
}

registerBlockType('gecko/fence-builder', settings);

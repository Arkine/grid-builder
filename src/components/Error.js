import React from 'react';
import styled from 'styled-components';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimesCircle} from '@fortawesome/free-regular-svg-icons';

const CloseButton = styled(FontAwesomeIcon).attrs({
	icon: faTimesCircle,
	title: "Delete"
})`
	display: flex;
	justify-content: center;
	align-items: center;

	width: 20px;
	height: 20px;

	margin: 0.25rem 0.25rem 0.25rem 0.5rem;

	transition: all 0.2s ease-in;

	color: #fff;

	&:hover {
		cursor: pointer;
	}
`;

const Container = styled.div`
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	justify-content: space-between;

	padding: 0.25rem 0.5rem;

	margin-top: 0.5rem;
	min-width: 100px;

	border-radius: 5px;
	box-shadow: 0 0 2px 0px #000;
	background-color: #fd3737;
	color: #fff;
`;

export default class Error extends React.PureComponent {
	handleCloseClick = e => {
		e.preventDefault();

		this.props.onCloseError();
	}
	render() {
		return (
			<Container>
				{this.props.message}
				<CloseButton onClick={this.handleCloseClick} />
			</Container>
		)
	}
}
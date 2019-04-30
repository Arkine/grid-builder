import styled from 'styled-components';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const cloud = '#E9E9E9';
const salmon = '#E24517';

export const Container = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	z-index: 5;

	display: ${props => props.active ? 'block' : 'none'};


	transition: all 0.4s cubic-bezier(0, 1, 0.5, 1);

	height: 100%;
	width: 250px;
	max-width: 100%;

	box-shadow: 0 10px 20px 5px rgba(0,0,0, 0.3);
	background-color: #fff;
	border-bottom-left-radius: 10px;
	border-bottom-right-radius: 10px;
`;

Container.TabClose = styled(FontAwesomeIcon)`
	position: absolute;
	top: 0;
	left: -40px;
	z-index: 5;

	height: 40px;
	width: 40px;

	background-color: ${salmon};

	color: #fff;
	font-size: 1.5rem;

	cursor: pointer;

	&::before {
		position: absolute;
		top: 50%;
		left: 50%;

		transform: translate(-50%, -50%);
	}
`;

Container.Inner = styled.div`
	display: flex;
	flex-direction: column;

	border-radius: 4px;
	height: 100%;
	color: #fff;
`;

Container.Content = styled.div`
	position: relative;

	padding: 0.5rem;
`;

Container.Header = styled.div`
	background-color: ${cloud};
	font-weight: 600;
	color: #333;

	padding: 0.25rem 0.5rem;
`;

Container.Section = styled.div`
	position: relative;
	width: 100%;

	border-bottom: 1px solid #fff;

	&:last-of-type {
		border-bottom: none;
		flex-grow: 1;
	}
`;

Container.FooterSection = styled(Container.Section)`
	display: flex;
	justify-content: center;
	align-items: center;

	cursor: pointer;

	padding: 0.5rem 1rem;

	background-color: ${salmon};
	font-size: 0.75rem;
	font-weight: 600;
	text-transform: uppercase;

	> span {
		margin: 0 0.5rem;
	}
`;

Container.ButtonRow = styled.div`
	position: relative;

	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;

	margin: 0 -0.25rem;
`;

Container.DisabledOverlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;

	width: 100%;
	height: 100%;

	z-index: 5;

	background-color: rgba(255,255,255, 0.4);
`;

Container.Note = styled.div`
	font-size: 0.7rem;
	color: #919191;
	line-height: initial;

	visibility: ${props => props.visible ? 'visible' : 'hidden'};
`;

export const Distance = styled.div`
	display: flex;
	flex-direction: row;
	padding: 0;

	input[type="number"] {
		width: 100%;
		flex-grow: 1;

		font-size: 0.9rem;

		padding: 0.25rem 0.5rem;
		margin-bottom: 0;

		border-radius: 999px;
		background-color: ${cloud};
	}
`;

export const Type = styled.div`
	flex-grow: 1;

	padding: 0.25rem;
	margin: 0.25rem;

	background-color: ${props => !props.disabled ? (props.selected ? salmon : cloud) : `rgba(233,233,233, 0.3)`};
	border-radius: 4px;

	text-align: center;
	color: ${props => !props.disabled ? (props.selected ? '#fff' : 'initial') : cloud};
	cursor: ${props => props.disabled ? 'initial' : 'pointer'};

	font-size: 0.9rem;
`;

Type.Svg = styled.svg`
	fill: #fff;
`;

export const Sizes = styled.div`
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	justify-content: space-between;
`;

Sizes.Item = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;

	height: 40px;
	width: 40px;

	color: ${props => props.selected ? '#fff' : '#333'};
	background-color: ${props => props.selected ? salmon : cloud};
	border-radius: 4px;

	cursor: pointer;

	&:hover {
		background-color: ${salmon};
		color: #fff;
	}
`;

export const CloseButton = styled(FontAwesomeIcon).attrs({
	title: "Delete"
})`
	transition: all 0.2s ease-in;
	color: #fff;
`;

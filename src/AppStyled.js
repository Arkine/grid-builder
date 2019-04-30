import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled, {keyframes} from 'styled-components';

const cornFlowerBlue = '#53A4CE';
const cloud = '#E9E9E9';
const salmon = '#E24517';
const slate = '#4A4A4A';

const fadeIn = keyframes`
	from {opacity: 0};
	to: {opacity: 1};
`;

export const Gear = styled(FontAwesomeIcon)`
	position: absolute;
	top: 0;
	right: 0;

	display: flex;
	justify-content: center;
	align-items: center;

	height: 50px;
	width: 40px;

	background-color: ${cornFlowerBlue};
	color: #fff;
	overflow: hidden;

	&::before {
		transition: all 2.5s ease;
	}
`;

export const Container = styled.div`
	display: flex;
	flex-flow: row nowrap;

	position: absolute;
	top: 0;
	left: ${props => props.active ? "0" : "-335px"};
	z-index: 5;

	height: 100%;
	width: 100%;
	max-width: 375px;

	transition: all 0.5s cubic-bezier(0, 1, 0.5, 1);

	background-color: #fff;
	box-shadow: 0 10px 20px 5px rgba(0,0,0, 0.3);

	button {
		background-color: ${salmon};
	}

	${Gear} {
		&::before {
			transform: ${props => props.active ? `rotate(360deg)` : `rotate(0)`};
		}
	}
`;

Container.Tab = styled.div`
	position: relative;

	width: 40px;
	height: 100%;

	&:hover {
		cursor: pointer;
	}
`;

export const Errors = styled.div`
	display: flex;
	flex-flow: column-reverse;
	align-items: space-between;

	overflow: hidden;

	position: absolute;
	top: 0.25rem;
	right: 0.5rem;
	z-index: 1;
`;

export const Controls = styled.div`
	display: flex;
	flex-flow: column nowrap;

	height: 100%;
	width: 100%;
	max-width: 335px;

	font-weight: 600;

	transition: all 1s ease-in-out;

	background-color: #fff;
	border-right: 1px solid ${cloud};
`;

Controls.Menu = styled.ul`
	padding: 0;
	flex-grow: 1;
`;

Controls.MenuItem = styled.li`
	display: flex;
	flex-direction: row;
	justify-content: space-between;

	padding: 1rem;
	margin-bottom: 0;

	list-style-type: none;
	color: #333;

	border-top: 1px solid ${cloud};

	span {
		padding: 0 0.25rem
	}
`;

Controls.Status = styled.div`
	> span {
		color: ${props => props.active ? cornFlowerBlue : cloud};
	}
`;

Controls.Tab = styled.div`
	position: absolute;
	right: -1rem;
	top: 0;

	height: 100%;
	width: 100px;

	background-color: red;
`;

Controls.Actions = styled.div`
	display: flex;
	flex-flow: row;
	justify-content: space-between;

	padding: 2rem 1rem;

	height: auto;

	button {
		display: flex;
		justify-content: space-between;
		align-items: center;

		margin: 0;
		padding: 0.65rem 1.4rem;
		font-size: 1rem;

		flex-basis: 8rem;

		text-transform: uppercase;
		color: #fff;
		border-radius: 999px;

		& + button {
			margin-left: 0.25rem;
		}

		&:hover {
			cursor: pointer;
		}
	}
`;

export const Button = styled.button`
	background-color: ${props => props.active ? 'green' : '#fff'};
	color: ${props => props.active ? '#fff' : '#000'};

	& + * {
		margin-left: 0.5rem;
	}
`;

export const SnapToGridBttn = styled(Button)``;
export const LabelButton = styled(Button)``;


// export const ZoomScale = styled.div`
// 	display: flex;
// 	flex-flow: row nowrap;

// 	margin: 0.5rem 0;

// 	> input {
// 		cursor: pointer;
// 		width: 100%;
// 	}
// `;

// export const Scale = styled(Controls.MenuItem)`
// 	display: flex;
// 	flex-direction: column;
// 	color: #333;

// 	> ${Controls.Status} {
// 		display: flex;
// 		justify-content: space-between;
// 	}
// `;

export const Footer = styled.div`
	display: flex;
	justify-content: space-between;
`;

Footer.Button = styled.button`
	background: ${cloud};
	border-radius: 0;
	margin: 0;

	height: 80px;
	width: 165px;


	&:hover {
		background-color: ${slate};
		cursor: pointer;

		label, i {
			color: #fff;
		}
	}

	label {
		font-size: 1rem;
		font-weight: 600;
		text-transform: uppercase;
		color: #333;

		&:hover {
			cursor: pointer;
		}
	}

	i {
		color: ${salmon};
		margin: 0 0.75rem;
		font-size: 1rem;
	}
`;


export const Chevron = styled(FontAwesomeIcon)`
	position: absolute;
	top: 50%;
	right: 50%;

	font-size: 1rem;

	transform: translateX(50%);

	color: ${salmon};
`;

export const NextButton = styled.div`
	position: absolute;
	bottom: 0rem;
	right: ${props => props.active ? (props.offset ? 'calc(250px + 2.5rem)' : '2.5rem') : '-100%'};

	transition: all 0.2s ease-in-out;

	a {
		color: #fff;
	}

	&:hover {
		a {
			color: #fff;
		}
	}
`;

export const AppContainer = styled.div`
	overflow: hidden;

	height: 100%;
	width: 100%;
`;

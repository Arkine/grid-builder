import React from 'react';
import styled, { keyframes } from 'styled-components';

const cornFlowerBlue = '#53A4CE';
const cloud = '#E9E9E9';
const SwitchWrapper = styled.div`
	position: relative;

	height: 1.29rem;
	width: 2.35rem;

	border: 3px solid ${props => props.checked ? cornFlowerBlue : cloud };
	border-radius: 999px;
	background-color: ${props => props.checked ? cornFlowerBlue : '#fff' };
`;

const shrink = keyframes`
	from {
		transform: scale(1);
	}
	to {
		transform: scale(0);
	};
`;

const grow = keyframes`
	from {
		transform: scale(0);
	}
	to {
		transform: scale(1);
	};
`;


const SwitchInput = styled.input`
	position: absolute;
	z-index: 100;

	height: 100%;
	width: 100%;

	opacity: 0;
	cursor: pointer;

	~ label {
		svg {
			animation: ${shrink} 0.15s ease-in forwards;
		}
	}

	&:checked {
		~ label {
			color: #fff;

			div {
				left: 1rem;
			}

			svg[type='check'] {
				animation: ${grow} 0.15s ease-in forwards;
			}

		}
	}

	&:not(:checked) {
		~ label {
			svg[type='cancel'] {
				animation: ${grow} 0.15s ease-in forwards;
			}
		}
	}
`;

const SwitchLabel = styled.label`
	display: block;
	position: relative;

	height: 100%;
	width: 100%;

	color: #c72f18;
	border-radius: 2px;
	transition: all .15s ease;
`;

const SwitchBttn = styled.div`
	display: block;

	position: absolute;
	top: 0rem;
	left: 0rem;

	z-index: 3;
	height: 1rem;
	width: 1rem;
	background: #fff;
	border: 3px solid ${cloud};
	border-radius: 999px;
	transition: all .15s ease;
`;

const SwitchOk = styled.span`
	position: relative;
	left: 1rem;
	top: 0.65rem;
	z-index: 2;

	font-size: 1rem;
`;

const SwitchRemove = styled.span`
	position: relative;
	top: 0.6rem;
	left: 2.55rem;
	z-index: 2;

	font-size: 1.45rem;
`;

export const Switch = (props) => {
	return (
		<SwitchWrapper {...props}>
			<SwitchInput type="checkbox" name={props.name} checked={props.checked} defaultChecked={props.checked === true} value={true} />
			<SwitchLabel>
				<SwitchOk />
				<SwitchRemove />
				<SwitchBttn />
			</SwitchLabel>
		</SwitchWrapper>
	);
}
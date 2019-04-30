import React from 'react';

import {
	Container,
	Distance,
	CloseButton,
} from './Measurer-Styled';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { faWindowClose } from '@fortawesome/free-regular-svg-icons';


export default class Measurer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			active: true,
			// line: this.props.line
		}
		
		this._inputEl = React.createRef();

		this.handleCloseMenu = this.handleCloseMenu.bind(this);
	}

	componentDidMount() {
		if (this._inputEl) {
			this._inputEl.current.focus();
		}
	}

	// componentDidUpdate(prevProps) {
	// 	if (this.props.line.x !== prevProps.line.x) {
	// 		this.setState({
	// 			active: true
	// 		});
	// 	}
	// }

	renderDistance() {
		const a = (this.props.pointA.x - this.props.pointB.x)**2;
		const b = (this.props.pointA.y - this.props.pointB.y)**2;

		return (<div>{Math.sqrt(a, b)}</div>)
	}

	handleGradeChange = grade => {
		this.updateNodeState({
			grade
		});

		this.props.onNodeUpdate({a: this.props.pointA, b: this.props.pointB}, {grade});
	}

	handleDeleteClick = e => {
		e.stopPropagation();

		this.props.onDeleteLine(this.props.pointA, this.props.pointB);
	}

	updateNodeState = newState => {
		this.setState({
			line: {
				...this.state.line,
				...newState
			}
		});
	}

	handleInputChange = e => {
		const distance = +e.target.value;

		this.updateNodeState({
			distance
		});

		this.props.onNodeUpdate({a: this.props.pointA,  b: this.props.pointB}, {distance})
	}

	handleCloseMenu() {
		this.setState({
			active: false
		});

		this.props.onClose();
	}

	render() {
		const {line} = this.props;

		if (!this.props.pointB) {
			return null;
		}

		return (
			<Container className="grid-builder__measurer" active={this.state.active}>
				<Container.Inner>
					<Container.Section>
						<Container.Header>Section Length:</Container.Header>
						<Container.Content>
							<Distance>
								<input type="number" min={0} onChange={this.handleInputChange} value={(line.distance ? line.distance : null )} ref={this._inputEl} placeholder="Enter length (Ft.)" />
							</Distance>
						</Container.Content>
					</Container.Section>

					<Container.FooterSection onClick={this.handleDeleteClick}>
						<CloseButton icon={faTimesCircle} />
						<span>Delete Section</span>
					</Container.FooterSection>
				</Container.Inner>

				<Container.TabClose icon={faWindowClose} onClick={this.handleCloseMenu} />
			</Container>
		);
	}
}
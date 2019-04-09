import React from 'react';

import SVG from './Svg';
import {
	Container,
	Distance,
	CloseButton,
	Type,
	Sizes
} from './Measurer-Styled';


export default class Measurer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			active: true,
			// line: this.props.line
		}
		this._gateMax = 30;
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

	onSplitLine = () => {
		// console.log('splitting...');
	}

	handleTypeClick = type => {
		// console.log('clicked', type);
		// If they are selecting the gate type
		if (type === 'gate') {
			// Don't allow gates longer than 30ft
			if (this.props.line.distance && this.props.line.distance > this._gateMax) {
				this.props.onError({message: 'Gates cannot be longer than 30ft in length.'});

				return;
			}
		}

		this.updateNodeState({
			type,
			grade: 'Flat',

		});

		this.props.onNodeUpdate({a: this.props.pointA, b: this.props.pointB}, {type, panelLength: 5, grade: 'Flat'});
	}

	handleSizeClick = panelLength => {
		// this.updateNodeState({
		// 	panelLength
		// });

		this.props.onNodeUpdate({a: this.props.pointA, b: this.props.pointB}, {panelLength});
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

		if (this.props.line.type === 'gate') {
			if (+e.target.value > this._gateMax) {
				e.preventDefault();
				this.props.onError({message: 'Gates cannot be longer than 30ft in length.'});

				return;
			}
		}

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
			<Container className="gecko-fence-builder__measurer" active={this.state.active}>
				<Container.Inner>
					<Container.Section>
						<Container.Header>Section Length:</Container.Header>
						<Container.Content>
							<Distance>
								<input type="number" min={0} onChange={this.handleInputChange} value={(line.distance ? line.distance : null )} ref={this._inputEl} placeholder="Enter length (Ft.)" />
							</Distance>
						</Container.Content>
					</Container.Section>

					<Container.Section>
						<Container.Header>Panel Type:</Container.Header>
						<Container.Content>
							<Container.ButtonRow>
								<Type selected={line.type === 'fence'} onClick={() => this.handleTypeClick('fence')}>Fence</Type>
								<Type selected={line.type === 'gate'} disabled={line.distance > 30} onClick={() => line.distance <= 30 && this.handleTypeClick('gate')}>Gate</Type>
							</Container.ButtonRow>
							<Container.Note visible={line.type === 'gate'}>NOTE: Gates must not exceed {this._gateMax}ft in length</Container.Note>
						</Container.Content>
					</Container.Section>

					<Container.Section>
						<Container.Header>Panel Width:</Container.Header>
						<Container.Content>
							{line.type === "gate" && <Container.DisabledOverlay />}
							<Sizes>
								{this.props.settings.panelSizes.map(size => <Sizes.Item selected={line.panelLength ? size === line.panelLength : size === 5} onClick={() => this.handleSizeClick(size)}>{size}'</Sizes.Item>)}
							</Sizes>
						</Container.Content>
					</Container.Section>

					<Container.Section center>
						<Container.Header>Terrain Grade:</Container.Header>
						<Container.Content>
							{line.type === "gate" && <Container.DisabledOverlay />}
							<Container.ButtonRow>
								<Type selected={line.grade === 'Flat'} onClick={() => this.handleGradeChange("Flat")}>
									<SVG name="flat" stroke={line.grade === 'Flat' ? '#fff' : '#000'} />
									Flat
								</Type>
								<Type selected={line.grade === 'Medium'} onClick={() => this.handleGradeChange("Medium")}>
									<SVG name="medium" stroke={line.grade === 'Medium' ? '#fff' : '#000'} />
									Medium
								</Type>
								<Type selected={line.grade === 'Steep'} onClick={() => this.handleGradeChange("Steep")}>
									<SVG name="steep" stroke={line.grade === 'Steep' ? '#fff' : '#000'} />
									Steep
								</Type>
							</Container.ButtonRow>
						</Container.Content>
					</Container.Section>

					<Container.FooterSection onClick={this.handleDeleteClick}>
						<CloseButton icon='times-circle' />
						<span>Delete Section</span>
					</Container.FooterSection>
				</Container.Inner>

				<Container.TabClose icon='window-close' onClick={this.handleCloseMenu} />
			</Container>
		);
	}
}
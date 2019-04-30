import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faQuestionCircle} from '@fortawesome/free-regular-svg-icons';
import {faUndo, faRedo, faCog, faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';

import {
	Container,
	Controls,
	LabelButton,
	Footer,
	Gear,
	Chevron,
} from '../AppStyled';

import {Switch} from './switch';

export default class Sidebar extends React.Component {
	constructor(props) {
		super(props);

		this._viewport = React.createRef();
	}

	onTabClick = (e) => {
		e.preventDefault();

		this.props.onOpen({
			sidebarActive: !this.props.sidebarActive
		});
	}

	render() {
		const {settings} = this.props;
		const chevron = this.props.sidebarActive ? faChevronLeft : faChevronRight;

		return (
			<Container ref={this._viewport} active={this.props.sidebarActive}>
				<Controls className="grid-builder-controls">
					<Controls.Actions>
						<LabelButton className="grid-builder-controls__undo" onClick={this.props.handleUndo}><FontAwesomeIcon icon={faUndo} />Undo</LabelButton>
						<LabelButton className="grid-builder-controls__redo" onClick={this.props.handleRedo}>Redo<FontAwesomeIcon icon={faRedo} /></LabelButton>
					</Controls.Actions>
					<Controls.Menu>
						<Controls.MenuItem className="grid-builder-controls__cd" active={settings.continuousDraw}>
							<Controls.Status active={settings.continuousDraw}>
								<label>Continuous Draw:</label>
								<span>{settings.continuousDraw ? 'ON' : 'OFF'}</span>
							</Controls.Status>
							<Switch checked={settings.continuousDraw} onClick={this.props.toggleContinuousDraw} />
						</Controls.MenuItem>
						<Controls.MenuItem className="grid-builder-controls__labels" active={settings.drawLabels}>
							<Controls.Status active={settings.drawLabels}>
								<label>Labels:</label>
								<span>{settings.drawLabels ? 'ON' : 'OFF'}</span>
							</Controls.Status>
							<Switch checked={settings.drawLabels} onClick={this.props.toggleLabels} />
						</Controls.MenuItem>
						<Controls.MenuItem className="grid-builder-controls__crosshairs" active={settings.crosshairs}>
							<Controls.Status active={settings.crosshairs}>
								<label>Crosshairs:</label>
								<span>{settings.crosshairs ? 'ON' : 'OFF'}</span>
							</Controls.Status>
							<Switch checked={settings.crosshairs} onClick={this.props.toggleCrosshairs} />
						</Controls.MenuItem>
						<Controls.MenuItem className="grid-builder-controls__isPan" active={settings.isPan}>
							<Controls.Status active={settings.isPan}>
								<label>Pan:</label>
								<span>{settings.isPan ? 'ON' : 'OFF'}</span>
							</Controls.Status>
							<Switch checked={settings.isPan} onClick={this.props.togglePan} />
						</Controls.MenuItem>
					</Controls.Menu>
					<Footer>
						<Footer.Button className="grid-builder-controls__reset" onClick={this.props.handleReset}><label>Reset</label><FontAwesomeIcon icon={faUndo} /></Footer.Button>
						<Footer.Button className="grid-builder-controls__help" active={settings.help} onClick={this.props.toggleHints}><label>Help</label><FontAwesomeIcon icon={faQuestionCircle} /></Footer.Button>
					</Footer>
				</Controls>
				<Container.Tab onClick={this.onTabClick}>
					<Gear icon={faCog} />
					<Chevron icon={chevron} />
				</Container.Tab>
			</Container>
		);
	}
}

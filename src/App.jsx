import React from 'react';
import {Steps, Hints} from 'intro.js-react';

import StorageAPI from './helpers/localStorage';

import GridCanvas from './components/GridCanvas';
import Sidebar from './components/Sidebar';
import Error from './components/Error';
import Measurer from './components/Measurer';
import { FontAwesomeIcon } from './lib/FontAwesomeIcon';


import {
	Errors,
	AppContainer,
	NextButton
} from './AppStyled';

let initialState = {
	// All of our pt data
	lines: new Map(),
	// All intersections
	intersections: [],
	// errors
	errors: [],
	// Redo actions store
	redoQueue: [],
	// Undo actions store
	undoQueue: [],
	// Last selected item
	lastSelected: null,
	// Selected line
	activeLine: null,
	// Mouse position
	mousePos: {x: 0, y: 0},
	// bubble: null,
	measurer: null,
	// Postition of last item dragged
	lastDragPos: null,
	// Sidebar visible
	sidebarActive: true,
	settings: {
		// Are the intro steps enabled?
		// stepsEnabled: true,
		// Draw crosshairs
		crosshairs: true,
		// Is the help option enabled
		help: false,
		// Continously draw
		continuousDraw: false,
		// Grid square size
		gridScale: 35,
		// Default box sizing (in ft.)
		defaultBoxSize: 5,
		// Panning offset
		offset: {x: 0, y: 0},
		// Snap pt to grid
		snapToGrid: true,
		// Is canvas panning
		isPan: false,
		// Draw labels
		drawLabels: true,
		// Canvas size
		dimensions: {
			// Canvas width on window load
			startWidth: null,
			// Canvas height on window load
			startHeight: null,
			// the start and current size diffrerence
			diffX: 1,
			// the start and current size diffrerence
			diffY: 1,
			// Canvas default width
			width: 600,
			// Canvas default height
			height: 1000
		}
	}
};
// The default props when creating a pt
const defaultNodeProps = {
	// Does the user want the distance to stay fixed?
	fixed: false,
	// Is this line0 hovered
	hovered: false
};

export default class App extends React.Component {
	constructor(props) {
		super(props);

		// Load stored data
		const storage = new StorageAPI();
		const data = storage.loadData();
		if (data) {
			// Put data back into a map
			if (data.lines) {
				data.lines = new Map(data.lines);
			} else {

				data.settings = initialState
			}
			initialState = data;
		} else {
			storage.saveData(initialState);
		}

		this.state = initialState;

		this._container = React.createRef();

		this.handleRedo = this.handleRedo.bind(this);
		this.handleUndo = this.handleUndo.bind(this);
		this.handleSidebarToggle = this.handleSidebarToggle.bind(this);
		this.buildStateControlQueue = this.buildStateControlQueue.bind(this);
		this.updateMeasurer = this.updateMeasurer.bind(this);
		this.handleMeasurerClose = this.handleMeasurerClose.bind(this);
	}

	componentDidMount() {
		this.onResize();
		this.startStateSaver();

		window.addEventListener('resize', this.onResize);
	}

	// setInitialCanvasSize() {
	// 	if (this._container.current) {
	// 		this.updateSettings({
	// 			dimensions: {
	// 				...this.state.settings.dimensions,
	// 				startWidth: this._container.current.clientWidth,
	// 				startHeight: this._container.current.clientHeight,
	// 			}
	// 		});
	// 	}
	// }

	/**
	 * When resized
	 */
	onResize = () => {
		if (this._container.current) {
			const {dimensions} = this.state.settings;

			let startWidth = dimensions.startWidth ? dimensions.startWidth : this._container.current.clientWidth;
			let startHeight = dimensions.startHeight ? dimensions.startHeight : this._container.current.clientHeight;

			const diffX = ((this._container.current.clientWidth * 100) / startWidth) / 100;
			const diffY = ((this._container.current.clientHeight * 100) / startHeight) / 100;


			this.updateSettings({
				dimensions: {
					...this.state.settings.dimensions,
					diffX: diffX,
					diffY: diffY,
					startHeight,
					startWidth,
					width: this._container.current.clientWidth,
					height: this._container.current.clientHeight,
				}
			});
		}
	}

	/**
	 * Updates the app settings
	 * @param {*} setting
	 */
	updateSettings(setting) {
		this.setState({
			settings: {
				...this.state.settings,
				...setting
			}
		});
	}

	/**
	 * Update the measurer
	 * @param {*} update
	 */
	updateMeasurer(update) {
		this.setState({
			measurer: update
		});
	}

	/**
	 * Updates the app state
	 */
	storeState = (state) => {
		this.setState({
			...state,
		}, () => {
			return Promise.resolve();
		});
	}

	/**
	 * Toggles snapping to grid for point
	 */
	toggleSnap = e => {
		e.preventDefault();

		this.updateSettings({
			snapToGrid: !this.state.settings.snapToGrid
		});
	}

	/**
	 * Toggles Label display
	 */
	toggleLabels = e => {
		e.preventDefault();

		this.updateSettings({
			drawLabels: !this.state.settings.drawLabels
		});
	}

	/**
	 * Toggles panning
	 */
	togglePan = e => {
		e.preventDefault();

		this.updateSettings({
			isPan: !this.state.settings.isPan
		});
	}

	/**
	 * Toggles drawing crosshairs
	 */
	toggleCrosshairs = () => {
		this.updateSettings({
			crosshairs: !this.state.settings.crosshairs
		});
	}

	toggleContinuousDraw = () => {
		this.updateSettings({
			continuousDraw: !this.state.settings.continuousDraw
		});
	}

	/**
	 * Toggles the intro state
	 */
	// disableIntroState() {
	// 	this.updateSettings({
	// 		stepsEnabled: false
	// 	});
	// }

	/**
	 * Toggles showing hints
	 */
	// toggleHints = () => {
	// 	this.updateSettings({
	// 		hints: !this.state.settings.hints
	// 	});
	// }

	preloadData(data) {
		this.setState({
			lines: new Map(data)
		});
	}

	/**
	 * Exports all of the line data
	 */
	exportData = () => {
		return this.state.lines;
	}

	/**
	 * Saves the app state every 1/2 second
	 */
	startStateSaver() {
		setInterval(() => {
			const storage = new StorageAPI();
			const {lastSelected, lastDragPos, settings, ...rest} = this.state;
			const {dimensions, ...prunedSettings} = settings;

			rest.lines = Array.from(rest.lines.entries());

			// Clear out the queues
			rest.undoQueue = [];
			rest.redoQueue = [];

			storage.saveData({...rest, settings: {
				...prunedSettings,
				dimensions: {
					height: 400,
					width: 600,
					diffX: dimensions.diffX,
					diffY: dimensions.diffY,
				}
			}});
		}, 500);
	}

	/**
	 * Updates the line properties
	 * @param {Node} line line to be updated
	 * @param {Object} updates updates to add
	 */
	handleUpdateLine = (line, updates) => {
		this.updateLine(this.findLine(line), {...updates});
	}

	/**
	 * Map key for storing unique pt data
	 * @param {Object} ptA
	 */
	getMapKey(ptA) {
		return `${ptA.x}-${ptA.y}`;
	}

	/**
	 * Find a node given x and y
	 * @param {Point} point point a and b
	 */
	findLine = ({a, b}) => {
		for (const [key, set] of this.state.lines) {
			if (set.length) {
				for (let i=0; i<set.length; i++) {
					const line = set[i];
					const result = {
						line
					};

					if (this.isSameNode(line, {a, b})) return result;
				}
			}
		}

		return false;
	}

	/**
	 * Find all nodes whose A equals the given point
	 * @param {Point} point point to find
	 * @param {number} buffer discrepency
	 */
	findLinesAtLocation = (point, buffer = 0) => {
		const outLines = [];

		const searchSet = set => {
			for (let i=0; i<set.length;i++) {
				const line = set[i];
				const distance = Math.sqrt(Math.pow((point.a.y-line.a.y),2) + Math.pow((point.a.x-line.a.x), 2));
				// If this line has the same A as the one given or is within the radius given
				if (
					(line.a.x === point.a.x && line.a.y === point.a.y)
					||
					(distance <= buffer)
				) {
					outLines.push({
						line
					});
				}
			}
		}

		const key = this.getMapKey(point.a);
		if (this.state.lines.has(key)) {
			const set = this.state.lines.get(key);

			searchSet(set);
		} else {
			for (const [key, set] of this.state.lines) {
				searchSet(set);
			}
		}

		return outLines;
	}

	/**
	 * Updates a node and all nodes referencing it
	 * @param {Node} node object to be updated
	 * @param {Object} values to be added to node
	 * @return {Node} updated node
	 */
	updateLine = (node, update) => {

		return new Promise((resolve) => {
			// Copy the lines
			let newLines = new Map(this.state.lines);

			if (!node) {
				return;
			}

			// Create the updated node
			const newNode = {
				...node.line,
				...update
			};

			const key = this.getMapKey(node.line.a);
			if (newLines.has(key)) {
				let set = [...newLines.get(key)];
				for (let i in set) {
					const line = set[i];
					if (this.isSameNode(line, node.line)) {

						// console.log('IS SAME', {line, node: node.line});

						// If updating Anode and it's not at the same a.x/y, update to new key local
						if (update.a && !(update.a.x === node.line.a.x && update.a.y === node.line.a.y)) {
							const newKey = this.getMapKey(update.a);

							if (newLines.has(newKey)) {
								const newSet = newLines.get(newKey);

								// Remove from old set
								set.splice(i, 1);
								if (set.length === 0) {
									// If the set is now empty, delete the key
									newLines.delete(key);
								} else {
									newLines.set(key, set);
								}

								// Add to new set
								newLines.set(newKey, [...newSet, newNode]);
							} else {
								// Search it in the other sets
								for (const [key, valSet] of newLines) {
									for (const i in valSet) {
										if (this.isSameNode(valSet[i], node.line)) {
											valSet.splice(i, 1);
											newLines.set(key, valSet);

											break;
										}
									}
								}
								// Else create the new keyed index
								newLines.set(newKey, [newNode])
							}
						} else {
							set[i] = newNode;
							newLines.set(key, set);
						}

						break;
					}
				}

  			}

			this.setState({
				lines: newLines,
			}, () => {
				resolve(newNode)
			});
		})
	}

	/**
	 * Removes a line from the dataset
	 * @param {Point} point A
	 * @param {Point} point B
	 */
	removeLine = (ptA, ptB) => {
		// Create a new Map
		let newLines = new Map(this.state.lines);
		for (const [objKey, linesSet] of newLines) {
			// Create a new set
			const newSet = [...linesSet];
			for (const i in newSet) {
				if (this.isSameNode({...newSet[i]}, {a: ptA, b: ptB})) {
					// Remove the line from the set
					newSet.splice(i, 1);
					break;
				}
			}

			newLines.set(objKey, newSet);
		}

		this.setState({
			lines: newLines
		});
	}

	/**
	 * Find all nodes referencing the given node
	 * @param {number} x-pos
	 * @param {number} y-pos
	 * @return {Array} array of reference points
	 */
	findRefPts = (x,y) => {
		let out = [];
		for (let [key, set] of this.state.lines) {
			if (set.length) {
				for (const line of set) {
					if (line.b && (line.b.x === x && line.b.y === y)) {
						out.push({
							line
						});
					}
				}
			}
		}

		return out;
	}

	/**
	 * Creates a pt at the point clicked
	 * @param {number} x anchor x-pos
	 * @param {number} y anchor y-pos
	 * @param {Object} props additional properties
	 * @return void
	 */
	createPt = (x, y, options = defaultNodeProps) => {
		// Create a new arr
		const newLines = new Map(this.state.lines);

		// The new anchor being created
		const point = {
			a: {
				x,
				y,
			},
			...options
		};

		const key = this.getMapKey({x, y});
		if (newLines.has(key)) {
			const set = newLines.get(key);
			set.push(point);

			newLines.set(key, set);
		} else {
			newLines.set(key, [point]);
		}

		this.storeState({
			lines: newLines,
		});

		return {
			line: point
		};
	}

	/**
	 * Deletes an anchor from the gird
	 * @param {Node} Node being removed
	 */
	removePt = (node) => {
		let newLineSet = new Map(this.state.lines);

		if (!node) {
			return;
		}

		// Remove all points at this local
		const removeAllAtPt = (node) => {
			const nodesAtLocal = this.findLinesAtLocation(node.line);
			if (nodesAtLocal.length) {
				for (const n of nodesAtLocal) {
					const key = this.getMapKey(n.line.a);
					if (newLineSet.has(key)) {
						let set = newLineSet.get(key);
						// create a clone
						let newSet = [...set];
						newSet = newSet.filter(l => !(n.line.a.x === l.a.x && n.line.a.y === l.a.y));
						newLineSet.set(key, newSet);
					}

				}
			}
			return newLineSet;
		}

		removeAllAtPt({...node});

		//Find all nodes that reference this node and update
		const refNodes = this.findRefPts(node.line.a.x, node.line.a.y);
		if (refNodes.length) {
			for (const n of refNodes) {
				const newNode = {...n};
				// Check if there are other refs to the node being removed
				const hasRefs = this.findRefPts(n.line.a.x, n.line.a.y);

				newNode.line = {...n.line};

				// Delete the reference to this node
				delete(newNode.line.b);

				// If the refNode had a previous node
				if (hasRefs.length) {
					this.updateLine(newNode, {...newNode.line});
				} else {
					removeAllAtPt(newNode);
				}
			}
		}


		this.setState({
			lines: newLineSet
		});
	}

	/**
	 * Check if two nodes are the exact same node
	 * @param {Node} nodeA node a
	 * @param {Node} nodeB node b
	 * @return {Boolean} is the node the same?
	 */
	isSameNode = (nodeA, nodeB) => {
		if (nodeA.a.x === nodeB.a.x && nodeA.a.y === nodeB.a.y) {
			if (nodeA.b && nodeB.b) {
				if (nodeA.b.x === nodeB.b.x && nodeA.b.y === nodeB.b.y) {
					return true;
				}
			} else {
				if (!nodeA.b && !nodeB.b) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Handle errors
	 * @param {Error} error error message
	 */
	handleErrors = error => {
		this.setState({
			errors: [...this.state.errors].push(error)
		});
	}

	/**
	 * Closes the error message
	 * @param {number} index index of error to remove
	 */
	handleErrorClose = index => {
		this.setState({
			errors: [...this.state.errors].splice(index, 1)
		});
	}

	/**
	 * When closing introjs overlay
	 * @param {Event} e
	 */
	handleIntroExit = e => {
		this.disableIntroState();
	}

	/**
	 * Updates the grid size
	 * @param {Event} e
	 */
	// handleScaleChange = e => {
	// 	const boxSize = Math.round((e.target.valueAsNumber * this.state.settings.defaultBoxSize) / this.state.settings.gridScale);

	// 	console.log({boxSize})
	// 	this.updateSettings({
	// 		gridScale: e.target.valueAsNumber,
	// 		defaultBoxSize: boxSize
	// 	});
	// }

	/**
	 * Handles the redo and undo logic
	 */
	buildStateControlQueue = () => {
		// Get the current state
		const currentState = {...this.state};
		// Get the undo Queue
		const {undoQueue} = currentState;

		// Remove the items that we don't want to carry over from the root state
		const {lastSelected, bubble, measurer, activeLine, ...prunedState} = currentState;
		const {crosshairs, stepsEnabled, isPan, drawLabels, dimensions, continuousDraw, help, ...prunedSettings} = currentState.settings;

		// Create the new state
		const newState = {...prunedState};
		// Merge current settings with our new settings
		newState.settings = {...this.state.settings, ...prunedSettings};

		// Build thew new undo Queue and append the new state to it
		const newUndoQ = [...undoQueue, newState];

		this.setState({
			undoQueue: newUndoQ,
			redoQueue: [], // We want to clear out redo queue if change was made
		}, () => {
			return Promise.resolve();
		});
	}

	/**
	 * Undo previous action
	 */
	handleUndo() {
		// Create our new state obj
		const currentState = {...this.state};
		// Prune out props we don't want to carry fwd
		const {lastSelected, lastDragPos, bubble, measurer, ...prunedState} = currentState;
		// Prune the settings out
		const {crosshairs, stepsEnabled, sidebarActive, isPan, drawLabels, dimensions, continuousDraw, help, ...rest} = prunedState.settings;
		// Create the new undoQueue
		const undoQueue = [...prunedState.undoQueue];
		// Retrieve the last state
		const prevState = undoQueue.pop();

		if (prevState) {
			// Merge the current state settings with the pruned settings
			prunedState.settings = {...prunedState.settings, ...rest};

			// Close the measurer and nullify its data
			prevState.measurer = null;
			prevState.activeLine = null;

			if (prevState) {
				// Add the new el to the redo queue
				prevState.redoQueue = [...prevState.redoQueue, prunedState];

				this.setState({
					...prevState
				});
			}
		}
	}

	/**
	 * Redo previous action
	 */
	handleRedo() {
		// Create new state
		const newState = {...this.state};

		if (newState.redoQueue && newState.redoQueue.length) {
			const lastState = newState.redoQueue.pop();

			this.setState({
				...lastState
			});
		}
	}

	/**
	 * Toggle the sidebar
	 */
	handleSidebarToggle() {
		this.setState({
			sidebarActive: !this.state.sidebarActive
		});
	}

	/**
	 * On Measurer menu close
	 */
	handleMeasurerClose() {
		// Find the active Line and de-activate it
		if (this.state.activeLine) {
			const al = this.findLine(this.state.activeLine);
			console.log({al});
			this.updateLine(al, {active: false});
		}

		this.setState({
			measurer: null,
			activeLine: null
		});
	}

	/**
	 * Reset the app state
	 */
	handleReset = () => {
		this.setState({
			lines: new Map(),
			undoQueue: [],
			redoQueue: [],
			intersections: [],
			errors: [],
			lastSelected: null,
			measurer: null,
			lastDragPos: null,
			settings: {
				...this.state.settings,
				offset: {x: 0, y: 0},
			}
		});

	}

	render() {
		return (
			<AppContainer className="grid-builder" ref={this._container}>
				{this.state.errors.length > 0 &&
					<Errors>
						{this.state.errors.map((err, i) => <Error key={`Error-${i}`} message={err.message} onCloseError={() => this.handleErrorClose(i)} />)}
					</Errors>
				}
				<GridCanvas
					lines={this.state.lines}
					activeLine={this.state.activeLine}
					intersections={this.state.intersections}
					measurer={this.state.measurer}
					settings={this.state.settings}
					lastSelected={this.state.lastSelected}
					lastDragPos={this.state.lastDragPos}
					height={this.state.settings.dimensions.height}
					width={this.state.settings.dimensions.width}
					storeState={this.storeState}
					isSameNode={this.isSameNode}
					createPt={this.createPt}
					removePt={this.removePt}
					findRefPts={this.findRefPts}
					updateLine={this.updateLine}
					updateMeasurer={this.updateMeasurer}
					onLineUpdate={this.handleUpdateLine}
					removeLine={this.removeLine}
					findLine={this.findLine}
					findLinesAtLocation={this.findLinesAtLocation}
					onError={this.handleErrors}
					undoLast={this.handleUndo}
					redoLast={this.handleRedo}
					saveActions={this.buildStateControlQueue}
				/>
				<Sidebar
					sidebarActive={this.state.sidebarActive}
					settings={this.state.settings}
					toggleHints={this.toggleHints}
					handleReset={this.handleReset}
					exportData={this.exportData}
					toggleContinuousDraw={this.toggleContinuousDraw}
					toggleLabels={this.toggleLabels}
					toggleCrosshairs={this.toggleCrosshairs}
					togglePan={this.togglePan}
					handleScaleChange={this.handleScaleChange}
					handleUndo={this.handleUndo}
					handleRedo={this.handleRedo}
					onOpen={this.handleSidebarToggle}
				/>

				{this.state.measurer &&
					<Measurer
						settings={this.state.settings}
						pointA={this.state.measurer.a}
						pointB={this.state.measurer.b}
						line={this.state.measurer.line}
						onError={this.handleErrors}
						onClose={this.handleMeasurerClose}
						onNodeUpdate={(pt, update) => {
							this.buildStateControlQueue();
							this.handleUpdateLine(pt, update);
							this.updateMeasurer({
								...this.state.measurer,
								line: {
									...this.state.measurer.line,
									...update
								}
							});
						}}
						onDeleteLine={(ptA, ptB) => {
							this.buildStateControlQueue();
							this.removeLine(ptA, ptB);
							this.updateMeasurer(null);
						}}
					/>
				}

				<NextButton active={this.state.sidebarActive} offset={this.state.measurer} onClick={this.exportData} className="wp-block-button grid-builder-controls__export is-style-arrow">
					<a href="#">Calculate</a>
				</NextButton>
			</AppContainer>
		);
	}
}

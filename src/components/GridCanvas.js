import React from 'react';
import styled from 'styled-components';

import debounce from '../helpers/debounce'

import SliceTool from '../assets/slice.png';

const GridCanvasContainer = styled.div`
	position: relative;
`;

const colors = {
	primary: 'dodgerblue', // blue
	secondary: '#0055a2', // light blue,
	gate: '#f39404', // orange,
	cursor: 'green',
	fence: 'black',
	text: 'rebeccapurple',
	noPlace: 'red', // Can't place here
	hit: 'green',
	active: '#0F0',
	fencePost: '#AAA',
	shadow: '#cbe'
}

export default class GridCanvas extends React.Component {
	constructor(props) {
		super(props);

		// Turn on debug
		this._debug = false;

		this.state = {
			// All points that attached to the one being udates
			refQueue: [],
			// The points being made
			ptQueue: [],
			// The line that was last hovered
			hoveredLine: null,
			settings: {
				// If the canvas is dragging
				isDrag: false,
				// If the canvas is drawing
				isDrawing: false,
				...this.props.settings
			}
		}

		this._ctx = null;
		this._canvas = React.createRef();
		this.dragTimeout = null;
		this.panTimeout = null;

		// The actual mouse xy
		this.mousePos = {
			x: 0,
			y: 0
		}

		this.draw = this.draw.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		// this.onKeyPress = this.onKeyPress.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.onDocumentKeyPress = this.onDocumentKeyPress.bind(this);
		this.updateMousePosition = this.updateMousePosition.bind(this);
		this.enableDragListener = this.enableDragListener.bind(this);
	}

	componentDidMount() {
		this._ctx = this._canvas.current.getContext('2d');
		this._ctx.fillRect(0,0, this.props.width, this.props.height);

		this.draw();
		this.listenForEvents();
	}

	componentWillUnmount() {
		this._canvas.current.removeEventListener('mousemove', debounce(this.onMouseMove, 250));
		this._canvas.current.removeEventListener('mousedown', this.onClick);
		this._canvas.current.removeEventListener('mouseUp', this.onMouseUp);

		// document.removeEventListener('keydown', this.onKeyPress);
		document.removeEventListener('keydown', this.onDocumentKeyPress);
		document.removeEventListener('keyup', this.onKeyUp);

		cancelAnimationFrame(this.draw);
	}

	/**
	 * Draw loop
	 * @return {void}
	 */
	draw() {
		// setup the context
		this._ctx.save();
		this._ctx.setTransform(1,0,0,1,0,0);
		this._ctx.clearRect(0, 0, this.props.width, this.props.height);
		this._ctx.restore();

		// Draw the grid itself
		this.drawGrid();
		// Draw points on the grid
		this.drawPoints();
		// Draw the mouse pointer
		this.drawMousePosition();
		// Draw the crosshairs
		this.drawCrosshair();
		// draw the current line
		this.drawLineToMouse();
		// Draw all of the data lines
		this.drawLines();

		requestAnimationFrame(this.draw);
	}

	/**
	 * Update the state settings
	 * @param  {Object} settings Settings to update
	 * @return {void}
	 */
	updateSetting(settings) {
		this.setState({
			settings: {
				...this.state.settings,
				...settings
			}
		})
	}

	/**
	 * Listen for DOM events
	 * @return {void}
	 */
	listenForEvents() {
		this._canvas.current.addEventListener('mousemove', this.onMouseMove);
		this._canvas.current.addEventListener('mousedown', this.onClick);
		this._canvas.current.addEventListener('mouseup', this.onMouseUp);
		this._canvas.current.addEventListener('mouseout', this.onMouseOut);

		// window.addEventListener('keydown', this.onKeyPress);
		document.addEventListener('keydown', this.onDocumentKeyPress);
		document.addEventListener('keyup', this.onKeyUp);
	}

	/**
	 * Enables the on drag evend}
	 */
	enableDragListener(initX, initY) {
		let lastDragPos = {a: {x: initX, y: initY}};
		this.props.storeState({
			lastSelected: lastDragPos,
			lastDragPos: lastDragPos
		});

		this.updateSetting({
			isDrag: true,
			isDrawing: false
		});
	}

	/**
	 * On drag point
	 * @param {Event} e
	 */
	onDrag = e => {
		// If the user is dragging
		if (this.state.settings.isDrag && !this.props.settings.isPan) {
			const {x, y} = this.getMousePosition();

			// Close out the measurer
			this.props.updateMeasurer(null);

			// Reset the active line
			if (this.props.activeLine) {
				const n = this.props.findLine(this.props.activeLine);
				this.props.updateLine(n, {active: false});
			}

			const {lastDragPos} = this.props;
			if (this.props.lastSelected) {
				// Find pts that point to the one being dragged
				const refPts = this.props.findRefPts(lastDragPos.a.x, lastDragPos.a.y);
				for (const ref of refPts) {
					/**
					 * TODO: Draw the distance on the lines being dragged (not working for some reason)
					 */
					// const midPoint = this.getMidPoint(ref.line.a, lastDragPos.a);
					// console.log({lastDragPos, ref: ref.line, midPoint});
					// this.drawText(ref.line.distance, midPoint.x, midPoint.y, true, {fillStyle: '#000'});

					// Set the drag state for all nodes that point to the node being dragged
					this.props.updateLine(ref, {b: {...ref.line.b, isDragging: true}});

				}

				// Find all pts that are at the dragged pt
				const ptsAtLocal = this.props.findLinesAtLocation(lastDragPos);
				for (const pt of ptsAtLocal) {
					// Set the drag state for all nodes that are being dragged
					if (pt.line.b && pt.line.a.x === lastDragPos.a.x && pt.line.a.y === lastDragPos.a.y) {
						pt.line.reverse = true;
						refPts.push(pt);
					}
					/**
					 * TODO: Draw the distance on the lines being dragged (not working for some reason)
					 */
					// const midPoint = this.getMidPoint(pt.line.a, lastDragPos.a);
					// console.log({lastDragPos, ref: pt.line})
					// this.drawText("here", midPoint.x ,midPoint.y, true, {fillStyle: '#f00'});

					this.props.updateLine(pt, {a: {...pt.line.a, isDragging: true}});
				}

				this.setState({
					refQueue: refPts,
					ptQueue: ptsAtLocal
				});
				this.props.storeState({
					lastSelected: {
						a: {x, y},
						// b: {x: lastSelected.a.x, y: lastSelected.a.y }
					}
				});
			}
		}
	}

	/**
	 * Detect on document key press
	 * @param {*} e
	 */
	onDocumentKeyPress(e) {
		if (!this.state.settings.isDrag && !this.state.settings.isDrawing) {
			// If cntrl+shift+z
			if (
				(e.ctrlKey && e.shiftKey && e.keyCode === 90)
				||
				(e.metaKey && e.shiftKey && e.keyCode === 90)
			) {
				this.props.redoLast();
			}
			// If cntrl+z
			else if (
				(e.keyCode === 90 && e.ctrlKey)
				||
				(e.metaKey && e.keyCode === 90)
			) {
				this.props.undoLast();
			}
			// If holding spacebar, enable drag
			else if (e.keyCode === 32) {
				e.preventDefault();
				// Set a timeout to detect is spacebar is being held

				// Focus the pan div so that the screen doesn't go wacky when panning using spacebar (NOT WORKING!)
				const panDiv = document.querySelector('.gecko-fence-builder-controls__isPan');
				if (panDiv) {
					panDiv.focus();
				}
				this.panTimeout = setTimeout(() => {
					this.props.storeState({
						settings: {
							...this.props.settings,
							isPan: true
						}
					});
				}, 100);
			}
		}

		if (!this.state.settings.isDrag) {
			const {lastSelected} = this.props;

			if (e.key === 'Escape') {
				if (this.state.settings.isDrag || this.state.settings.isDrawing) {
					if (lastSelected) {
						// If the last selected doesn't have a pt, remove it
						if (!lastSelected.b) {
							const refs = this.props.findRefPts(lastSelected.a.x, lastSelected.a.y);
							if (!refs.length) {
								const lastN = this.props.findLine(lastSelected);
								this.props.removePt(lastN);
							}
						}
					}

					this.updateSetting({isDrawing: false});
					this.props.storeState({
						lastSelected: null
					});
				}
			}
		}
	}

	// /**
	//  * On key pressed
	//  * @param {Event} e
	//  */
	// onKeyPress(e) {


	// }

	onKeyUp(e) {
		// If the spacebar was being held, reset the pan
		if (e.keyCode === 32) {
			clearTimeout(this.panTimeout);
			this.props.storeState({
				settings: {
					...this.props.settings,
					isPan: false
				}
			});
		}
	}

	/**
	 * On Click Handler
	 * @param {Event} e
	 * @return {void}
	 */
	onClick(e) {
		e.preventDefault();

		// Save the current state for undo/redo before making edits
		this.props.saveActions();

		// If left click
		if (e.button === 0) {
			const {x,y} = this.getMousePosition();
			const {lastSelected} = this.props;
			let draw = true; // Wether or not to draw
			let newPoint = {a: {x,y}}; // Create the new last selected obj

			// Start a click hold listener
			this.dragTimeout = setTimeout(() => {
				this.enableDragListener(x, y);
			}, 150);

			// Dont' draw a line if panning
			if (this.props.settings.isPan) {
				draw = false;
			}

			// If the user is hovering over a line on click but isn't drawing
			const taken = this.pointExists(x, y, 1);
			if (this.state.hoveredLine && !lastSelected && !this.state.isDrawing && !taken) {
				// Should we continue drawing
				draw = false;

				// If on the line and isn't drawing
				const onLine = this.detectLineCollision(x, y , 15);
				// const hit = this.detectLineCollision(this.mousePos.x, this.mousePos.y, 10);
				const hitData = onLine ? onLine : null;
				if (hitData && !this.state.isDrawing) {
					// Deactivate the current active line
					if (this.props.activeLine) {
						const n = this.props.findLine(this.props.activeLine);
						this.props.updateLine(n, {active: false});
					}

					let nextActiveLine = hitData;
					// If they clicked the same line
					if (this.props.activeLine && this.props.isSameNode(this.props.activeLine, nextActiveLine)) {
						// If this line was already active
						nextActiveLine = null;

						this.updateMeasurer(null);

						draw = true;
					}

					// Set the new line as the active line
					this.props.storeState({
						activeLine: nextActiveLine
					});

					if (nextActiveLine) {
						// Update the measurer
						this.updateMeasurer({
							position: {x: (nextActiveLine.a.x + nextActiveLine.b.x) / 2, y: (nextActiveLine.a.y + nextActiveLine.b.y) / 2},
							...hitData
						});

						// Set the new line to be active
						// console.log({activating: this.props.activeLine});
						const n = this.props.findLine(this.props.activeLine);
						this.props.updateLine(n, {active: true});
					}
				}
			}

			if (draw) {
				// Draw any intersections
				this.drawIntersections();

				// If there was previously selected pt
				if (lastSelected) {
					// If this is the same point as the last point that was selected
					const isSamePoint = this.props.isSameNode(lastSelected, newPoint);
					if (!isSamePoint) {
						// If there is a  already a pt at this position
						const nodeAtPos = this.props.findLine(newPoint);
						if (nodeAtPos) {
							newPoint = nodeAtPos.line;
						} else {
							newPoint = this.placePt(x, y).line;
						}
					} else {
						// If continuous drawing is enabled, don't stop drawing after placing a pt
						if (this.props.settings.continuousDraw) {
							draw = false;
							newPoint = null;
						}
					}

					// Connect all of the intersections
					this.connectIntersections(lastSelected, this.props.intersections, newPoint);

					// Connect the last selected and the newly created pt
					this.connectPoints(lastSelected, newPoint);

					// Prevent the tool from continuing to draw
					if (!this.props.settings.continuousDraw) {
						newPoint = null;
						draw = false;
					}
				} else {
					// Place a new pt
					newPoint = this.placePt(x, y).line;
				}

				// Set the last selected node
				this.props.storeState({
					lastSelected: newPoint
				});
			}

			// Draw a line to the mouse
			this.updateSetting({isDrawing: draw});
		}
	}

	/**
	 * On Mouse Move event
	 * @param {Event} e
	 */
	onMouseMove(e) {
		const {x, y} = this.getMousePosition();
		const {settings} = this.state;

		/**
		 * TODO: Line detection is prioritizing over pt detection and not allowing a pt to be selected
		 * Need to find a way to prevent line from being selected when a pt is selected.
		 * Might need to do this at a different layer
		 */

		// const {x: aX, y: aY} = this.mousePos;
		// const hit = this.detectNearLine(x, y);

		// const taken = this.pointExists(x, y, 1);
		const onLine = this.detectLineCollision(x, y, 15);

		// Don't do anything when the user is drawing|dragging|panning
		if (!settings.isDrag && !settings.isDrawing && !this.props.settings.isPan) {

			// If the line already has a point at point xy
			// if (!taken) {
				// const hitData = hit ? hit : onLine ? onLine : null;
				const hitData = onLine;
				// console.log({hit})
				if (hitData) {

					// If the line is already activated, use the slice tool

					// Set the hovered line
					this.setState({
						hoveredLine: onLine
					});

					// Update the line to be hovered state
					this.props.updateLine(onLine, {hovered: true});
				} else {
					// Nullify the hovered lne
					if (this.state.hoveredLine) {
						// console.log('unhovering', this.state.hoveredLine);
						this.props.updateLine(this.state.hoveredLine, {hovered: false});
						this.setState({
							hoveredLine: null
						});
					}
				}
			// }
		}

		debounce(this.onPan(e), 50);
		debounce(this.onDrag(e), 50);
		debounce(this.updateMousePosition(e), 200);
	}

	/**
	 * On panning
	 * @param {Event} e
	 */
	onPan(e) {
		if (!this.props.settings.isPan || !this.props.lastDragPos) {
			return;
		}

		const {lastDragPos} = this.props;
		const {x, y} = this.getMousePosition();
		const dx = lastDragPos.a.x - x;
		const dy = lastDragPos.a.y - y;

		// Change from neg to positive to invert direction when panning
		this.props.storeState({
			settings: {
				...this.props.settings,
				offset: {
					x: this.props.settings.offset.x + dx * -1,
					y: this.props.settings.offset.y + dy * -1
				}
			}
		});
	}

	/**
	 * On mouse up actions
	 * NOTE: Connecting lines not complete
	 * @param {Event} e
	 */
	onMouseUp(e) {
		// Clear the drag event to stop drag
		clearTimeout(this.dragTimeout);

		if (this.state.settings.isDrag) {
			const {lastSelected} = this.props;
			const {x, y} = lastSelected.a;
			const {lastDragPos} = this.props;
			// If the user drops a pt on top of an existing node, we want to negate the action
			const nodesAtPos = this.props.findLinesAtLocation(lastSelected);
			const isSamePt = this.props.isSameNode({a: {x, y}}, lastDragPos);


			if (!nodesAtPos.length && !isSamePt) {
				// Place the intersect pts
				this.drawIntersections();

				/**
				 * Check what intersections lie on each line being dragged and store for next step
				 */
				const linesWithIntersections = [];
				for (const ref of this.state.refQueue) {
					const newRef = {...ref.line, intersections: []};
					for (const intersect of this.props.intersections) {
						// if the node already contains the new pos
						if (
							(intersect.x === x || intersect.y === y)
							||
							(intersect.x === newRef.a.x && intersect.y === newRef.a.y )
							||
							(intersect.x === newRef.b.x && intersect.y === newRef.b.y )
						) {
							continue;
						}

						// If it's a reverse line, we need to switch the nodes around for the next step
						let ptA = ref.line.a;
						if (ref.line.reverse) {
							ptA = ref.line.b;
						}

						// If the intersect is on a line
						const isOnLine = this.isBetween(ptA, {x, y}, intersect, 20);
						if (isOnLine) {
							newRef.intersections.push(intersect);
						}

						// If the line had intersections, update it to prep for next step
						if (newRef.intersections.length && ref.line.reverse) {
							this.props.updateLine(ref, {a: lastSelected.a});
						}
					}

					if (newRef.intersections.length) {
						linesWithIntersections.push(newRef);
					}
				}

				/**
				 * Go through the newly created line sets and connect their intersections
				 */
				for (let line of linesWithIntersections) {
					line = line.reverse ? {...line, a: {...lastSelected.a}} : line;
					const final = line.reverse ?  {a:{...line.b}} : lastSelected;
					this.connectIntersections(line, line.intersections, final);
				}
			}

			/**
			 * Update all nodes that point to the ones being dragged and updated pt drag state
			 */
			const refNodes = this.state.refQueue;
			if (refNodes.length) {
				for (const ref of refNodes) {
					// Get the distance for the node not being dragged
					let updates = {...ref.line, a: {...ref.line.a, isDragging: false}, b: {...ref.line.b, isDragging: false}};
					// If the user doesn't drag the pt, don't set the dist
					if (!isSamePt) {
						const anchoredNode = ref.line.a.isDragging ? ref.line.b : ref.line.a;
						const distTotal = this.getPtDistance({x,y}, anchoredNode);
						const dist = this.getTotalDistance(distTotal);

						updates.distance = dist;
					}


					if (!nodesAtPos.length) {
						// const {lastDragPos} = this.props;
						// If the pt is the same as the last dragged
						// if (lastDragPos.a.x === ref.line.a.x && lastDragPos.a.y === ref.line.a.y) {
						// 	updates = {...updates, a: {...updates.a, x, y}};
						// } else if (ref.line.b && (lastDragPos.a.x === ref.line.b.x && lastDragPos.a.y === ref.line.b.y)) {
						// 	updates = {...updates, b: {...updates.b, x, y}}
						// }

						// If the pt is the same as the last dragged
						if (ref.line.a.isDragging) {
							updates = {...updates, a: {...updates.a, x, y}};
						} else {
							updates = {...updates, b: {...updates.b, x, y}}
						}
					}

					this.props.updateLine(ref, updates);
				}
			}

			/**
			 * Update the points that are being dragged
			 */
			const nodes = this.state.ptQueue;
			if (nodes.length) {
				for (const n of nodes) {
					let newNode = {
						...n.line,
						a: {...n.line.a, isDragging: false}
					}

					// If there is a b node, update the distance
					if (n.line.b && !isSamePt) {
						const dist = this.getPtDistance({x,y}, n.line.a);
						newNode.distance = this.getTotalDistance(dist);
					}
					if (!nodesAtPos.length) {
						newNode.a = {
							...newNode.a,
							x,
							y
						}
					}

					this.props.updateLine(n, newNode);
				}
			}

			// Check if pt is on a line
			if (this.detectLineCollision(x, y, 5)) {
				this.placePt(x, y);
			}
			// Reset the dragging state
			this.updateSetting({isDrag: false});

			// Clear out the pt queues
			this.setState({
				refQueue: [],
				ptQueue: [],
			});

			// Reset the drag positions
			this.props.storeState({
				lastSelected: null,
				lastDragPos: null,
			});
		}
	}

	/**
	 * On mouse out
	 * @param {Event} e
	 */
	onMouseOut(e) {
		if (this.props.settings.isPan) {
			this.updateSetting({
				isPan: false,
				isDrag: false,
			});
			this.props.storeState({
				lastSelected: null,
				lastDragPos: null
			})
		}
	}

	/**
	 * Gets the bounding rect of the canvas
	 */
	getCanvasBounds() {
		return this._canvas.current.getBoundingClientRect();
	}

	/**
	 * Get the midpoint of 2 points
	 * @param {object} ptA ptA coords
	 * @param {object} ptB ptB coords
	 * @param {Boolean} relative should the midpoint be relative to ptA?
	 */
	getMidPoint(ptA, ptB, relative = true) {
		return {
			x: ((ptB.x - ptA.x) / 2) + (relative ? ptA.x : 0),
			y: ((ptB.y - ptA.y) / 2) + (relative ? ptA.y : 0),
		}
	}

	/**
	 * Get the angle between 2 points
	 * @param {Object} p1
	 * @param {Object} p2
	 * @param {Boolean} absolute should return absolute val?
	 * @return {Int} angle betwen points
	 */
	getAngle(p1, p2, absolute = false) {
		const dx = p1.x - p2.x;
		const dy = p1.y - p2.y;

		let rads = Math.atan2(dy, dx);

		if (absolute && rads < 0) {
			rads = Math.abs(rads);
		}

		return rads * 180 / Math.PI;
	}

	/**
	 * Updates the mousePosition
	 * @param {Event} e
	 * @return void
	 */
	updateMousePosition(e) {
		this.mousePos = {
			x: e.x,
			y: e.y,
		};
	}

	/**
	 * Gets the total distance of the drawn line in ft
	 * @param {number} distance in pixels
	 * @param {number} boxSize size of the grid-boxes
	 */
	getTotalDistance(distance, boxSize = this.props.settings.defaultBoxSize) {
		// Divide by panel length to get total number of panels
		return Math.ceil((distance / this.props.settings.gridScale) * boxSize);
	}

	// /**
	//  * Get the total number of panels required to span the distance
	//  * @param {*} distance
	//  * @param {*} panelLength
	//  */
	// getTotalNumberOfPanels(distance, panelLength = this.props.settings.defaultPanelWidth) {
	// 	return distance / panelLength;
	// }

	/**
	 * Get the distance between 2 pts in pixels
	 * @param {Object} ptA
	 * @param {Object} ptB
	 * @param {number} relativeDist
	 */
	getPtDistance(ptA, ptB) {
		const nodeW = Math.ceil(Math.abs(ptB.x - ptA.x));
		const nodeH = Math.ceil(Math.abs(ptB.y - ptA.y));

		const a = nodeW**2;
		const b = nodeH**2;

		return Math.ceil(Math.sqrt(a + b));
	}

	/**
	 * Gets the position on the grid for placing pt on grid
	 * @param {number} x x-pos
	 * @param {number} y y-pos
	 * @return {object} xy of position on grid
	 */
	getGridRelativePosition(x,y, absolute = false, diffAdjust = true) {
		const rootScale = this.props.settings.gridScale;

		// console.log({rootScale})
		let xPos = x;
		let yPos = y;

		// Offset for grid resize (Doesn't work well with drawing on resize)
		// if (diffAdjust) {
		// 	const {dimensions} = this.props.settings;
		// 	xPos = (x * dimensions.diffX);
		// 	yPos = (y * dimensions.diffY);
		// }

		// Defaults to snap to grid
		let position = {
			x: Math.round(rootScale * Math.round(xPos / rootScale)),
			y: Math.round(rootScale * Math.round(yPos / rootScale))
		};

		// If we don't want round to the grid settings
		if (absolute) {
			position = {
				x: rootScale * xPos / rootScale,
				y: rootScale * yPos / rootScale
			}
		}

		return position;
	}

	/**
	 * Gets the grid height and width sized 4x the grid size
	 */
	getDimensions() {
		return {
			height: this.props.height * 4,
			width: this.props.width * 4,
		}
	}

	/**
	 * Gets the current mouse position
	 * @return {Object} returns the adjusted mouse x and y
	 */
	getMousePosition() {
		let dotX = this.mousePos.x;
		let dotY = this.mousePos.y;

		// Account for the canvas offset
		const {offset} = this.props.settings;
		dotX -= offset.x;
		dotY -= offset.y;

		// Account for the canvas's page-relative position
		const bounding = this.getCanvasBounds();
		dotX -= bounding.left;
		dotY -= bounding.top;

		// If snap to line mode is enabled
		if (this.props.settings.snapToGrid) {
			const rel = this.getGridRelativePosition(dotX, dotY, false, false);
			dotX = rel.x;
			dotY = rel.y;
		}

		this.props.storeState({
			mousePos: {
				x: dotX,
				y: dotY,
			}
		});

		return {
			x: dotX,
			y: dotY
		}
	}

	/**
	 * Checks if the current x,y coord already has a pt
	 * @param {number} x x-pos
	 * @param {number} y y-pos
	 * @param {number} buffer buffer to allow for floating pts
	 * @return {Boolean} wether the space already has a point or not
	 */
	pointExists(x, y, buffer = 5) {
		if (this.props.lines.size) {
			for (const [key, set] of this.props.lines) {
				for (const node of set) {
					const distance = Math.sqrt(Math.pow((y-node.a.y),2) + Math.pow((x-node.a.x), 2));
					if (distance < buffer) {
						return true;
					}
				}
			}
		}

		return false;
	}

	/**
	 * Connects pointA.b to pointB.a
	 * @param {number} x x-pos
	 * @param {number} y y-pos
	 * @return {void}
	 */
	connectPoints(pointA, pointB) {
		if (!pointA || !pointB) {
			return;
		}

		if (this.props.isSameNode(pointA, pointB)) {
			return;
		}

		// Update the node value
		const node = this.props.findLine(pointA);
		if (node) {
			// debugger;
			const dist = this.getTotalDistance(this.getPtDistance(pointA.a, pointB.a));
			this.props.updateLine(node, {b: pointB.a, distance: dist});
		} else {
			console.log({notFo: node});
		}
	}


	/**
	 * Places a pt at the given xy
	 * @param {number} x x-pos
	 * @param {number} y y-pos
	 * @return {Line} newPointnew line
	 */
	placePt(x, y) {
		const hit = this.detectLineCollision(x, y, null, false);
		let newPoint = {a: {x, y}};

		if (hit) {
			const nodeAtPos = this.props.findLine({a: {x, y}});
			if (nodeAtPos) {
				newPoint = nodeAtPos;
			} else {
				newPoint = this.placePtOnLine(hit, {x, y});
			}
		} else {
			const nodesAtPos = this.props.findLinesAtLocation({a: {x, y}});

			// Create a new node if the node doesn't already exist
			let newNode = null;
			if (nodesAtPos.length) {
				newNode = nodesAtPos[nodesAtPos.length - 1];
			} else {
				newNode = this.props.createPt(x, y);
			}

			newPoint = newNode;
		}

		return newPoint;
	}

	/**
	 * Puts a point on a line and bisects that line
	 * @param {Node} line line to place pt on
	 * @param {Object} pt {x, y} coords
	 * @return {Line} newNode line that was created
	 */
	placePtOnLine(line, {x, y}) {
		const hitNode = this.props.findLine(line);

		if (!(hitNode.line.a.x === x && hitNode.line.a.y === y)) {
			let newNode = this.props.findLine({a: {x, y}});
			if (!newNode) {
				newNode = this.props.createPt(x, y); // Create a new node to stack on top of it
			}

			const hitLineLen = +hitNode.line.distance; // User distance length
			let nodeLen = Math.abs(hitNode.line.b.x - hitNode.line.a.x); // Length of whole line in grid
			nodeLen = nodeLen === 0 ? Math.abs(hitNode.line.b.y - hitNode.line.a.y) : nodeLen;

			// If the node isn't already at the new position
			if (!(newNode.line.a.x === line.b.x && newNode.line.a.y === line.b.y)) {
				let newNodeDist = Math.ceil(Math.abs(line.b.x - newNode.line.a.x));
				if (newNodeDist === 0) {
					newNodeDist = Math.ceil(Math.abs(line.b.y - newNode.line.a.y));
				}
				const distTotal = Math.ceil((hitLineLen * newNodeDist) / nodeLen);

				this.props.updateLine(newNode, {b: line.b, distance: distTotal, grade: line.line.grade});
			}

			// We don't want the new node to point to itself
			let newHitNodeDist = Math.ceil(Math.abs(newNode.line.a.x - hitNode.line.a.x));
			if (newHitNodeDist === 0) {
				newHitNodeDist = Math.ceil(Math.abs(hitNode.line.a.y - newNode.line.a.y));
			}
			const distTotal = Math.ceil((hitLineLen * newHitNodeDist) / nodeLen);

			this.props.updateLine(hitNode, {b: {x, y}, distance: distTotal});

			return newNode;
		} else {
			const newNode = this.props.createPt(x, y);
			return newNode;
		}
	}

	/**
	 * Draws the grid
	 * @return {void}
	 */
	drawGrid() {
		let {gridColor, settings} = this.props;
		const {width, height} = this.getDimensions();

		// Set the grid color
		this._ctx.fillStyle = gridColor;

		const midX = -width / 2;
		const midY = -height / 2;

		const {offset} = settings;

		let hGrid = settings.gridScale;
		while (hGrid <= width) {
			const startX = offset.x + hGrid;
			const startY = offset.y + midY;
			this._ctx.fillRect(startX, startY, 1, height);
			hGrid += settings.gridScale;
		}

		let vGrid = settings.gridScale;
		while (vGrid <= height) {
			const startX = offset.x + midX;
			const startY = offset.y + vGrid;
			this._ctx.fillRect(startX, startY, width, 1);
			vGrid += settings.gridScale;
		}
	}

	/**
	 * Draws the fence posts along a line
	 * @param {Node} node line data
	 */
	drawPosts(node) {
		// total distance of the panel (in ft)
		const pxlDist = this.getPtDistance(node.a, node.b);
		const totalDistance = this.getTotalDistance(pxlDist);
		const tickHeight = 4;
		const isHorizontal = Math.abs(node.b.y - node.a.y) === 0;
		const isVertical = Math.abs(node.b.x - node.a.x) === 0;

		// total number of fence posts
		const totalPostCount = Math.ceil(totalDistance / node.panelLength);
		for (let i=1; i < totalPostCount; i++) {
			// Spacer step
			const space = i * (pxlDist / totalPostCount);

			this._ctx.beginPath();
			this._ctx.lineWidth = 8;
			this._ctx.strokeStyle = (node.a.isDragging || node.b.isDragging) ? colors.drag : colors.fencePost;

			const {offset} = this.props.settings;
			const rp =  this.getGridRelativePosition(node.a.x + offset.x, node.a.y + offset.y);
			if (isHorizontal) {

				// Check if line is going left to right
				const flip = (node.b.x > node.a.x) ? 1 : -1;

				this._ctx.moveTo(rp.x + (space * flip), rp.y - tickHeight);
				this._ctx.lineTo(rp.x + (space * flip), rp.y + tickHeight);
			} else if (isVertical) {
				const flip = (node.b.y > node.a.y) ? 1 : -1;

				this._ctx.moveTo(rp.x - tickHeight, rp.y + (space * flip));
				this._ctx.lineTo(rp.x + tickHeight, rp.y + (space * flip));
			} else {
				// It's an angle
				// Determine horizontal direction
				const flipH = (node.b.x > node.a.x) ? 1 : -1;
				// Determine vertical direction
				const flipV = (node.b.y > node.a.y) ? 1 : -1;

				const vStepInc = Math.abs((node.b.y  - node.a.y) / totalPostCount) * i;
				const hStepInc = Math.abs((node.b.x  - node.a.x) / totalPostCount) * i;

				this._ctx.moveTo(rp.x + (hStepInc * flipH) , rp.y + (vStepInc * flipV) - tickHeight);
				this._ctx.lineTo(rp.x + (hStepInc * flipH) , rp.y + (vStepInc * flipV) + tickHeight);
			}
			this._ctx.stroke();
			this._ctx.closePath();
		}
	}

	/**
	 * Draws a line between all of the current points
	 * @param {Array[Line]} Array of pt data
	 * @return {void}
	 */
	drawLines() {
		const typeColors = {
			fence: colors.fence,
			gate : colors.gate,
			active: colors.active
		};

		for (const [key, set] of this.props.lines) {
			for (const node of set) {
				// Default line styles
				let ctxStyles = {
					strokeStyle: typeColors[node.type], // Line color
					lineWidth: 1, // Line width
				};

				if (node.b) {
					if (this.state.settings.isDrag) {
						const {lastSelected} = this.props;
						if (lastSelected) {
							if (node.b.isDragging) {
								ctxStyles.strokeStyle = colors.shadow;

								this.drawLine(node.a, lastSelected.a);
							}

							if (node.a.isDragging) {
								ctxStyles.strokeStyle = colors.shadow;

								this.drawLine(node.b, lastSelected.a);
							}
						}
					}

					// If the line is the current line being hovered
					if (this.state.hoveredLine && node.hovered) {
						if (this.props.isSameNode(node, this.state.hoveredLine.line)) {
							ctxStyles.strokeStyle = typeColors['active'];
						}
					}

					if (node.active) {
						ctxStyles.strokeStyle = typeColors['active'];
					}
					// Save the context settings
					this._ctx.save();
					this.drawLine(node.a, node.b, ctxStyles);

					if (node.type === "fence") {
						this.drawPosts(node);

						// Restore the other canvas settings after drawing
						this._ctx.restore();
					}
				}
			}
		}
	}

	/**
	 * Draws a line from one point to another
	 * @param  {Object} From    Start point
	 * @param  {Object} to      End Point
	 * @param  {Object} options Context options
	 * @return {void}
	 */
	drawLine(from, to, options = { strokeStyle: 'black' }) {
		this._ctx.beginPath();

		for (const option of  Object.keys(options)) {
			this._ctx[option] = options[option];
		}

		// The from and to x,y coords adjused with grid offset
		const {offset} = this.props.settings;
		const rf = this.getGridRelativePosition(from.x + offset.x, from.y + offset.y);
		const rt = this.getGridRelativePosition(to.x + offset.x, to.y + offset.y);

		this._ctx.moveTo(rf.x, rf.y);
		this._ctx.lineTo(rt.x, rt.y);
		this._ctx.stroke();
		this._ctx.closePath();
	}

	/**
	 * Checks wether 2 lines intersect each other
	 * @param {number} line1StartX
	 * @param {number} line1StartY
	 * @param {number} line1EndX
	 * @param {number} line1EndY
	 * @param {number} line2StartX
	 * @param {number} line2StartY
	 * @param {number} line2EndX
	 * @param {number} line2EndY
	 * @return {object} pt intersection data
	 */
	checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
		const rs = this.getGridRelativePosition(line1StartX, line1StartY);
		const re = this.getGridRelativePosition(line1EndX, line1EndY);
		const rs2 = this.getGridRelativePosition(line2StartX, line2StartY);
		const re2 = this.getGridRelativePosition(line2EndX, line2EndY);

		// if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
		let denominator, a, b, numerator1, numerator2, result = {
			x: null,
			y: null,
			onLine1: false,
			onLine2: false
		};

		denominator = ((re2.y - rs2.y) * (re.x - rs.x)) - ((re2.x - rs2.x) * (re.y - rs.y));
		if (denominator === 0) {
			return result;
		}
		a = rs.y - rs2.y;
		b = rs.x - rs2.x;
		numerator1 = ((re2.x - rs2.x) * a) - ((re2.y - rs2.y) * b);
		numerator2 = ((re.x - rs.x) * a) - ((re.y - rs.y) * b);
		a = numerator1 / denominator;
		b = numerator2 / denominator;

		// if we cast these lines infinitely in both directions, they intersect here:
		const relResult = this.getGridRelativePosition(rs.x + (a * (re.x - rs.x)), rs.y + (a * (re.y - rs.y)));
		result.x = relResult.x;
		result.y = relResult.y;

		// if line1 is a segment and line2 is infinite, they intersect if:
		if (a >= 0 && a <= 1) {
			result.onLine1 = true;
		}

		// if line2 is a segment and line1 is infinite, they intersect if:
		if (b >= 0 && b <= 1) {
			result.onLine2 = true;
		}

		// if line1 and line2 are segments, they intersect if both of the above are true
		return result;
	};

	/**
	 * Detects if the mouse cursor is close to a line proximity wise (NOT WORKING)
	 * @param {number} x xpos
	 * @param {number} y ypos
	 * @param {number} buffer give
	 */
	detectNearLine(x, y, buffer = 20) {
		const coneHeight = buffer;

		for (const [key, set] of this.props.lines) {
			for (const line of set) {
				if (line.b) {
					const pt1 = line.a;
					const pt2 = line.b;
					let pt3 = null;
					let pt4 = null;

					const angle = this.getAngle(pt1, pt2, true);

					const isVertical = angle === 90;
					const isHorizontal = angle === 180 || angle === 0;

					const {x: midX, y: midY} = this.getMidPoint(pt1, pt2);

					if (isVertical) {
						pt3 = {
							x: midX - coneHeight,
							y: midY
						}

						pt4 = {
							x: midX + coneHeight,
							y: midY
						}
					} else if (isHorizontal) {
						pt3 = {
							x: midX,
							y: midY - coneHeight
						}

						pt4 = {
							x: midX,
							y: midY + coneHeight
						}
					} else {
						pt3 = {
							x: midX + coneHeight * Math.cos(angle),
							y: midY + coneHeight * Math.sin(angle),
						}

						pt4 = {
							x: midX - coneHeight * Math.cos(angle),
							y: midY - coneHeight * Math.sin(angle),
						}
					}

					// console.log({line, pt3, pt4})

					// check pt3
					const AB = (y - pt1.y) * (pt2.x - pt1.x) - (x - pt1.x) * (pt2.y - pt1.y);
					const BC = (y - pt2.y) * (pt3.x - pt2.x) - (x - pt2.x) * (pt3.y - pt2.y);
					const CA = (y - pt3.y) * (pt1.x - pt3.x) - (x - pt3.x) * (pt1.y - pt3.y);

					// Check pt4
					const BC2 = (y - pt2.y) * (pt4.x - pt2.x) - (x - pt2.x) * (pt4.y - pt2.y);
					const CA2 = (y - pt4.y) * (pt1.x - pt4.x) - (x - pt4.x) * (pt1.y - pt4.y);

					if (this._debug) {
						// console.log({
						// 	a: pt1,
						// 	b: pt2,
						// 	c: pt3,
						// 	d: pt4,
						// 	x,
						// 	y,
						// 	line
						// });
						this.drawCones({
							a: pt1,
							b: pt2,
							c: pt3,
							d: pt4,
							x,
							y,
							line
						});
					}

					if (
						((x !== pt1.x && y !== pt1.y) || (x !== pt2.x && y !== pt2.y)) // If not hovering over the pts
						&&
						((AB * BC > 0 && BC*CA > 0) || (AB * BC2 > 0 && BC2*CA2 > 0))
					) {

						return {
							a: pt1,
							b: pt2,
							c: pt3,
							d: pt4,
							x,
							y,
							line
						};
					}
				}
			}
		}

		return false;
	}


	/**
	 * Detects if an object has hit a line
	 * @param  {number} posX object's x pos
	 * @param  {number} posY object's y pos
	 * @param  {number} buffer how much +- 'give' to equal value
	 * @param  {Boolean} ptCheck check if pt exists at local?
	 * @return boolean
	 */
	detectLineCollision(posX, posY, buffer = 1) {
		for (const [key, set] of this.props.lines) {
			for (const line of set) {
				if (line.b) {
					const hit = this.isBetween(line.a, line.b, {x: posX, y: posY}, this.props.dotSize + buffer);
					if (hit) {
						return {
							a: line.a,
							b: line.b,
							line: line
						};
					}
				}
			}
		}

		return false;
	}

	/**
	 * Checks wether a point lies between two lines
	 * See: https://stackoverflow.com/questions/31346862/test-if-a-point-is-approximately-on-a-line-segment-formed-by-two-other-points
	 * @param {Point} a
	 * @param {Point} b
	 * @param {Point} c
	 * @param {number} tolerance tolerance check for float pt
	 */
	isBetween(a, b, c, tolerance) {

		//test if the point c is inside a pre-defined distance (tolerance) from the line
		const distance = Math.abs((c.y - b.y)*a.x - (c.x - b.x)*a.y + c.x*b.y - c.y*b.x) / Math.sqrt((c.y-b.y)**2 + (c.x-b.x)**2);
		if (distance > tolerance) { return false; }

		//test if the point c is between a and b
		const dotproduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y)*(b.y - a.y);
		if (dotproduct < 0) { return false; }

		const squaredlengthba = (b.x - a.x)**2 + (b.y - a.y)**2;
		if (dotproduct > squaredlengthba) { return false; }

		return true;
	};

	/**
	 * Draws any intersections where two lines meet
	 */
	drawIntersections() {
		if (!this.props.intersections.length) {
			return;
		}

		const {intersections} = this.props;
		for (let i=0; i < intersections.length; i++) {
			const line = intersections[i];
			const pt = {x: line.x, y: line.y};
			const ptExistsAtSpot = this.pointExists(pt.x, pt.y);

			if (this.props.lastSelected) {
				// If there is already something there, put a new pt on top and point to that
				if (!ptExistsAtSpot) {
					const node = this.props.findLine(line);
					const newNode = this.placePt(pt.x, pt.y);
					if (node) {
						this.props.updateLine(newNode, {b: node.line.b});
						this.props.updateLine(node, {b: pt});
					}
				}
			}
		}
	}

	/**
	 * Connects all of the intersection dots
	 * @param {Line} finalPt final point to be connected to list
	 */
	connectIntersections(start, intersections, finalPt = null) {
		if (intersections.length) {
			let last = start;
			let max = intersections.reduce((acc, next) => {
				return {
					x: next.x > acc.x ? next.x : acc.x,
					y: next.y > acc.y ? next.y : acc.y
				}
			}, {x:0, y:0});

			// If the set is larger than the last number x wise
			let xSort = (max.x > last.a.x) ? 1 : -1; // 1 = asc
			let ySort = (max.y > last.a.y) ? 1 : -1;// 1 = asc

			// Sort x
			intersections.sort((a,b) => {
				if (a.x > b.x) return xSort;
				if (a.x < b.x) return xSort * -1;
				return 0;
			});
			// Sort y
			intersections.sort((a,b) => {
				if (a.y > b.y) return ySort;
				if (a.y < b.y) return ySort * -1;
				return 0;
			});

			// For each intersection
			for (const pt of intersections) {
				let newNode = this.props.findLine({a: pt});
				if (!newNode) {
					newNode = this.props.createPt(pt.x, pt.y);
				}

				// Connect the last selected line
				this.connectPoints(last, newNode.line);
				last = newNode.line;
			}
			if (finalPt) {
				this.connectPoints(last, finalPt);
			}
		}
	}

	/**
	 * Draw all of the points
	 * @return {void}
	 */
	drawPoints() {
		const {lines, lastSelected, lastDragPos} = this.props;
		const {settings} = this.state;

		if (!lines.entries()) {
			return;
		}

		const intersectionsSet = new Map();
		const allIntersections = [];
		const {x, y} = this.getMousePosition();

		for (const [key, set] of lines) {
			for (const point of set) {
				const pointProps = {
					fillStyle: point.a.isDragging ? point.b ? colors.hit : colors.shadow : colors.primary,
				}

				// If the point has a node
				if (point.b) {
					const bProps = {
						fillStyle: colors.primary
					}

					// Draw labels
					if (this.props.settings.drawLabels) {
						this.drawPointLabel(point);
					}

					const handleIntersects = (intersects) => {
						// Find all intersections and store for rendering
						if (intersects.onLine1 && intersects.onLine2) {
							this.drawPoint(intersects.x, intersects.y);
							const key = `${intersects.x}-${intersects.y}`;
							if (!intersectionsSet.has(key)) {
								intersectionsSet.set(key, true);
								allIntersections.push({
									...intersects,
									...point,
								});
							}
						}
					}

					// If there was a last selected and we are drawing
					if (lastSelected && (settings.isDrawing || settings.isDrag)) {
						let b = lastDragPos ? lastDragPos.a : {x, y};

						// If the pt is dragging
						if (settings.isDrag) {
							const {refQueue, ptQueue} = this.state;
							if (point.b.isDragging) {
								bProps.fillStyle = colors.shadow;
							}

							for (const node of [...refQueue, ...ptQueue]) {
								if (!node.line.b) {
									continue;
								}

								let ptA = node.line.a;
								if (ptA.x === b.x && ptA.y === b.y) {
									ptA = node.line.b;
								}

								if (point.a.isDragging || point.b.isDragging) {
									continue;
								}

								const intersects = this.checkLineIntersection(ptA.x, ptA.y, x, y, point.a.x, point.a.y, point.b.x, point.b.y);
								handleIntersects(intersects);
							}
						} else {
							const intersects = this.checkLineIntersection(lastSelected.a.x, lastSelected.a.y, b.x, b.y, point.a.x, point.a.y, point.b.x, point.b.y);
							handleIntersects(intersects);
						}

					}

					this.drawPoint(point.b.x, point.b.y, point.size, bProps);
				}

				this.drawPoint(point.a.x, point.a.y, point.size, pointProps);
			}
		}

		this.props.storeState({
			intersections: allIntersections
		});
	}

	/**
	 * Draws a dot
	 * @param  {number} x x-position
	 * @param  {number} y y-position
	 * @param  {number} r dot size
	 * @param  {Object} options context opts
	 * @return {void}
	 */
	drawPoint(x, y, r = this.props.dotSize, options = { fillStyle: colors.cursor, absolute: false, diffAdjust: true }) {
		this._ctx.beginPath();

		for (const option of Object.keys(options)) {
			this._ctx[option] = options[option];
		}

		const rp = this.getGridRelativePosition(x + this.props.settings.offset.x, y + this.props.settings.offset.y, options['absolute'], options['diffAdjust']);
		this._ctx.arc(rp.x, rp.y, r, 0, 2 * Math.PI, false);
		this._ctx.fill();
	}

	/**
	 * Given a point, draws the length label
	 * @param {object} pt point being referenced
	 */
	drawPointLabel(pt) {
		let {x: midX, y:midY} = this.getMidPoint(pt.a, pt.b ,false);

		let ptOpts = {};
		if (pt.a.isDragging || (pt.b && pt.b.isDragging)) {
			ptOpts = {
				fillStyle: colors.shadow,
				...ptOpts,
			}
		}

		const offset = {
			// If the line is vertical, move label 5 to right
			x: midX === 0 ? 5 : -5,
			// If the line is horizontal, move label -7.5 up
			y: midY === 0 ? -7.5 : 5,
		}

		midX = midX + offset.x + pt.a.x;
		midY = midY + offset.y + pt.a.y;

		this.drawText(`${pt.distance  || 0} ${ pt.grade === 'Flat' ? '' : pt.grade}`, midX, midY, true, ptOpts);
	}

	/**
	 * Draws text at a given x,y
	 * @param {string} text text to draw
	 * @param {number} x x-pos
	 * @param {number} y y-posf
	 * @param {object} options ctx options
	 * @return {void}
	 */
	drawText(text, x, y, absolute = false, options = {}) {
		options = {
			fillStyle: colors.text,
			font: '15px Arial',
			...options,
		}

		for (const option of Object.keys(options)) {
			this._ctx[option] = options[option];
		}

		const {offset} = this.props.settings;
		const rp = this.getGridRelativePosition(x + offset.x, y + offset.y, absolute);

		this._ctx.fillText(text, rp.x, rp.y);
	}

	/**
	 * Draws a dot on the mouses last know position
	 * @return {void}
	 */
	drawMousePosition() {
		const {x, y} = this.getMousePosition();
		const taken = this.pointExists(x, y, 1);

		// Default cursor style
		this._canvas.current.style.cursor = 'crosshair';

		const hit = this.detectLineCollision(x, y, 5);
		let color = hit ? colors.hit : colors.cursor;

		if (this._debug) {
			const lineCones = this.detectNearLine(x, y);
			// console.log({lineCones})
			if (lineCones) {
				this.drawCones(lineCones);
			}
		}

		// If dragging
		if (this.state.settings.isDrag) {
			this._canvas.current.style.cursor = 'grabbing';
		}
		// If panning
		else if (this.props.settings.isPan) {
			this._canvas.current.style.cursor = 'grab';
			return;
		}
		// If hovering over line
		else if (this.state.hoveredLine && !taken && !this.state.settings.isDrawing) {
			// If the line is the same as the hovered line, show slicing tool
			// console.log({hit, hl: this.state.hoveredLine, activeLine: this.props.activeLine});
			if (
				hit
				&&
				this.props.activeLine
				&&
				this.props.isSameNode(this.props.activeLine, hit)
			) {
				this._canvas.current.style.cursor = `url(${SliceTool})`;
			} else {
				this._canvas.current.style.cursor = 'pointer';
				// Don't draw the dot
				return;
			}

		}
		else {
			color = !taken ? color : colors.secondary;

			this._canvas.current.style.cursor = !taken ? 'crosshair' : 'grab';
		}

		this.drawPoint(x, y, 5, {fillStyle: color, diffAdjust: false});
	}

	// DEV ONLY
	drawCones(cones) {
		this.drawLine(cones.a, cones.c);
		this.drawLine(cones.a, cones.d);
		this.drawLine(cones.b, cones.c);
		this.drawLine(cones.b, cones.d);

		this.drawPoint(cones.c.x, cones.c.y, 5, {fillStyle: 'orange'});
		this.drawPoint(cones.d.x, cones.d.y, 5, {fillStyle: 'pink'});
	}

	/**
	 * Draw crosshairs for referencing
	 */
	drawCrosshair() {
		if (!this.props.settings.crosshairs) {
			return;
		}

		if (this.state.settings.isDrag || this.state.settings.isDrawing) {
			const {x, y} = this.getMousePosition();
			let {height, width} = this.getDimensions();
			const {offset} = this.props.settings;

			const vFrom = {x, y: -offset.y};
			const vTo = {x, y: height + offset.y};

			const hFrom = {x: -offset.x, y};
			const hTo = {x: width + offset.x, y};

			const lineProps =  {
				strokeStyle: 'rgba(255, 0, 0, 0.5)',
				lineWidth: 2
			};

			this._ctx.save();
			this._ctx.setLineDash([20, 10]);
			this.drawLine(vFrom, vTo, lineProps);
			this.drawLine(hFrom, hTo, lineProps);
			this._ctx.restore();
		}
	}

	/**
	 * Draw a line to the mouse pointer
	 * @return {void}
	 */
	drawLineToMouse() {
		if (!this.props.lastSelected || !this.state.settings.isDrawing) {
			return;
		}

		const {lastSelected} = this.props;
		const mousePos = this.getMousePosition();
		// Total pixel distance
		const pixDist = this.getPtDistance(lastSelected.a, mousePos);
		// The total distance
		const dist = this.getTotalDistance(pixDist);

		let {x: midX, y: midY} = this.getMidPoint(lastSelected.a, mousePos);

		const offset = {
			x: midX === 0 ? 5 : -5,
			y: midY === 0 ? 7.5 : -5,
		}

		midX = midX + offset.x;
		midY = midY + offset.y;

		this.drawText(dist, midX, midY);
		this.drawLine(lastSelected.a, mousePos);
	}

	/**
	 * Updates the measurer object
	 * @param {Object} update
	 * @return {void}
	 */
	updateMeasurer(update) {
		if (!update) {
			this.props.storeState({
				measurer: null
			});

			return;
		}

		this.props.storeState({
			measurer: {
				...this.props.measurer,
				...update
			}
		})
	}


	render() {
		return (
			<GridCanvasContainer className="gecko-fence-builder__canvas">
				<canvas ref={this._canvas} width={this.props.width} height={this.props.height} />
			</GridCanvasContainer>
		);
	}
}

GridCanvas.defaultProps = {
	// Height of the grid
	height: 400,
	// Width of the grid
	width: 600,
	// Grid scale size
	gridScale: 25,
	// Grid line color
	gridColor: '#DDD',
	// Dot size
	dotSize: 5,
	// Canvas settings
	settings: {
		// Should the cursor dot snap to grid?
		snapToGrid: true,
		// Should distance labels be visible
		drawLabels: true,
	}
}
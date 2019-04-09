import ReactDom from 'react-dom';
import FenceBuilder from './block.jsx';
document.addEventListener("DOMContentLoaded", (event) => {
	const elements = document.getElementsByTagName('fencebuilder');

	[...elements].forEach(element => {
		const attributes = JSON.parse(element.getAttribute('data-props'));
		ReactDom.render(<FenceBuilder {...attributes} />, element);
	});
});
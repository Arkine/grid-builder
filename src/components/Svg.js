import React from "react";

const getViewBox = name => {
  switch (name) {
	case "flat":
		return "0 0 51 20";
	case "medium":
	  return "0 0 51 20";
	case "steep":
	  return "0 0 51 20";
	default: null
  }
};

const getPath = (name, props) => {
  switch (name) {
	case "flat":
		return (
			<g id="flat" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" {...props}>
				<path d="M24.8125,-5.80952381 L24.8125,41.8095238" id="Line-Copy-16" stroke="#333333" stroke-width="2" fill-rule="nonzero" transform="translate(25.000000, 18.000000) rotate(-270.000000) translate(-25.000000, -18.000000) " {...props}></path>
			</g>
		);
	case "medium":
		return (
			<g id="medium" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
				<path d="M27.5,-3.30952381 L27.5,39.5" id="Line-Copy-13" stroke="#999999" stroke-width="2" stroke-dasharray="0,4" fill-rule="nonzero" transform="translate(27.500000, 18.000000) rotate(-270.000000) translate(-27.500000, -18.000000) " {...props}></path>
				<path d="M21.5,-10.5 L30.3125,37.3095238" id="Line-Copy-14" stroke="#333333" stroke-width="2" fill-rule="nonzero" transform="translate(25.500000, 13.000000) rotate(-270.000000) translate(-25.500000, -13.000000) " {...props}></path>
			</g>
		);
	case "steep":
		return (
			<g id="steep" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
				<path d="M28,-2.80952381 L28,40" id="Line-Copy-11" stroke="#999999" stroke-width="2" stroke-dasharray="0,4" fill-rule="nonzero" transform="translate(28.000000, 18.500000) rotate(-270.000000) translate(-28.000000, -18.500000) " {...props}></path>
				<path d="M17.1875,-13.8095238 L33.8125,33.8095238" id="Line-Copy-12" stroke="#333333" stroke-width="2" fill-rule="nonzero" transform="translate(25.500000, 10.000000) rotate(-270.000000) translate(-25.500000, -10.000000) " {...props}></path>
			</g>
		);
	default: null
  }
};

const SVGIcon = ({
	name = "",
	style = {},
	fill = "#000",
	stroke = "#000",
	viewBox = "",
	width = "100%",
	className = "",
	height = "100%"
}) => (
	<svg
		width={width}
		style={style}
		height={height}
		className={className}
		xmlns="http://www.w3.org/2000/svg"
		viewBox={viewBox || getViewBox(name)}
		xmlnsXlink="http://www.w3.org/1999/xlink"
	>
		{getPath(name, { fill, stroke })}
	</svg>
);

export default SVGIcon;

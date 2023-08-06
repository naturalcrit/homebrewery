import * as React from "react"
const SvgComponent = (props) => (
  <svg
	xmlns="http://www.w3.org/2000/svg"
	xmlSpace="preserve"
	style={{
	  fillRule: "evenodd",
	  clipRule: "evenodd",
	  strokeLinecap: "round",
	  strokeLinejoin: "round",
	  strokeMiterlimit: 1.5,
	}}
	viewBox="0 0 120 1805"
	{...props}
  >
	<defs>
	   <filter id="filter1" x="0" y="0" width="140%" height="120%">
		   <feOffset result="offOut" in="SourceAlpha" dx="-2" dy="0" />
		   <feGaussianBlur result="blurOut" in="offOut" stdDeviation="15" />
		   <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
		</filter>
	</defs>
	<path
		filter="url(#filter1)"
	  d="M1277.27 330.539V550.38c0 6.062-4.922 10.984-10.984 10.984h1.559c-18.229 0-58.825.586-58.825 33.563l-.084-1.486v1541.39h-10.149V330.541h78.483Z"
	  transform="translate(-1198.63 -330.389)"
	/>
  </svg>
)
export default SvgComponent

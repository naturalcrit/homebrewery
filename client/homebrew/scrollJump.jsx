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
    viewBox="0 0 76 76"
    {...props}
  >
    <path
      d="M.125.125H75.58V75.58H.125z"
      style={{
        fill: "#d4d4d4",
        stroke: "#8c8c8c",
        strokeWidth: 1,
      }}
    />
    <circle
      cx={56.418}
      cy={37.852}
      r={7.848}
      style={{
        fill: "#262626",
      }}
    />
    <circle
      cx={25.745}
      cy={37.852}
      r={7.848}
      style={{
        fill: "#262626",
      }}
    />
    <path
      d="M41.774 22.541 25.745 4.339 9.715 22.541c4.706-1.673 10.184-2.632 16.03-2.632 5.845 0 11.323.959 16.029 2.632ZM9.715 53.164l16.03 18.201 16.029-18.201c-4.706 1.672-10.184 2.631-16.029 2.631-5.846 0-11.324-.959-16.03-2.631Z"
      style={{
        fill: "#262626",
      }}
    />
  </svg>
)
export default SvgComponent

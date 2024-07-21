import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center">
      <svg
        id="Layer_2"
        data-name="Layer 2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 74.2 74.2"
        width="50"
        height="50"
      >
        <defs>
          <style>
            {`
              .cls-1 {
                fill: #ca8a04;
                stroke-width: 0px;
              }
              @keyframes rotate {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
              .loader {
                animation: rotate 2s linear infinite;
                transform-origin: center;
              }
            `}
          </style>
        </defs>
        <g id="Layer_2-2" data-name="Layer 2" className="loader">
          <path
            className="cls-1"
            d="M37.1,0C16.6,0,0,16.6,0,37.1s16.6,37.1,37.1,37.1,37.1-16.6,37.1-37.1S57.6,0,37.1,0ZM37.1,10.9c4.3,0,7.8,3.5,7.8,7.8s-3.5,7.8-7.8,7.8-7.8-3.5-7.8-7.8,3.5-7.8,7.8-7.8ZM12.1,31.2c0-4.3,3.5-7.8,7.8-7.8s7.8,3.5,7.8,7.8-3.5,7.8-7.8,7.8-7.8-3.5-7.8-7.8ZM26.4,59.2c-4.3,0-7.8-3.5-7.8-7.8s3.5-7.8,7.8-7.8,7.8,3.5,7.8,7.8-3.5,7.8-7.8,7.8ZM37.1,39.4c-1.4,0-2.6-1.2-2.6-2.6s1.2-2.6,2.6-2.6,2.6,1.2,2.6,2.6c-.1,1.4-1.2,2.6-2.6,2.6ZM47.7,59.2c-4.3,0-7.8-3.5-7.8-7.8s3.5-7.8,7.8-7.8,7.8,3.5,7.8,7.8-3.5,7.8-7.8,7.8ZM54.3,39c-4.3,0-7.8-3.5-7.8-7.8s3.5-7.8,7.8-7.8,7.8,3.5,7.8,7.8-3.5,7.8-7.8,7.8Z"
          />
        </g>
      </svg>
    </div>
  );
};

export default Loader;

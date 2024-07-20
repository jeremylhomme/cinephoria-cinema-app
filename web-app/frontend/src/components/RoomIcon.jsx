import React from "react";

const RoomIcon = ({ selected, onClick }) => (
  <svg
    onClick={onClick}
    viewBox="0 0 24 24"
    className="text-gray-400 group-hover:text-yellow-600 h-6 w-6 shrink-0"
    fill="none"
    strokeWidth="0.9"
    stroke="currentColor"
    aria-hidden="true"
    data-slot="icon"
  >
    <g>
      <path
        class="st0"
        d="M12,3c2.9,0,5.8,0,8.7,0c0.5,0,0.6,0.1,0.6,0.6c0,3.6,0,7.2,0,10.8c0,0.5-0.1,0.6-0.6,0.6
		c-5.8,0-11.6,0-17.5,0c-0.5,0-0.6-0.1-0.6-0.6c0-3.6,0-7.2,0-10.8C2.6,3.1,2.8,3,3.2,3C6.1,3,9.1,3,12,3z M20.5,14.2
		c0-3.5,0-6.9,0-10.3c-5.7,0-11.3,0-17,0c0,3.4,0,6.9,0,10.3C9.1,14.2,14.8,14.2,20.5,14.2z"
      />
      <g>
        <path
          class="st0"
          d="M9.4,19.6c0-0.3,0-0.6,0-0.8c0-0.9,0.5-1.5,1.4-1.6c0.8-0.1,1.6-0.1,2.4,0c0.9,0.1,1.4,0.7,1.4,1.6
			c0,0.6,0,1.2,0,1.9c0,0.1,0,0.3-0.1,0.4c-0.1,0.2-0.2,0.3-0.4,0.2c-0.2,0-0.3-0.2-0.3-0.4c0-0.1,0-0.2,0-0.2c0-0.7,0-1.3,0-2
			c0-0.3-0.1-0.5-0.4-0.6c-0.2-0.1-0.4-0.1-0.6-0.1c-0.5,0-1,0-1.5,0c-0.2,0-0.5,0.1-0.7,0.2c-0.2,0.1-0.3,0.3-0.3,0.5
			c0,0.7,0,1.3,0,2c0,0.1,0,0.1,0,0.2c0,0.3-0.2,0.5-0.4,0.5c-0.2,0-0.4-0.2-0.4-0.5C9.4,20.3,9.4,20,9.4,19.6z"
        />
        <path
          class="st0"
          d="M16.1,19.6c0-0.3,0-0.6,0-0.8c0-0.9,0.5-1.6,1.4-1.6c0.8-0.1,1.5,0,2.3,0c0.3,0,0.6,0.2,0.9,0.4
			c0.4,0.2,0.5,0.6,0.5,1c0,0.7,0,1.4,0,2.1c0,0,0,0.1,0,0.1c0,0.3-0.2,0.5-0.5,0.5c-0.2,0-0.4-0.2-0.4-0.5c0-0.7,0-1.3,0-2
			c0-0.6-0.3-0.8-0.7-0.8c-0.7-0.1-1.4-0.1-2.1,0c-0.5,0-0.7,0.3-0.7,0.8c0,0.6,0,1.2,0,1.9c0,0.1,0,0.1,0,0.2
			c0,0.3-0.2,0.4-0.4,0.4c-0.2,0-0.4-0.2-0.4-0.4C16.1,20.4,16.1,20,16.1,19.6C16.1,19.6,16.1,19.6,16.1,19.6z"
        />
        <path
          class="st0"
          d="M2.7,19.6c0-0.3,0-0.6,0-0.8c0-0.9,0.5-1.5,1.4-1.6c0.8-0.1,1.6-0.1,2.4,0c0.9,0.1,1.4,0.7,1.4,1.6
			c0,0.6,0,1.2,0,1.8c0,0.1,0,0.2,0,0.3c-0.1,0.2-0.3,0.4-0.5,0.4C7.1,21.2,7,21,7,20.7c0-0.7,0-1.3,0-2c0-0.6-0.3-0.8-0.8-0.8
			c-0.7,0-1.3,0-2,0c-0.2,0-0.3,0.1-0.5,0.2c-0.2,0.1-0.3,0.3-0.3,0.5c0,0.7,0,1.4,0,2.1c0,0.1,0,0.2-0.1,0.3
			c-0.1,0.2-0.2,0.2-0.4,0.2c-0.2,0-0.3-0.2-0.3-0.4C2.7,20.4,2.7,20,2.7,19.6C2.7,19.6,2.7,19.6,2.7,19.6z"
        />
      </g>
    </g>
  </svg>
);

export default RoomIcon;
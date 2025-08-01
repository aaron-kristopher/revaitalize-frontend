import React from "react";

export const AuroraStyles = React.memo(() => (
    <style>
        {`
      @keyframes aurora {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      .animate-aurora {
        background-size: 200% 200%;
        animation: aurora 4s ease infinite;
      }
    `}
    </style>
));

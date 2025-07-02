import React from 'react';

import logo from "@/assets/imgs/logo.png"; 
import exerciseIcon from "@/assets/imgs/exercise.png"; 

interface SidebarLogoProps {
  open: boolean;
}

function SidebarLogo({ open }: SidebarLogoProps) {
	return (
		<div className="flex items-center justify-center h-12 my-2">
      
			{open ? (
        <img 
          src={logo} 
          alt="RevItalize" 
          className="h-10 w-auto" 
        />
      ) : (
        <img 
          src={exerciseIcon} 
          alt="RevAItalize-exercise" 
          className="w-8 h-8" 
        />
      )}
		</div>
	);
}

export default SidebarLogo;
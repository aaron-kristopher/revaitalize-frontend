import React, { type ReactNode } from "react";
import { SidebarProvider } from "@/context/SidebarContext"; 

interface AppLayoutProps {
	children: ReactNode;
}

function AppLayout(props: AppLayoutProps) {
	return (
		<SidebarProvider>
			<div className="bg-primary-content grid grid-cols-[auto_1fr]">
				{props.children}
			</div>
		</SidebarProvider>
	);
}

export default AppLayout;
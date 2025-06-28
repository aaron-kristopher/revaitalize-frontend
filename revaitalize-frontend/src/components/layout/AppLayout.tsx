import React, { type ReactNode } from "react"

interface AppLayoutProps {
	children: ReactNode;
}

function AppLayout(props: AppLayoutProps) {
	return (
		<div className="bg-primary-content grid gap-4 p-4 grid-cols-[200px_1fr]">
			{props.children}
		</div>
	)
}

export default AppLayout

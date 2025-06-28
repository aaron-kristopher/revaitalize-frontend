import type { ReactNode } from "react"

interface MainContentLayoutProps {
	children: ReactNode
}

function MainContentLayout(props: MainContentLayoutProps) {
	return (
		<div className="h-full bg-base-200 rounded-lg">
			{props.children}
		</div>
	)
}

export default MainContentLayout

// Remove the props, as the router will handle the children now.
import { Outlet } from 'react-router-dom';

function MainContentLayout() {
	return (
		<div className="h-full bg-base-200 rounded-lg">
			<Outlet />
		</div>
	)
}

export default MainContentLayout;
import Sidebar from "@/shared/components/common/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

function AppLayout() {
	return (
		<div className="grid grid-cols-[auto_1fr] h-screen bg-gray-100 overflow-hidden">
			<Sidebar />
			<main className="h-full bg-base-200 rounded-lg overflow-y-auto">
				<Outlet />
			</main>
		</div>
	);
}

export default AppLayout;

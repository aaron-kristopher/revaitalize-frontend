import AccountToggle from "./AccountToggle"
import RouteSelect from "./RouteSelect"
import SidebarLogo from "./SidebarLogo"




function Sidebar() {
	return (
		<div>
			<div className="overflow-y-scroll sticky top-6 h-[calc(100vh-32px-48px)]">
				<SidebarLogo />
				<RouteSelect />
			</div>
			<AccountToggle />
		</div>
	)
}

export default Sidebar

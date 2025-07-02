import { useLocation } from "react-router-dom"; 
import { useSidebar } from "@/context/SidebarContext";
import AccountToggle from "./AccountToggle";
import RouteSelect from "./RouteSelect";
import SidebarLogo from "./SidebarLogo";

function Sidebar() {
  const { isSidebarOpen } = useSidebar(); 
  const location = useLocation(); 

  const collapsedWidth = '60px';
  const expandedWidth = '240px';

  return (
    <nav
      className="sticky top-0 h-screen flex flex-col shrink-0 text-white p-4 transition-all duration-300 ease-in-out bg-gradient-to-b from-[#023047] to-[#003B6D]"
      style={{
        width: isSidebarOpen ? expandedWidth : collapsedWidth,
      }}
    >
      <SidebarLogo open={isSidebarOpen} />
      
      <div className="flex-1">
          <RouteSelect open={isSidebarOpen} currentLocation={location.pathname} />
      </div>
      
      <AccountToggle open={isSidebarOpen} currentLocation={location.pathname} />
    </nav>
  );
}

export default Sidebar;
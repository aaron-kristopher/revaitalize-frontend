import { NavLink } from 'react-router-dom';
import { Home, User, BarChart } from 'lucide-react'; 
import { type LucideIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NavItem {
  to: string;
  title: string;
  Icon: LucideIcon;
}

const navItems: NavItem[] = [
  { to: '/app', title: 'Dashboard', Icon: Home },
  { to: '/app/profile', title: 'Profile', Icon: User },
  { to: '/app/session', title: 'Session', Icon: BarChart },
];

interface RouteSelectProps {
  open: boolean;
  currentLocation: string;
}

function RouteSelect({ open }: RouteSelectProps) {
  return (
    <div className="space-y-2 mt-6">
      {navItems.map((item) => (
        <Option
          key={item.to}
          to={item.to}
          Icon={item.Icon}
          title={item.title}
          open={open}
        />
      ))}
    </div>
  );
}

interface OptionProps {
  to: string;
  Icon: LucideIcon;
  title: string;
  open: boolean;
}

const Option = ({ to, Icon, title, open }: OptionProps) => {
  return (
    <NavLink to={to} end={to === '/app'}>
      {({ isActive }) => (
        <Button
          variant="ghost"
          className={`relative flex h-11 items-center rounded-md transition-colors duration-200 ${
            open ? 'w-full px-4 justify-start' : 'w-full justify-center px-0'
          } ${
            isActive
              ? "text-white"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          {isActive && (
            <div className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-[#00A6FB]"></div>
          )}
          <Icon className={`h-5 w-5 ${open ? "mr-4" : ""}`} />
          {open && <span className="text-sm font-semibold">{title}</span>}
        </Button>
      )}
    </NavLink>
  );
};

export default RouteSelect;
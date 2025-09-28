import { NavLink } from 'react-router-dom';
import { Home, User, BarChart } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { getUserSessionRequirements, getUserProfile } from '@/shared/api/userService';
import { SCHEDULE_CONFIG } from '@/shared/config/scheduling';

interface NavItem {
  to: string;
  title: string;
  Icon: LucideIcon;
  isDisabled?: boolean;
  tooltipText?: string;
}

interface RouteSelectProps {
  open: boolean;
  currentLocation: string;
}

function RouteSelect({ open }: RouteSelectProps) {
  const { user } = useAuth();
  const [sessionLink, setSessionLink] = useState<string | null>(null);
  const [isTodayAllowed, setIsTodayAllowed] = useState<boolean | null>(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState<boolean>(true);

  // Helper: compute allowed days from profile
  const computeAllowedDays = (profile: any) => {
    const scheduleCount = profile.onboarding_data?.preferred_schedule || 3;
    const defaultConfig = SCHEDULE_CONFIG[scheduleCount as keyof typeof SCHEDULE_CONFIG];
    const custom = profile.onboarding_data?.custom_allowed_days;
    const allowedDays = Array.isArray(custom)
      && custom.length === scheduleCount
      && custom.every((d: number) => d >= 0 && d <= 6)
      ? custom
      : defaultConfig.allowedDays;
    return { allowedDays, defaultConfig } as const;
  };

  // Check if today is allowed for sessions
  const checkTodayAllowed = async () => {
    if (!user) {
      setIsTodayAllowed(false);
      setIsLoadingSchedule(false);
      return;
    }

    try {
      const profile = await getUserProfile(user.id);
      const { allowedDays } = computeAllowedDays(profile);
      const today = new Date().getDay();
      const allowed = allowedDays.includes(today);
      setIsTodayAllowed(allowed);
    } catch (error) {
      console.error("Failed to check schedule:", error);
      setIsTodayAllowed(false);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Check both session requirements and schedule
      Promise.all([
        getUserSessionRequirements(user.id),
        checkTodayAllowed()
      ]).then(([requirements]) => {
        if (requirements && requirements.length > 0) {
          setSessionLink(`/app/session/${requirements[0].id}`);
        } else {
          setSessionLink(null);
        }
      }).catch(err => {
        console.error("Failed to get requirements for sidebar nav:", err);
        setSessionLink(null);
      });
    }
  }, [user]);

  const navItems: NavItem[] = [
    { to: '/app', title: 'Dashboard', Icon: Home },
    { to: '/app/profile', title: 'Profile', Icon: User },
    ...(sessionLink ? [{
      to: sessionLink,
      title: 'Session',
      Icon: BarChart,
      isDisabled: isTodayAllowed === false,
      tooltipText: isTodayAllowed === false
        ? "Today is not your scheduled day. Go to Profile > Schedule to update availability."
        : undefined
    }] : [])
  ];

  return (
    <div className="space-y-2 mt-6">
      {navItems.map((item) => (
        <Option
          key={item.to}
          to={item.to}
          Icon={item.Icon}
          title={item.title}
          open={open}
          isDisabled={item.isDisabled}
          tooltipText={item.tooltipText}
          isLoading={item.title === 'Session' && isLoadingSchedule}
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
  isDisabled?: boolean;
  tooltipText?: string;
  isLoading?: boolean;
}

const Option = ({ to, Icon, title, open, isDisabled = false, tooltipText, isLoading = false }: OptionProps) => {
  const buttonContent = ({ isActive }: { isActive: boolean }) => (
    <Button
      variant="ghost"
      className={`my-1 relative flex h-11 items-center rounded-md transition-colors duration-200 hover:bg-white/5 hover:text-white ${open ? 'w-full px-4 justify-start' : 'w-full justify-center px-0'
        } ${isDisabled
          ? "text-slate-500 cursor-not-allowed opacity-50"
          : isActive
            ? "text-white bg-white/5"
            : "text-slate-300"
        }`}
      disabled={isDisabled || isLoading}
    >
      {isActive && !isDisabled && (
        <div className="absolute left-0 top-2 h-[65%] w-1 rounded-r-full bg-[#0096C7]"></div>
      )}
      <Icon className={`h-5 w-5 ${open ? "mr-4" : ""}`} />
      {open && (
        <span className="text-sm font-semibold">
          {isLoading ? 'Loading...' : title}
        </span>
      )}
    </Button>
  );

  // If there's a tooltip and the button is disabled, wrap with tooltip
  if (tooltipText && isDisabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <NavLink to={to} end={to === '/app'}>
              {({ isActive }) => buttonContent({ isActive })}
            </NavLink>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Normal navigation link
  return (
    <NavLink to={to} end={to === '/app'}>
      {({ isActive }) => buttonContent({ isActive })}
    </NavLink>
  );
};

export default RouteSelect;

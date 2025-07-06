import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AccountToggleProps {
  open: boolean;
  currentLocation: string;
}

function AccountToggle({ open, currentLocation }: AccountToggleProps) {
  const isTestActive = currentLocation === '/app/session';

  // STATE 1: Expanded View
  if (open) {
    return (
      <div className="w-full">
        {!isTestActive && (
          <Card className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-3 mb-4">
            <CardContent className="p-0">
              <p className="text-sm font-medium text-slate-100 mb-2">Ready for a session?</p>
              <p className="text-slate-300 text-xs mb-3">Start your exercise session</p>
              <Link to="/app/session">
                <Button className="w-full text-white text-sm py-2 rounded-lg font-medium shadow-md bg-[#0096C7] hover:bg-[#0077B6] transition-colors">
                  Start Session
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className={`flex items-center p-3 rounded-lg gap-3 bg-black/10`}>
          <div className="w-9 h-9 bg-sky-300/20 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-sky-300 text-sm font-bold">AL</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">Aaron Lim</p>
            <p className="text-slate-300 text-xs truncate">aaron.lim@gmail.com</p>
          </div>
        </div>
      </div>
    );
  }

  // STATE 2: Collapsed View
  return (
    <div className="flex flex-col items-center space-y-2">
      {!isTestActive && (
        <Link to="/app/session">
          <Button variant="ghost" className="relative w-10 h-10 flex items-center justify-center rounded-lg text-slate-300 hover:bg-[#0077B6] hover:text-white">
            <Dumbbell className="w-5 h-5" />
          </Button>
        </Link>
      )}

      <Button variant="ghost" className="w-10 h-10 p-0 flex items-center justify-center rounded-full bg-sky-300/20 hover:bg-[#0077B6] text-sky-200">
        <span className="text-sm font-bold">AL</span>
      </Button>
    </div>
  );
}

export default AccountToggle;

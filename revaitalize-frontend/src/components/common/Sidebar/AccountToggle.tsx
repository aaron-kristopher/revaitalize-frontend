import React, { useState, useEffect } from 'react'; // Add hooks
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { getUserSessionRequirements } from '@/api/userService'; // Import API function

interface AccountToggleProps {
  open: boolean;
  currentLocation: string;
}

function AccountToggle({ open, currentLocation }: AccountToggleProps) {
  const { user } = useAuth(); // Get the logged-in user
  const [firstRequirementId, setFirstRequirementId] = useState<number | null>(null);

  // This effect fetches the user's program to find the first exercise
  useEffect(() => {
    if (user) {
      getUserSessionRequirements(user.id)
        .then(requirements => {
          if (requirements && requirements.length > 0) {
            setFirstRequirementId(requirements[0].id);
          }
        })
        .catch(err => console.error("Failed to get requirements for AccountToggle", err));
    }
  }, [user]);

  // Make the session link dynamic. Default to '#' if no requirement is found.
  const sessionLink = firstRequirementId ? `/app/session/${firstRequirementId}` : '#';
  
  // Make the active check more robust to handle dynamic IDs
  const isSessionPageActive = currentLocation.startsWith('/app/session');

  // --- Expanded View ---
  if (open) {
    return (
      <div className="w-full">
        {!isSessionPageActive && (
          <Card className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-3 mb-4">
            <CardContent className="p-0">
              <p className="text-sm font-medium text-slate-100 mb-2">Ready for a session?</p>
              <p className="text-slate-300 text-xs mb-3">Start your exercise session</p>
              {/* Use the dynamic sessionLink */}
              <Link to={sessionLink}>
                <Button 
                  disabled={!firstRequirementId} // Disable the button if no link exists
                  className="w-full text-white text-sm py-2 rounded-lg font-medium shadow-md bg-[#0096C7] hover:bg-[#0077B6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Session
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className={`flex items-center p-3 rounded-lg gap-3 bg-black/10`}>
          <div className="w-9 h-9 bg-sky-300/20 rounded-md flex items-center justify-center flex-shrink-0">
            {/* Make initials dynamic */}
            <span className="text-sky-300 text-sm font-bold">
              {user ? `${user.first_name[0]}${user.last_name[0]}` : '??'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {/* Make name and email dynamic */}
            <p className="text-white text-sm font-semibold truncate">
              {user ? `${user.first_name} ${user.last_name}` : 'Loading...'}
            </p>
            <p className="text-slate-300 text-xs truncate">
              {user ? user.email : '...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Collapsed View ---
  return (
    <div className="flex flex-col items-center space-y-2">
      {!isSessionPageActive && (
        // Use the dynamic sessionLink
        <Link to={sessionLink}>
          <Button 
            disabled={!firstRequirementId} // Disable the button if no link exists
            variant="ghost" 
            className="relative w-10 h-10 flex items-center justify-center rounded-lg text-slate-300 hover:bg-[#0077B6] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Dumbbell className="w-5 h-5" />
          </Button>
        </Link>
      )}

      <Button variant="ghost" className="w-10 h-10 p-0 flex items-center justify-center rounded-full bg-sky-300/20 hover:bg-[#0077B6] text-sky-200">
        {/* Make initials dynamic */}
        <span className="text-sm font-bold">
          {user ? `${user.first_name[0]}${user.last_name[0]}` : '??'}
        </span>
      </Button>
    </div>
  );
}

export default AccountToggle;
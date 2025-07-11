import { useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CalibrationDirection } from "@/hooks/usePositionCalibration";
import { usePositionCalibration } from "@/hooks/usePositionCalibration";
import { CameraIcon, CheckCircleIcon, X, AlertCircleIcon, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from "@/lib/utils";

interface UserPositionSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReady: () => void;
}

const DirectionIndicator = ({ direction }: { direction: CalibrationDirection }) => {
  if (!direction) return null;
  const ArrowComponent = {
    left: ArrowLeft,
    right: ArrowRight,
    up: ArrowUp,
    down: ArrowDown,
    forward: ArrowUp,
    back: ArrowDown,
  }[direction];

  return <ArrowComponent size={48} className="text-yellow-400" />;
};


export function UserPositionSetupDialog({ isOpen, onClose, onReady }: UserPositionSetupDialogProps) {
  const dialogWebcamRef = useRef<Webcam | null>(null);

  // The hook is only active when the dialog is open
  const { isPositioned, calibrationStatus, countdown, direction } = usePositionCalibration(dialogWebcamRef, isOpen);

  // This effect is now solely responsible for firing onReady when the countdown finishes.
  useEffect(() => {
    if (countdown === 0) {
      // A small delay can prevent a jarring transition
      setTimeout(() => {
        onReady();
      }, 500);
    }
  }, [countdown, onReady]);

  const feedbackType = isPositioned ? "success" : "warning";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="h-3/4 min-w-[85%] p-0 gap-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-4 border-b flex flex-row justify-between items-center">
          <DialogTitle className="text-xl font-semibold">Let's Get Setup First!</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-full">

          {/* Video Feed with Overlays */}
          <div className="md:w-1/2 bg-slate-900 relative min-h-[320px] flex items-center justify-center">
            <Webcam
              ref={dialogWebcamRef}
              className="w-full h-full object-cover"
              mirrored={true}
              videoConstraints={{ facingMode: 'user' }}
            />

            <div className="absolute inset-0 pointer-events-none">
              {/* Silhouette guide */}
              {!isPositioned && (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="border-2 border-dashed border-white/50 rounded-lg h-5/6 w-7/12" />
                </div>
              )}

              {/* Directional indicator */}
              {direction && !isPositioned && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/40 rounded-full p-4 md:p-6 animate-pulse">
                    <DirectionIndicator direction={direction} />
                  </div>
                </div>
              )}

              {/* Status Badge at the top */}
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                {isPositioned && (
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full text-base font-medium animate-pulse flex items-center shadow-lg">
                    <CheckCircleIcon size={18} className="mr-2" />
                    <span>Good Position</span>
                  </div>
                )}
              </div>
            </div>
          </div>


          <div className="p-6 md:w-1/2 flex flex-col bg-white">
            <p className="text-slate-700 mb-4">
              To get started, position yourself correctly. The session will begin automatically
              {isPositioned ? ` in ${countdown} seconds` : ''} after you're aligned.
            </p>
            <ul className="space-y-2 mb-6 text-slate-600">
              <li className="flex items-start"><span className="mr-2 mt-1 text-blue-500">•</span><span>Stand far enough that your upper body is visible.</span></li>
              <li className="flex items-start"><span className="mr-2 mt-1 text-blue-500">•</span><span>Make sure the area is well-lit.</span></li>
              <li className="flex items-start"><span className="mr-2 mt-1 text-blue-500">•</span><span>Center yourself in the frame.</span></li>
            </ul>

            <div className="mt-auto space-y-4">
              <div className={cn(
                "p-4 rounded-lg border-2 flex items-center",
                feedbackType === 'success' && 'bg-green-50 border-green-300',
                feedbackType === 'warning' && 'bg-yellow-50 border-yellow-300',
              )}>
                {isPositioned ?
                  <CheckCircleIcon className="mr-3 text-green-500 h-6 w-6 flex-shrink-0" /> :
                  <AlertCircleIcon className="mr-3 text-yellow-500 h-6 w-6 flex-shrink-0" />
                }
                <p className={cn(
                  "font-medium text-lg",
                  feedbackType === 'success' && 'text-green-700',
                  feedbackType === 'warning' && 'text-yellow-700',
                )}>
                  {calibrationStatus}
                </p>
              </div>

              {isPositioned && countdown !== null && countdown > 0 && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-bold text-2xl animate-ping-once">
                    {countdown}
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Starting session...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserPositionSetupDialog;

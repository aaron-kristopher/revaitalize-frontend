import { useEffect, useRef } from "react"
import Webcam from "react-webcam";

import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePositionCalibration } from "@/hooks/usePositionCalibration";
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface UserPositionSetupDialogProps {
  isOpen: boolean;
  onClose(): () => void;
  onReady(): () => void;
}

function UserPositionSetupDialog({ isOpen, onClose, onReady }: UserPositionSetupDialogProps) {
  const dialogWebcamRef = useRef<Webcam | null>(null);

  const { isPositioned, calibrationStatus, countdown } = usePositionCalibration(dialogWebcamRef, isOpen);

  useEffect(() => {
    if (countdown === 0) {
      setTimeout(() => {
        onReady();
      }, 500);
    }
  }, [countdown, onReady]);

  const feedbackType = isPositioned ? "success" : "warning";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="h-3/4 min-w-3/4 p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b flex flex-row justify-between items-center">
          <DialogTitle className="text-xl font-semibold">Let's Get Setup First!</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col md:flex-row">
          {/* Left Column: Instructions */}
          <div className="p-6 md:w-1/2 flex flex-col">
            <p className="text-slate-700 mb-4">
              To get started, position yourself correctly in front of the camera. The session will begin automatically after the countdown.
            </p>
            <ul className="space-y-2 mb-6 text-slate-600">
              <li className="flex items-start"><span className="mr-2 mt-1 text-blue-500">•</span><span>Stand far enough that your upper body is visible.</span></li>
              <li className="flex items-start"><span className="mr-2 mt-1 text-blue-500">•</span><span>Make sure the area is well-lit.</span></li>
              <li className="flex items-start"><span className="mr-2 mt-1 text-blue-500">•</span><span>Center yourself in the frame.</span></li>
            </ul>

            <div className="mt-auto">
              <div className={cn(
                "p-4 rounded-lg border",
                feedbackType === 'success' && 'bg-green-50 border-green-200',
                feedbackType === 'warning' && 'bg-yellow-50 border-yellow-200',
              )}>
                <div className="flex items-center">
                  {isPositioned ?
                    <CheckCircle2 className="mr-2 text-green-500" size={20} /> :
                    <AlertTriangle className="mr-2 text-yellow-500" size={20} />
                  }
                  <p className={cn(
                    "text-2xl font-medium",
                    feedbackType === 'success' && 'text-green-700',
                    feedbackType === 'warning' && 'text-yellow-700',
                  )}>
                    {calibrationStatus}
                  </p>
                </div>
              </div>

              {isPositioned && countdown !== null && countdown > 0 && (
                <div className="text-center mt-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-xl animate-ping-once">
                    {countdown}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Video Feed */}
          <div className="md:w-1/2 bg-slate-900 relative min-h-[320px]">
            <Webcam
              ref={dialogWebcamRef}
              className="w-full h-full object-cover"
              mirrored={true}
              videoConstraints={{ facingMode: 'user' }}
            />
            {isPositioned && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                Good Position
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserPositionSetupDialog

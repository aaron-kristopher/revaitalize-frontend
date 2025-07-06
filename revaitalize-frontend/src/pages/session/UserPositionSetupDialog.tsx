import { useEffect, useRef } from "react"
import Webcam from "react-webcam";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Separator } from "@radix-ui/react-separator";
import { usePositionCalibration } from "@/hooks/usePositionCalibration";

function UserPositionSetupDialog() {
  const dialogWebcamRef = useRef<Webcam | null>(null);

  const { isNotInPosition, calibrationStatus } = usePositionCalibration(dialogWebcamRef);

  return (
    <>
      <Dialog open={isNotInPosition}>
        <DialogContent showCloseButton={false} className="min-w-4/5  h-[90%]">
          <DialogHeader>
            <DialogTitle className="pb-4 text-lg lg:text-xl">Let's Get Setup First!</DialogTitle>
            <Separator className="h-[1px] bg-slate-300" />
            <div className="h-full w-full grid grid-cols-2 justify-between py-6">
              <div className="grid gap h-full">
                <DialogDescription className="text-lg lg:text-xl">
                  To get started, position yourself at the correct distance and angle from the camera.
                  Make sure your entire body is visible. The session will begin automatically 5 seconds
                  after you're properly aligned.
                </DialogDescription>

                <DialogDescription className="font-semibold text-red-500 text-lg lg:text-xl">
                  {calibrationStatus}
                </DialogDescription>
              </div>

              {/* Webcam with 6:19 aspect ratio */}
              <div className="relative w-full">
                <div className="aspect-[5/4] w-full rounded-xl lg:rounded-2xl overflow-hidden shadow-md bg-black">
                  <Webcam
                    ref={dialogWebcamRef}
                    className="w-full h-full object-cover"
                    mirrored={true}
                    videoConstraints={{ facingMode: 'user' }}
                  />
                </div>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>

  )
}

export default UserPositionSetupDialog

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";
import { type Session } from "@/api/userService"


export const SessionDetailDailog = (session: Session) => {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild className="hover:cursor-pointer">
          <Button variant="outline">
            <Eye className="w-4 h-4 text-slate-400" />
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4/5">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {session}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog"
import { TermsAndCondition } from "@/features/auth/components/TermsAndCondition"

export default function TermsDialog() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <span
                className="font-medium text-sky-300 hover:text-white hover:underline cursor-pointer"
                onClick={() => setOpen(true)}
            >
                Terms & Conditions
            </span>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Terms & Conditions</DialogTitle>
                    </DialogHeader>
                    <div className="prose prose-sm dark:prose-invert">
                        <TermsAndCondition />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { type Session } from '@/shared/api/userService'

interface SessionDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  session: Session | null
  exerciseName: string
  'data-id'?: string
}
const StatusIndicator = ({
  errorFlag,
  score,
}: {
  errorFlag: string | null | undefined
  score: number | null | undefined
}) => {
  console.log(errorFlag);
  if (errorFlag === "No Error") {
    return (
      <div className="flex items-center text-green-500">
        <CheckCircle2 className="w-4 h-4 mr-1" />
        <span className="text-sm">Good</span>
      </div>
    )
  }
  else if (errorFlag && errorFlag !== 'pending') {
    return (
      <div className="flex items-center text-destructive">
        <XCircle className="w-4 h-4 mr-1" />
        <span className="text-sm">{errorFlag}</span>
      </div>
    )
  }
  if (score && score < 70) {
    return (
      <div className="flex items-center text-yellow-500">
        <AlertTriangle className="w-4 h-4 mr-1" />
        <span className="text-sm">Warning</span>
      </div>
    )
  }
}
export const SessionDetailDialog: React.FC<SessionDetailDialogProps> = ({
  isOpen,
  onClose,
  session,
  exerciseName,
  'data-id': dataId,
}) => {
  if (!session) {
    return null
  }
  const score = session.session_quality_score || 0
  const sessionDate = new Date(session.datetime_start!).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
  const duration =
    new Date(session.datetime_end!).getTime() -
    new Date(session.datetime_start).getTime()
  const minutes = Math.floor(duration / (1000 * 60))
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-3/4" data-id={dataId}>
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            {exerciseName}
            <StatusIndicator errorFlag={session.error_flag} score={score} />
          </DialogTitle>
          <DialogDescription>
            Session Details from {sessionDate}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <p className="text-lg font-semibold">{score.toFixed(1)}%</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-lg font-semibold">{minutes} mins</p>
            </div>
            <div className="bg-muted p-3 rounded-lg col-span-2 md:col-span-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold">
                {session.is_completed ? 'Completed' : 'In Progress'}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Sets Information</h4>
            {session.exercise_sets && session.exercise_sets.length > 0 ? (
              <div className="space-y-4">
                {session.exercise_sets.map((set) => (
                  <div key={set.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold">Set {set.set_number}</h5>
                      <StatusIndicator
                        errorFlag={set.error_flag}
                        score={set.set_quality_score}
                      />
                    </div>
                    {set.repetitions.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        {set.repetitions.map((rep) => (
                          <div key={rep.id} className="bg-muted/50 p-2 rounded">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                Rep {rep.rep_number}
                              </span>
                              <span className="text-sm font-medium">
                                {rep.rep_quality_score?.toFixed(1) || 'N/A'}%
                              </span>
                            </div>
                            {rep.error_flag && (
                              <p className={`text-xs mt-1 ${rep.error_flag === "No Error" ? "text-green-500" : "text-destructive"}`} >
                                {rep.error_flag}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No repetitions recorded
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No sets were recorded for this session.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog >
  )
}

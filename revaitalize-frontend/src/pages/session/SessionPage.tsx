import PoseDetection from "./PoseDetection"

function SessionPage() {
  return (
    <div className="text-center pt-4">
      <h1 className="text-2xl font-bold">Workout Session in Progress</h1>
      <p className="text-md">Follow the instructions and maintain the pose.</p>
      <PoseDetection />
    </div>
  )
}

export default SessionPage

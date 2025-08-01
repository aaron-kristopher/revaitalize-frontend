import React from "react";
import { Clock, Target, Users } from "lucide-react";
import flankImg from '@/assets/imgs/fs-sitting.png';
import hidingImg from '@/assets/imgs/hf-sitting.png';
import torsoImg from '@/assets/imgs/tr-sitting.png';
import flankVid from '@/assets/videos/fs-sitting.mp4';
import hidingVid from '@/assets/videos/hf-sitting.mp4';
import torsoVid from '@/assets/videos/tr-sitting.mp4';

type Exercise = {
  id: string;
  title: string;
  image: string;
  video: string;
  duration: string;
  description: string;
};

const ExercisesOverview: React.FC = () => {
  const exercises: Exercise[] = [
    {
      id: 'flank-stretch',
      title: "Flank Stretch",
      image: flankImg,
      video: flankVid,
      duration: "5-10 mins",
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
    },
    {
      id: 'hiding-face',
      title: "Hiding Face",
      image: hidingImg,
      video: hidingVid,
      duration: "5-10 mins",
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
    },
    {
      id: 'torso-rotation',
      title: "Torso Rotation",
      image: torsoImg,
      video: torsoVid,
      duration: "5-10 mins",
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#002356] to-[#004DBC] text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight md:text-6xl mb-6">
              Exercises
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-blue-100 md:text-2xl mb-8">
            Explore our curated set of exercises, specifically selected for their proven benefits in low back pain rehabilitation. Each movement is designed to be safe, effective, and perfectly suited for analysis by our AI.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <span>Targeted Workouts</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Flexible Duration</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Exercise Options</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EXERCISE IMAGES */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          {exercises.map((exercise, index) => (
            <div
              key={index}
              className="group relative transform overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="aspect-w-4 aspect-h-5 bg-gradient-to-br from-gray-200 to-gray-300">
                <img
                  src={exercise.image}
                  alt={exercise.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {exercise.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-white/80">
                      <Clock className="h-3 w-3" />
                      {exercise.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* HOW TO PERFORM SECTION */}
        <div className="mb-16">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
              How to Perform the Exercises
            </h2>
            <div className="mx-auto h-1 w-24 bg-gradient-to-r from-[#002356] to-[#004DBC]"></div>
          </div>

          <div className="space-y-12">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="overflow-hidden rounded-3xl bg-white shadow-xl transition-shadow duration-300 hover:shadow-2xl"
              >
                <div className="flex flex-col xl:flex-row">
                  <div className="flex-1 p-8 lg:p-12">
                    <div className="mb-6 flex flex-wrap items-center gap-4">
                      <h3 className="text-3xl font-bold text-gray-800 lg:text-4xl">
                        {exercise.title}
                      </h3>
                    </div>

                    <div className="mb-6 flex items-center gap-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">{exercise.duration}</span>
                      </div>
                    </div>

                    <p className="mb-8 text-lg leading-relaxed text-gray-600">
                      {exercise.description}
                    </p>
                  </div>

                  {/* VIDEO */}
                  <div className="flex flex-shrink-0 items-center justify-center bg-gray-50 p-8 lg:p-12 xl:w-[28rem]">
                    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
                      <video
                        key={exercise.id}
                        className="h-full w-full object-cover"
                        controls
                      >
                        <source src={exercise.video} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-[#002356] to-[#004DBC] p-12 text-center text-white">
          <h3 className="mb-4 text-3xl font-bold">
            Ready to Start Your Journey?
          </h3>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Lorem Ipsum is simply dummy tesxt of the printing and typesetting industry.
          </p>
          <button className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-blue-600 transition-colors duration-200 hover:bg-gray-100">
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExercisesOverview;
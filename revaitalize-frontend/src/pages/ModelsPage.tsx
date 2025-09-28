import React from "react";
import lstm from "@/assets/imgs/lstm.png"
import blazepose from "@/assets/imgs/blazepose.png"
import { Brain, Zap, TrendingUp, ExternalLink, type LucideProps } from "lucide-react";

type Model = {
  id: string;
  title: string;
  icon: React.ComponentType<LucideProps>;
  image: string;
  description: string;
  source: string;
  category: string;
};

const ModelsPage: React.FC = () => {
  const models: Model[] = [
    {
      id: "lstm",
      title: "What is Long Short Term Memory?",
      icon: Brain,
      image: lstm,
      description: "Long Short-Term Memory (LSTM) is a deep learning model that works well with sequential data, such as body movement patterns. It was developed to address the problem of traditional recurrent neural networks forgetting important information over long sequences. LSTMs are effective because they can recognize both short-term and long-term dependencies in data. In rehabilitation studies, this ability is useful since human body movements are not isolated but occur as continuous sequences. When combined with pose estimation models like BlazePose, LSTMs can analyze movement frames over time rather than just single snapshots. This helps in detecting whether an exercise is performed correctly and consistently throughout its duration. LSTMs recognize temporal dynamics, which is essential for tracking rehabilitation exercises. Overall, they enhance pose detection systems by allowing accurate assessment of motion quality and progress in physical therapy.",
      source: "https://medium.com/@ottaviocalzone/an-intuitive-explanation-of-lstm-a035eb6ab42c",
      category: "Neural Networks"
    },
    {
      id: "blazepose",
      title: "What is Blazepose?",
      icon: Zap,
      image: blazepose,
      description: "BlazePose is a machine learning framework developed by Google for high-accuracy human pose estimation. It detects skeletal keypoints of the human body, such as the head, shoulders, elbows, hips, knees, and ankles. Unlike simple pose detection models, BlazePose can estimate more than 30 body landmarks, giving a detailed skeletal representation. It is designed for real-time performance, making it suitable for applications that require live motion tracking. The model uses both the body and the region of interest to refine its predictions, resulting in precise keypoint localization. In rehabilitation contexts, BlazePose can track a patient’s posture and joint movements during exercises. This allows for objective analysis of whether movements are performed correctly or need adjustment. Overall, BlazePose provides a reliable foundation for systems that require skeletal keypoint detection and motion evaluation.",
      source: "https://ar5iv.labs.arxiv.org/html/2006.10204",
      category: "Computer Vision"
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
              Models
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-indigo-100 md:text-2xl mb-8">
            Discover the powerful artificial intelligence that powers RevAItalize. Our platform is built on models that work together to understand human movement and provide you with expert-level guidance.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <span>Deep Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>Real-time Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span>High Performance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODELS */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {models.map((model, index) => (
            <div
              id={model.id}
              key={index}
              className="overflow-hidden rounded-3xl bg-white shadow-xl transition-shadow duration-300 hover:shadow-2xl">
              {/* Content Section */}
              <div className="p-8 lg:p-12">
                <div className="mb-6 flex items-center gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-[#002356] to-[#004DBC] p-4 text-white">
                    <model.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="mb-2 text-3xl font-bold text-gray-800 lg:text-4xl">
                      {model.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600">
                        {model.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-16 mb-8 text-lg leading-relaxed text-gray-600">
                  {model.description}
                </p>
              </div>

              {/* Image Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 pt-0 lg:p-12">
                <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg">
                  <img
                    src={model.image}
                    alt={model.title}
                    className="mx-auto h-auto w-full max-h-[500px] object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-gray-700">
                      Image Source:
                    </p>
                    <p className="break-all text-sm text-gray-500">
                      {model.source}
                    </p>
                  </div>
                  <a
                    href={model.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 flex flex-shrink-0 items-center gap-2 rounded-lg bg-[#004DBC] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#002356]">
                    <ExternalLink className="h-4 w-4" />
                      Visit
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-3xl bg-gradient-to-r from-[#002356] to-[#004DBC] p-12 text-center text-white">
          <h3 className="mb-4 text-3xl font-bold">
            Interested in the Technical Details?
          </h3>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-indigo-100">
            Dive deeper into our research paper and implementation to understand how these models work.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-[#002356] transition-colors duration-200 hover:bg-gray-100">
              View Documentation
            </button>
            <button className="rounded-xl border-2 border-white text-white px-8 py-4 text-lg font-bold transition-colors duration-200 hover:bg-white hover:text-indigo-600">
              Download Research Paper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelsPage;
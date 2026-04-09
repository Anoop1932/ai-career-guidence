import React from 'react';
import { Target, BookOpen, Map, CheckCircle2 } from 'lucide-react';

const SummaryCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="w-full mt-6 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-blue-100/50">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Your Career Recommendation
        </h2>
        <p className="text-slate-500 mt-2">Based on your unique profile</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100">
        <div className="flex items-center space-x-3 mb-2">
          <Target className="text-blue-600" size={24} />
          <h3 className="text-xl font-bold text-slate-800">{data.recommended_career || 'Not determined'}</h3>
        </div>
      </div>

      <div className="space-y-6">
        {data.what && (
            <div>
              <h4 className="flex items-center text-lg font-semibold text-slate-800 mb-3">
                <CheckCircle2 className="text-green-500 mr-2" size={20} />
                Why this fits you
              </h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-4">{data.what}</p>
            </div>
        )}

        {data.skills && data.skills.length > 0 && (
          <div>
            <h4 className="flex items-center text-lg font-semibold text-slate-800 mb-3">
              <BookOpen className="text-indigo-500 mr-2" size={20} />
              Skills to Learn
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.roadmap && data.roadmap.length > 0 && (
          <div>
            <h4 className="flex items-center text-lg font-semibold text-slate-800 mb-3">
              <Map className="text-orange-500 mr-2" size={20} />
              Your Roadmap
            </h4>
            <div className="space-y-3">
              {data.roadmap.map((step, idx) => (
                <div key={idx} className="flex sequence items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex-1">
                    <p className="text-slate-700">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;

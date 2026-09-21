import React from 'react';
import { DEMO_SCENARIOS } from '../data';
import { DemoScenario } from '../types';
import { Play, Tag, MapPin, BadgeIndianRupee, Users, ArrowRight, ShieldCheck } from 'lucide-react';

interface ScenariosProps {
  onSelectScenario: (scenario: DemoScenario) => void;
  activeScenarioId?: string;
}

export default function Scenarios({ onSelectScenario, activeScenarioId }: ScenariosProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight">Interactive Demonstration Scenarios</h2>
        <p className="text-xs text-slate-500 mt-1">
          Select any of the 12 pre-configured business scenarios below to see how SolveX dynamically alters compliance roadmaps, document lists, and SPCB risk categories in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_SCENARIOS.map((sc) => {
          const isActive = activeScenarioId === sc.id;
          
          return (
            <div 
              key={sc.id} 
              className={`p-5 rounded-lg border transition-all flex flex-col justify-between h-[300px] bg-white ${
                isActive 
                  ? 'border-blue-600 ring-1 ring-blue-600 shadow-sm' 
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-800 uppercase bg-blue-50 px-2 py-0.5 rounded">
                    {sc.id}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-0.5" /> {sc.location.state}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{sc.name.split(': ')[1] || sc.name}</h3>
                  <p className="text-[11px] text-slate-500 font-sans mt-1 line-clamp-3">{sc.description}</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {sc.activities.map((act) => (
                    <span key={act} className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {act}
                    </span>
                  ))}
                  {sc.specificActivities.slice(0, 2).map((sp) => (
                    <span key={sp} className="text-[9px] font-semibold text-blue-700 bg-blue-50/50 px-1.5 py-0.5 rounded">
                      {sp.length > 22 ? `${sp.substring(0, 20)}...` : sp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-4">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-3">
                  <span className="flex items-center">
                    <BadgeIndianRupee className="h-3.5 w-3.5 mr-0.5 text-slate-400" /> ₹{sc.projectSize.investment} Lakhs
                  </span>
                  <span className="flex items-center">
                    <Users className="h-3.5 w-3.5 mr-0.5 text-slate-400" /> {sc.projectSize.employees} Workers
                  </span>
                  <span className="flex items-center font-semibold text-slate-700">
                    {sc.projectSize.power} HP
                  </span>
                </div>

                <button
                  onClick={() => onSelectScenario(sc)}
                  className={`w-full py-2 px-3 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center transition ${
                    isActive 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Play className="h-3 w-3 mr-1.5 fill-current" /> Load Scenario Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

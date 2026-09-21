import React, { useState } from 'react';
import { 
  Sector, 
  ActivityType, 
  BusinessProfile,
  LocationInfo,
  ProjectSizeInfo
} from '../types';
import { SECTORS_INFO, STATES_AND_DISTRICTS, LAND_STATUS_OPTIONS } from '../data';
import { HelpCircle, ChevronRight, ChevronLeft, ArrowRight, ClipboardList, Info, FileText, CheckCircle } from 'lucide-react';

interface WizardProps {
  onComplete: (profile: BusinessProfile) => void;
  initialProfile?: BusinessProfile;
}

export default function Wizard({ onComplete, initialProfile }: WizardProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedSector, setSelectedSector] = useState<Sector | ''>(initialProfile?.sector || '');
  const [activities, setActivities] = useState<ActivityType[]>(initialProfile?.activities || []);
  const [specificActivities, setSpecificActivities] = useState<string[]>(initialProfile?.specificActivities || []);
  const [description, setDescription] = useState<string>(initialProfile?.description || '');

  // Location State
  const [location, setLocation] = useState<LocationInfo>(
    initialProfile?.location || {
      state: 'Maharashtra',
      district: 'Pune',
      city: '',
      industrialArea: '',
      landStatus: 'Owned'
    }
  );

  // Project Size State
  const [projectSize, setProjectSize] = useState<ProjectSizeInfo>(
    initialProfile?.projectSize || {
      investment: 10,
      capacity: '',
      power: 5,
      employees: 3,
      area: 800,
      water: 0.5
    }
  );

  // Conditional state based on answers
  const [answers, setAnswers] = useState<Record<string, any>>(initialProfile?.answers || {});

  // Fetch districts based on selected state
  const stateDistricts = STATES_AND_DISTRICTS.find(s => s.state === location.state)?.districts || [];

  const handleSectorSelect = (sec: Sector) => {
    setSelectedSector(sec);
    // Reset specific activities and answers when changing sector
    setSpecificActivities([]);
    setAnswers({});
    setActivities([]);
    setDescription('');
  };

  const toggleActivity = (act: ActivityType) => {
    if (activities.includes(act)) {
      setActivities(activities.filter(a => a !== act));
    } else {
      setActivities([...activities, act]);
    }
  };

  const toggleSpecificActivity = (actName: string) => {
    if (specificActivities.includes(actName)) {
      setSpecificActivities(specificActivities.filter(a => a !== actName));
    } else {
      setSpecificActivities([...specificActivities, actName]);
    }
  };

  const handleNext = () => {
    if (step === 1 && !selectedSector) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      sector: selectedSector,
      activities,
      specificActivities,
      description,
      location,
      projectSize,
      answers
    });
  };

  // Check if current setup qualifies for certain questions
  const showFurnitureMfgQuestions = selectedSector === 'FURNITURE' && 
    (activities.includes('Manufacturing') || activities.includes('Processing'));

  const showTextilesMfgQuestions = selectedSector === 'TEXTILES' && 
    (activities.includes('Manufacturing') || activities.includes('Processing'));

  const showEVQuestions = selectedSector === 'AUTOMOTIVE' && 
    (activities.includes('Assembly') || activities.includes('Manufacturing') || activities.includes('Repair / Service'));

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm max-w-4xl mx-auto overflow-hidden">
      {/* Stepper Header */}
      <div className="bg-[#0b1b3d] text-white px-8 py-5 flex items-center justify-between border-b border-blue-900">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-300 font-medium font-sans">Step {step} of 5</span>
          <h2 className="text-xl font-semibold tracking-tight mt-0.5">
            {step === 1 && 'Select Business Sector'}
            {step === 2 && 'Define Business Activities'}
            {step === 3 && 'Activity & Process Specifics'}
            {step === 4 && 'Location & Premises'}
            {step === 5 && 'Project Scale & Utility Grid'}
          </h2>
        </div>
        <div className="hidden md:flex items-center space-x-3 text-xs text-blue-200">
          <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-blue-400' : 'bg-blue-950'}`} />
          <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-blue-400' : 'bg-blue-950'}`} />
          <div className={`h-2 w-12 rounded-full ${step >= 3 ? 'bg-blue-400' : 'bg-blue-950'}`} />
          <div className={`h-2 w-12 rounded-full ${step >= 4 ? 'bg-blue-400' : 'bg-blue-950'}`} />
          <div className={`h-2 w-12 rounded-full ${step >= 5 ? 'bg-blue-400' : 'bg-blue-950'}`} />
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
        
        {/* STEP 1: SELECT SECTOR */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-md flex items-start space-x-3 text-sm text-slate-700">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-slate-800">Welcome to SolveX Compliance Wizard.</strong> Choose your primary business sector below to begin mapping your regulatory journey. SolveX automatically filters out non-applicable registrations and maps document timelines specifically for Indian micro and small businesses.
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Choose Your Business Sector:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(SECTORS_INFO).map((sec) => {
                const isSelected = selectedSector === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleSectorSelect(sec.id)}
                    className={`p-6 text-left border rounded-lg transition-all duration-200 flex flex-col justify-between h-48 ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50/20 ring-1 ring-blue-600 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs uppercase px-2 py-0.5 rounded font-medium ${
                          isSelected ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Sector
                        </span>
                        {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                      </div>
                      <h4 className="font-semibold text-slate-900 text-base mb-1">{sec.name}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{sec.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 mt-2 flex items-center">
                      Select Sector <ChevronRight className="h-3 w-3 ml-0.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: BUSINESS ACTIVITY TYPE SELECTION & NATURAL LANGUAGE INPUT */}
        {step === 2 && selectedSector && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-semibold text-slate-800 uppercase tracking-wide mb-1">
                What does your business actually do?
              </label>
              <p className="text-xs text-slate-500 mb-3">Select all commercial operations that apply to your business structure.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.keys(SECTORS_INFO[selectedSector].categories).map((categoryName) => {
                  // Map category list to standard activity types
                  let actType: ActivityType = 'Manufacturing';
                  if (categoryName.includes('Processing')) actType = 'Processing';
                  else if (categoryName.includes('Assembly')) actType = 'Assembly';
                  else if (categoryName.includes('Trading')) actType = 'Trading';
                  else if (categoryName.includes('Retail')) actType = 'Retail / Sale';
                  else if (categoryName.includes('Repair')) actType = 'Repair / Service';
                  else if (categoryName.includes('Storage')) actType = 'Storage / Warehouse';
                  
                  const isChecked = activities.includes(actType);
                  return (
                    <button
                      key={categoryName}
                      type="button"
                      onClick={() => toggleActivity(actType)}
                      className={`p-3 text-left border rounded text-xs font-medium transition-all flex items-center justify-between ${
                        isChecked 
                          ? 'border-blue-600 bg-blue-50/30 text-blue-900 font-semibold' 
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{categoryName}</span>
                      <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                        isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {isChecked && <div className="h-1 w-1 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
                {/* Additional Standard Types for Compliance */}
                {['Wholesale', 'Storage / Warehouse', 'Distribution', 'Import / Export'].map((type) => {
                  const actType = type as ActivityType;
                  const isChecked = activities.includes(actType);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleActivity(actType)}
                      className={`p-3 text-left border rounded text-xs font-medium transition-all flex items-center justify-between ${
                        isChecked 
                          ? 'border-blue-600 bg-blue-50/30 text-blue-900 font-semibold' 
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{type}</span>
                      <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                        isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {isChecked && <div className="h-1 w-1 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exact Activities List based on Sector */}
            <div className="border-t border-slate-100 pt-5">
              <label className="block text-sm font-semibold text-slate-800 uppercase tracking-wide mb-1">
                What exactly will you manufacture, process, sell or service?
              </label>
              <p className="text-xs text-slate-500 mb-3">Select the specific workflow items you will run in your facility.</p>
              
              <div className="space-y-4 max-h-60 overflow-y-auto border border-slate-200 rounded p-4 bg-slate-50/50">
                {Object.entries(SECTORS_INFO[selectedSector].categories).map(([cat, items]) => {
                  return (
                    <div key={cat} className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-600 uppercase border-b border-slate-200/60 pb-1">{cat}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {items.map((item) => {
                          const isChecked = specificActivities.includes(item);
                          return (
                            <label
                              key={item}
                              className={`flex items-start space-x-2 text-xs p-2 rounded border transition-all cursor-pointer ${
                                isChecked 
                                  ? 'bg-white border-blue-500 text-blue-950 font-medium' 
                                  : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-100/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSpecificActivity(item)}
                                className="mt-0.5 accent-blue-600"
                              />
                              <span>{item}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Natural language input */}
            <div className="border-t border-slate-100 pt-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-800 uppercase tracking-wide">
                  Or, describe your business in your own words
                </label>
                <span className="text-xs text-slate-400 font-sans italic">SolverX AI interprets this automatically</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: I buy raw cotton rolls, dye them with synthetic direct dyes, cut the fabric, and stitch them into Readymade Garments for retail showrooms."
                className="w-full h-24 p-3 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
              />
            </div>
          </div>
        )}

        {/* STEP 3: CONDITIONAL PROCESS QUESTIONS */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 bg-yellow-50/40 border border-yellow-100 rounded-md flex items-start space-x-3 text-xs text-amber-900 leading-relaxed">
              <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Dynamic Filter Engine Active:</strong> These questions are generated dynamically based on your selected activities. Answering accurately ensures we can isolate whether pollution consents or labor registrations are legally mandatory.
              </div>
            </div>

            {/* A. Furniture Manufacturing Specifics */}
            {showFurnitureMfgQuestions && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 border-b pb-1">Wood & Chemical Process Diagnostics</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">What primary raw material will you use?</label>
                    <select 
                      value={answers.woodMaterial || 'Solid wood'}
                      onChange={(e) => setAnswers({ ...answers, woodMaterial: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded text-xs bg-white text-slate-800"
                    >
                      <option value="Solid wood">Solid Wood (Teak, Sheesham, Pine)</option>
                      <option value="Plywood">Commercial Plywood & Laminates</option>
                      <option value="MDF">MDF / High Density Fiberboard</option>
                      <option value="Particle board">Particle Board / Compressed Scrap</option>
                      <option value="Mixed">Mixed / All types</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Will you perform heavy wood cutting / log sawing?</label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <input 
                          type="radio" 
                          checked={answers.woodCutting === true} 
                          onChange={() => setAnswers({ ...answers, woodCutting: true })}
                        />
                        <span>Yes (Uses circular/bandsaws)</span>
                      </label>
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <input 
                          type="radio" 
                          checked={answers.woodCutting === false} 
                          onChange={() => setAnswers({ ...answers, woodCutting: false })}
                        />
                        <span>No (Only assemble/pre-cut)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Will you perform surface polishing / spray painting / varnishing?</label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <input 
                          type="radio" 
                          checked={answers.paintPolishVarnish === true} 
                          onChange={() => setAnswers({ ...answers, paintPolishVarnish: true })}
                        />
                        <span>Yes (Generates spray fumes/VOCs)</span>
                      </label>
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <input 
                          type="radio" 
                          checked={answers.paintPolishVarnish === false} 
                          onChange={() => setAnswers({ ...answers, paintPolishVarnish: false })}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Will synthetic adhesives / formaldehydes be used in lamination?</label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <input 
                          type="radio" 
                          checked={answers.adhesivesUsed === true} 
                          onChange={() => setAnswers({ ...answers, adhesivesUsed: true })}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <input 
                          type="radio" 
                          checked={answers.adhesivesUsed === false} 
                          onChange={() => setAnswers({ ...answers, adhesivesUsed: false })}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* B. Textiles Dyeing / Wet-processing Specifics */}
            {showTextilesMfgQuestions && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 border-b pb-1">Textile Wet Process & Boiler Safety Diagnostics</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">What fabrics are being handled?</label>
                    <select 
                      value={answers.textileMaterial || 'Cotton'}
                      onChange={(e) => setAnswers({ ...answers, textileMaterial: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded text-xs bg-white text-slate-800"
                    >
                      <option value="Cotton">Pure Cotton / Jute (Natural Fibres)</option>
                      <option value="Polyester">Polyester / Nylon (Synthetic Fibres)</option>
                      <option value="Mixed">Mixed / Blends</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Will you perform textile Dyeing, Bleaching or Fabric Washing?</label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <input 
                          type="radio" 
                          checked={answers.useDyesBleach === true} 
                          onChange={() => setAnswers({ ...answers, useDyesBleach: true })}
                        />
                        <span>Yes (Wet dye process)</span>
                      </label>
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <input 
                          type="radio" 
                          checked={answers.useDyesBleach === false} 
                          onChange={() => setAnswers({ ...answers, useDyesBleach: false })}
                        />
                        <span>No (Dry stitching only)</span>
                      </label>
                    </div>
                  </div>

                  {answers.useDyesBleach === true && (
                    <>
                      <div className="md:col-span-2 p-3 bg-red-50/50 border border-red-100 rounded space-y-3">
                        <span className="text-xs font-semibold text-red-900 uppercase">Effluent & Water Treatment Diagnostics (SPCB Compliance)</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-semibold text-slate-600 mb-1">Dyes / Chemicals list</label>
                            <input 
                              type="text" 
                              value={answers.dyeChemicalsType || ''} 
                              onChange={(e) => setAnswers({ ...answers, dyeChemicalsType: e.target.value })}
                              placeholder="e.g. Reactive Dyes, Soda Ash, Acetic Acid"
                              className="w-full p-2 border border-slate-200 rounded text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-semibold text-slate-600 mb-1">Is industrial wastewater generated?</label>
                            <div className="flex space-x-3 mt-1.5">
                              <label className="flex items-center space-x-1 text-xs">
                                <input type="radio" checked={answers.generateWastewater === true} onChange={() => setAnswers({ ...answers, generateWastewater: true })} />
                                <span>Yes</span>
                              </label>
                              <label className="flex items-center space-x-1 text-xs">
                                <input type="radio" checked={answers.generateWastewater === false} onChange={() => setAnswers({ ...answers, generateWastewater: false })} />
                                <span>No</span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-semibold text-slate-600 mb-1">Do you have an Effluent Treatment Plant (ETP)?</label>
                            <div className="flex space-x-3 mt-1.5">
                              <label className="flex items-center space-x-1 text-xs">
                                <input type="radio" checked={answers.treatmentFacility === true} onChange={() => setAnswers({ ...answers, treatmentFacility: true })} />
                                <span>Yes (In-house)</span>
                              </label>
                              <label className="flex items-center space-x-1 text-xs">
                                <input type="radio" checked={answers.treatmentFacility === false} onChange={() => setAnswers({ ...answers, treatmentFacility: false })} />
                                <span>No (Rely on Common CETP)</span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-semibold text-slate-600 mb-1">Where is wastewater treatment done?</label>
                            <select 
                              value={answers.processInhouse || 'In-house'}
                              onChange={(e) => setAnswers({ ...answers, processInhouse: e.target.value })}
                              className="w-full p-2 border border-slate-200 rounded text-xs bg-white"
                            >
                              <option value="In-house">In-house Facility Only</option>
                              <option value="Outsourced">Outsourced / Common CETP Terminal</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Will you operate a fuel-fired Steam Boiler?</label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <input 
                          type="radio" 
                          checked={answers.hasBoiler === true} 
                          onChange={() => setAnswers({ ...answers, hasBoiler: true })}
                        />
                        <span>Yes (Steam-driven chambers)</span>
                      </label>
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <input 
                          type="radio" 
                          checked={answers.hasBoiler === false} 
                          onChange={() => setAnswers({ ...answers, hasBoiler: false })}
                        />
                        <span>No (Electric heating only)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* C. Automobiles & EV / Battery Specifics */}
            {showEVQuestions && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 border-b pb-1">Automobile & EV Battery Assembly Safety Diagnostics</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">What exact operation is performed for EV Batteries?</label>
                    <select 
                      value={answers.batteryOperation || 'None'}
                      onChange={(e) => setAnswers({ ...answers, batteryOperation: e.target.value, batteryPackAssembly: e.target.value === 'assembly' })}
                      className="w-full p-2 border border-slate-200 rounded text-xs bg-white text-slate-800"
                    >
                      <option value="None">Not Battery Related</option>
                      <option value="cell_mfg">Cell Chemical Manufacturing (Heavy Industrial)</option>
                      <option value="assembly">Lithium Battery Pack Assembly (No Chemical process)</option>
                      <option value="storage">Battery Storage Warehousing</option>
                      <option value="servicing">Battery Diagnostics & Repair / Servicing</option>
                      <option value="trading">Battery Retail / Trading</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Will the workspace generate electrical soldering/wave fumes?</label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <input 
                          type="radio" 
                          checked={answers.waveSoldering === true} 
                          onChange={() => setAnswers({ ...answers, waveSoldering: true })}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <input 
                          type="radio" 
                          checked={answers.waveSoldering === false} 
                          onChange={() => setAnswers({ ...answers, waveSoldering: false })}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  {activities.includes('Repair / Service') && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Is this a specialized EV Service Centre?</label>
                        <div className="flex space-x-4 mt-2">
                          <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                            <input 
                              type="radio" 
                              checked={answers.isBatteryServicing === true} 
                              onChange={() => setAnswers({ ...answers, isBatteryServicing: true })}
                            />
                            <span>Yes (With Li-ion diagnostic deck)</span>
                          </label>
                          <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                            <input 
                              type="radio" 
                              checked={answers.isBatteryServicing === false} 
                              onChange={() => setAnswers({ ...answers, isBatteryServicing: false })}
                            />
                            <span>No (Only standard mechanic work)</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Will the washbay generate greasy/oily wastewater?</label>
                        <div className="flex space-x-4 mt-2">
                          <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                            <input 
                              type="radio" 
                              checked={answers.dischargesWastewater === true} 
                              onChange={() => setAnswers({ ...answers, dischargesWastewater: true, hasOilGritSeparator: true })}
                            />
                            <span>Yes (Requires Oil Separator traps)</span>
                          </label>
                          <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                            <input 
                              type="radio" 
                              checked={answers.dischargesWastewater === false} 
                              onChange={() => setAnswers({ ...answers, dischargesWastewater: false, hasOilGritSeparator: false })}
                            />
                            <span>No (Dry servicing only)</span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Standard retail questions */}
            {activities.includes('Retail / Sale') && !(activities.includes('Manufacturing') || activities.includes('Processing') || activities.includes('Assembly')) && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 border-b pb-1">Store / Showroom Location Diagnostics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Showroom Location Type</label>
                    <select 
                      value={answers.showroomLocation || 'Commercial High Street'}
                      onChange={(e) => setAnswers({ ...answers, showroomLocation: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded text-xs bg-white text-slate-800"
                    >
                      <option value="Commercial High Street">Commercial High Street (Standalone)</option>
                      <option value="Shopping Mall">Inside Shopping Mall / Complex</option>
                      <option value="Residential Area">Residential Commercial Mix</option>
                      <option value="Industrial Zone showroom">Industrial Estate showroom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Do you have a dedicated warehouse attached to this showroom?</label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <input 
                          type="checkbox" 
                          checked={answers.hasAttachedWarehouse === true} 
                          onChange={(e) => setAnswers({ ...answers, hasAttachedWarehouse: e.target.checked })}
                          className="accent-blue-600"
                        />
                        <span>Yes (Attached Dry storage)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty fallback text if no custom questions apply */}
            {!showFurnitureMfgQuestions && !showTextilesMfgQuestions && !showEVQuestions && !activities.includes('Retail / Sale') && (
              <div className="text-center py-6 text-xs text-slate-400">
                Standard commercial activities selected. Proceed to the location step.
              </div>
            )}
          </div>
        )}

        {/* STEP 4: LOCATION & LAND STATUS */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Business Geographic Parameters:</h3>
            <p className="text-xs text-slate-500">Government approvals in India are highly localized to state industrial bodies and municipal boards. Fill in the location details below.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <select
                  value={location.state}
                  onChange={(e) => {
                    const newState = e.target.value;
                    const defaultDistrict = STATES_AND_DISTRICTS.find(s => s.state === newState)?.districts[0] || '';
                    setLocation({ ...location, state: newState, district: defaultDistrict });
                  }}
                  className="w-full p-2 border border-slate-200 rounded text-xs bg-white text-slate-800"
                >
                  {STATES_AND_DISTRICTS.map((s) => (
                    <option key={s.state} value={s.state}>{s.state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                <select
                  value={location.district}
                  onChange={(e) => setLocation({ ...location, district: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded text-xs bg-white text-slate-800"
                >
                  {stateDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town Name</label>
                <input
                  type="text"
                  required
                  value={location.city}
                  onChange={(e) => setLocation({ ...location, city: e.target.value })}
                  placeholder="e.g. Pune City, Peenya, Tiruppur North"
                  className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industrial Area / Estate (if any)</label>
                <input
                  type="text"
                  value={location.industrialArea}
                  onChange={(e) => setLocation({ ...location, industrialArea: e.target.value })}
                  placeholder="e.g. MIDC Chakan Phase II, SIDCO Estate, or 'None'"
                  className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Premises Land Allotment Status</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                  {LAND_STATUS_OPTIONS.map((status) => {
                    const isSelected = location.landStatus === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setLocation({ ...location, landStatus: status })}
                        className={`p-2.5 text-left border rounded text-xs font-medium transition-all ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/20 text-blue-900 font-semibold' 
                            : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PROJECT SIZE & UTILITY SCALE */}
        {step === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Project Scale & Utility Requirements:</h3>
            <p className="text-xs text-slate-500 font-sans">SolveX utilizes these variables (Power, Water, Employees) to cross-check statutory triggers like factory license requirements or effluent limits.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposed Investment (INR Lakhs)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    required
                    value={projectSize.investment}
                    onChange={(e) => setProjectSize({ ...projectSize, investment: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 bg-white pl-8"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                  <span className="absolute right-2.5 top-2.5 text-[10px] uppercase text-slate-400 font-semibold">Lakhs</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Note: ₹1 Lakh = ₹100,000</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Production Capacity (Monthly text description)
                </label>
                <input
                  type="text"
                  required
                  value={projectSize.capacity}
                  onChange={(e) => setProjectSize({ ...projectSize, capacity: e.target.value })}
                  placeholder="e.g. 5,000 readymade uniform shirts per month"
                  className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Power Requirement (in HP / kW load)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={projectSize.power}
                    onChange={(e) => setProjectSize({ ...projectSize, power: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 bg-white pr-12"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] uppercase text-slate-400 font-semibold">HP / kW</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Employee / Worker Count (including contract staff)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={projectSize.employees}
                    onChange={(e) => setProjectSize({ ...projectSize, employees: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 bg-white pr-16"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] uppercase text-slate-400 font-semibold">Workers</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facility Built-Up Area (in Sq. Ft.)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={projectSize.area}
                    onChange={(e) => setProjectSize({ ...projectSize, area: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 bg-white pr-12"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] uppercase text-slate-400 font-semibold">Sq Ft</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Water Intake Requirement (Kilo-Litres per Day - KLD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={projectSize.water}
                    onChange={(e) => setProjectSize({ ...projectSize, water: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 bg-white pr-12"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] uppercase text-slate-400 font-semibold">KLD</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Actions Footer */}
        <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 transition flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={step === 1 && !selectedSector}
              className={`px-5 py-2.5 rounded text-xs font-semibold text-white transition flex items-center ${
                step === 1 && !selectedSector
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-[#0b1b3d] hover:bg-[#152e61]'
              }`}
            >
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold tracking-wider uppercase transition flex items-center shadow-sm"
            >
              Analyze Compliance Roadmap <ArrowRight className="h-4 w-4 ml-1.5" />
            </button>
          )}
        </div>

      </form>
    </div>
  );
}

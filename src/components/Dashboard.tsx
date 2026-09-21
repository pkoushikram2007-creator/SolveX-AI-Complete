import React, { useState } from 'react';
import { BusinessProfile, ClassificationResult, Approval, Document, DocumentStatus, ApplicationStage } from '../types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  MapPin, 
  Gauge, 
  Users, 
  Compass, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  ExternalLink,
  Plus,
  ArrowRight,
  BookOpen,
  FileText,
  Layers,
  HelpCircle,
  Activity,
  Info,
  Sparkles,
  RotateCcw,
  Check,
  X,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { UserAccount } from './SecurityModule';

interface DashboardProps {
  profile: BusinessProfile;
  classification: ClassificationResult;
  approvals: Approval[];
  documents: Document[];
  onNavigateToTab: (tabName: string) => void;
  onUpdateDocumentStatus: (docId: string, status: DocumentStatus, fileName?: string) => void;
  onUpdateApprovalStage: (appId: string, stage: ApplicationStage) => void;
  user?: UserAccount | null;
}

// Order of logical approvals sequence for guided journey
const APPROVALS_SEQUENCE = ['app-udyam', 'app-gst', 'app-shop', 'app-cte', 'app-firenoc', 'app-factory'];

export default function Dashboard({ 
  profile, 
  classification, 
  approvals, 
  documents, 
  onNavigateToTab,
  onUpdateDocumentStatus,
  onUpdateApprovalStage,
  user
}: DashboardProps) {

  // Step-by-Step local states
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [beginnerMode, setBeginnerMode] = useState<boolean>(false);
  const [selectedDocForGuide, setSelectedDocForGuide] = useState<Document | null>(null);
  const [showPortalWarning, setShowPortalWarning] = useState<{ url: string; label: string; portalType?: string } | null>(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState<boolean>(false);
  const [arnInput, setArnInput] = useState<string>('');
  const [submitDateInput, setSubmitDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [aiDiagnosticResult, setAiDiagnosticResult] = useState<string | null>(null);
  
  // Query Management states
  const [queryInputText, setQueryInputText] = useState<string>('');
  const [aiQueryResult, setAiQueryResult] = useState<string | null>(null);

  // Help sort approvals logically by standard sequence
  const getSortedApprovals = (apps: Approval[]): Approval[] => {
    return [...apps].sort((a, b) => {
      const idxA = APPROVALS_SEQUENCE.indexOf(a.id);
      const idxB = APPROVALS_SEQUENCE.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  };

  const sortedApprovals = getSortedApprovals(approvals);

  // Find the current active step index (first approval which is not completed)
  const isStepCompleted = (app: Approval) => app.stage === 'Approval / Rejection' || app.stage === 'Renewal';
  const currentNextApp = sortedApprovals.find(a => !isStepCompleted(a)) || sortedApprovals[0];
  const currentNextAppIndex = currentNextApp ? sortedApprovals.findIndex(a => a.id === currentNextApp.id) : sortedApprovals.length;

  // Calculated Statistics
  const totalApprovals = approvals.length;
  const approvedCount = approvals.filter(isStepCompleted).length;
  const submittedCount = approvals.filter(a => a.stage === 'Application Submitted' || a.stage === 'Government Scrutiny' || a.stage === 'Query / Clarification').length;
  const totalDocs = documents.length;
  const uploadedDocsCount = documents.filter(d => d.status === 'Uploaded' || d.status === 'Ready for Application' || d.status === 'Approved').length;

  // Calculate completion percentage
  const docsWeight = totalDocs > 0 ? (uploadedDocsCount / totalDocs) * 50 : 50;
  const approvalsWeight = totalApprovals > 0 ? (approvedCount / totalApprovals) * 50 : 50;
  const progressPercent = Math.round(docsWeight + approvalsWeight);

  // Beginner mode translation dictionary
  const getSimpleTitle = (name: string): string => {
    if (!beginnerMode) return name;
    if (name.includes('Udyam')) return 'Small Business Certificate (Udyam MSME)';
    if (name.includes('GST')) return 'Tax Registration (GST REG-06)';
    if (name.includes('Shop')) return 'Local Store/Office Permit (Shop Act)';
    if (name.includes('Consent to Establish')) return 'Environmental Pollution Permit (CTE)';
    if (name.includes('Fire Safety')) return 'Fire Safety & Escape NOC';
    if (name.includes('Factory')) return 'Factory Structural Safety License';
    return name;
  };

  const getSimpleExplain = (appId: string, defaultWhy: string): string => {
    if (!beginnerMode) return defaultWhy;
    const simpleWhyMap: Record<string, string> = {
      'app-udyam': 'This makes you an official small business in India. It unlocks lower interest bank loans, collateral-free credit, and protection against late payments.',
      'app-gst': 'This tax ID lets you legally purchase wholesale items without paying double-taxation and lets you charge GST tax to customer invoices.',
      'app-shop': 'This registers your showroom, office, or counter with your municipal corporation to guarantee safe working hours and legal local holiday rules.',
      'app-cte': 'Since your machines might create dust, sewage, or waste, the pollution board checks that you have filtration systems installed before you construct machinery.',
      'app-firenoc': 'This verifies that your showroom or workshop has working fire extinguishers, water tanks, and proper escape stairs for emergency safety.',
      'app-factory': 'Required because you have workers operating power machines. This confirms your floor plan has adequate toilets, safe spacing, and machine guards.'
    };
    return simpleWhyMap[appId] || defaultWhy;
  };

  const getSimpleDocExplain = (docId: string, defaultText: string): string => {
    if (!beginnerMode) return defaultText;
    const docMap: Record<string, string> = {
      'doc-pan': 'Company/Individual Tax ID card. Essential to open bank accounts and prove business identity.',
      'doc-addr': 'Lease agreement or utility bill proving where your business office physically exists.',
      'doc-gst': 'Your approved GST TAX certificate. Unlocks vendor wholesale pricing.',
      'doc-udyam': 'Your MSME ID proving you are registered as a small business.',
      'doc-siteplan': 'Architectural blueprint sketch showing factory walls, exits, and where machines are placed.',
      'doc-firenoc': 'A verified certificate confirming you are equipped to put out small fires.',
      'doc-cte': 'Pollution board approval allowing factory setup to begin.',
      'doc-factory': 'DISH Factory license validating work-environment safety.'
    };
    return docMap[docId] || defaultText;
  };

  // "What Do I Do Now?" AI Diagnostics trigger
  const handleWhatDoIDoNow = () => {
    if (!currentNextApp) {
      setAiDiagnosticResult("Excellent! All statutory approvals and clearances have been logged. You are ready to run operations legally in India!");
      return;
    }

    const linkedDocs = documents.filter(d => currentNextApp.documentIds.includes(d.id));
    const missingDocs = linkedDocs.filter(d => d.status !== 'Uploaded' && d.status !== 'Ready for Application' && d.status !== 'Approved');

    let response = `**SolveX AI Coach Assessment:**\n\n`;
    response += `You are currently focusing on **${currentNextApp.name}** administered by *${currentNextApp.authority}*.\n\n`;

    if (missingDocs.length > 0) {
      response += `**Critical Blockers Found:** You have **${missingDocs.length} missing documents** required for this application.\n\n`;
      response += `Your immediate next action is to prepare **${missingDocs[0].name}**.\n\n`;
      response += `*Why needed:* ${missingDocs[0].whyNeeded}\n\n`;
      response += `*How to obtain:* ${missingDocs[0].howToObtain}`;
      setAiDiagnosticResult(response);
    } else {
      response += `**Excellent Progress!** All required documents for this step are uploaded and ready.\n\n`;
      response += `Your immediate next action is to open the **${currentNextApp.portalName || 'official portal'}** and file your **${currentNextApp.name}** application.\n\n`;
      response += `Use our sequential **How To Apply** guide inside the step details page to prevent document rejections. Once submitted, make sure to save your Application Reference Number (ARN) here!`;
      setAiDiagnosticResult(response);
    }
  };

  // Simulates custom AI Query Help
  const handleAskQueryHelp = (appName: string, authority: string) => {
    if (!queryInputText.trim()) return;

    let advice = `**SolveX Compliance Analyst Response:**\n\n`;
    advice += `Regarding the query raised by *${authority}* on your *${appName}* application:\n\n`;
    
    const query = queryInputText.toLowerCase();
    if (query.includes('address') || query.includes('lease') || query.includes('proof')) {
      advice += `The officer is asking to verify your operational location. This typically occurs when a lease deed is unregistered or municipal tax receipts are outdated.\n\n`;
      advice += `**Next Steps:**\n`;
      advice += `1. Request a clear, colored scan of the registered 11-month rent deed.\n`;
      advice += `2. Obtain the latest electricity bill or property tax paid receipt in the landlord's name.\n`;
      advice += `3. Upload a formal No Objection Certificate (NOC) signed by the landlord.`;
    } else if (query.includes('power') || query.includes('load') || query.includes('hp')) {
      advice += `The department is seeking clarification on your connected power load. This happens when the machine horse-power (HP) list does not match the utility load.\n\n`;
      advice += `**Next Steps:**\n`;
      advice += `1. Provide a certified Single Line Diagram (SLD) signed by a licensed electrical contractor.\n`;
      advice += `2. Submit the active electricity bill showing sanctioned load exceeding your machinery total.`;
    } else if (query.includes('layout') || query.includes('blueprint') || query.includes('plan')) {
      advice += `The safety inspector requires detailed physical measurements. This is a common query under DISH or SPCB reviews.\n\n`;
      advice += `**Next Steps:**\n`;
      advice += `1. Re-upload your factory site-plan with clear exits, fire hydrant points, and machinery clearances marked in millimeters.\n`;
      advice += `2. Ensure the architect's seal and license number are fully visible in the bottom-right corner.`;
    } else {
      advice += `We have analyzed this clarification request. To prevent summary rejection, you should draft an official response letter explaining your setup simply, upload the requested supporting affidavit, and double-check your metrics.\n\n`;
      advice += `**Suggested Action:** Upload a self-declared clarification letter in PDF format explaining the parameters directly within the portal.`;
    }

    setAiQueryResult(advice);
  };

  // Submits Application Reference Log
  const handleSaveARN = (appId: string) => {
    if (!arnInput.trim()) {
      alert("Please enter a valid Application Reference Number (ARN)");
      return;
    }
    onUpdateApprovalStage(appId, 'Application Submitted');
    setShowSubmissionForm(false);
    setArnInput('');
  };

  // Simulates advancing government stages
  const handleAdvanceGovernmentStage = (appId: string, currentStage: ApplicationStage) => {
    const stagesList: ApplicationStage[] = [
      'Application Submitted',
      'Government Scrutiny',
      'Query / Clarification',
      'Inspection if applicable',
      'Verification',
      'Decision'
    ];

    const idx = stagesList.indexOf(currentStage);
    if (idx !== -1 && idx < stagesList.length - 1) {
      onUpdateApprovalStage(appId, stagesList[idx + 1]);
    } else if (currentStage === 'Decision' || currentStage === 'Requirement Identified' || currentStage === 'Documents Ready') {
      onUpdateApprovalStage(appId, 'Application Submitted');
    }
  };

  // Mark approval completed
  const handleMarkStepCompleted = (appId: string) => {
    onUpdateApprovalStage(appId, 'Approval / Rejection');
  };

  // Helper to determine step index count
  const activeStepIdx = activeStepId ? sortedApprovals.findIndex(a => a.id === activeStepId) : -1;
  const activeApp = activeStepId ? sortedApprovals.find(a => a.id === activeStepId) : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider bg-blue-100 text-blue-900 font-bold px-2.5 py-1 rounded">
              Step-By-Step Interactive Onboarding
            </span>
            <button
              onClick={() => onNavigateToTab('Wizard')}
              className="text-[10px] uppercase bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2.5 py-1 rounded transition flex items-center shadow-2xs"
            >
              ✎ Re-run Wizard / Edit Answers
            </button>
            {user && (
              <span className="text-[10px] uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-2.5 py-1 rounded flex items-center">
                <span className="h-1.5 w-1.5 bg-emerald-600 rounded-full mr-1.5 animate-pulse"></span>
                Active Unit: {profile.location.city || 'Your Enterprise'} ({user.role})
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2 font-sans tracking-tight">
            Welcome back, {user?.name.split(' ')[0] || 'Entrepreneur'} • {profile.location.city || 'Your Enterprise'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            SolveX has calculated your exact physical compliance sequence for <strong>{classification.businessModel}</strong>. Focus on one clearance at a time to prevent paperwork fatigue.
          </p>
        </div>

        {/* Progress Circle & Metrics */}
        <div className="flex items-center space-x-4">
          <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
              <circle cx="32" cy="32" r="28" stroke="#2563eb" strokeWidth="4" fill="transparent"
                strokeDasharray={175}
                strokeDashoffset={175 - (175 * progressPercent) / 100}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-xs font-bold text-slate-800">{progressPercent}%</span>
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase leading-none">Ready Index</span>
            <span className="text-lg font-bold text-slate-800 font-mono leading-tight">{uploadedDocsCount}/{totalDocs} prepared</span>
            <span className="block text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline mt-0.5" onClick={() => onNavigateToTab('Documents')}>
              View missing documents →
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. DYNAMIC WORKSPACE SCREEN (GRID OR DETAIL STEP VIEW) */}
      {/* ========================================================= */}
      {!activeStepId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2-COLUMNS: "YOUR NEXT STEP" CARD + ROADMAP OVERVIEW */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 2A. "YOUR NEXT STEP" CARD */}
            {currentNextApp && (
              <div className="bg-white border-2 border-blue-600/50 rounded-lg p-5 space-y-4 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold uppercase px-3 py-1 rounded-bl">
                  Recommended Next Action
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">YOUR NEXT STEP</span>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {getSimpleTitle(currentNextApp.name)}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentNextApp.authority}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded text-xs text-slate-600 leading-relaxed border border-slate-100">
                  <strong>Why this matters:</strong> {getSimpleExplain(currentNextApp.id, currentNextApp.why)}
                </div>

                {/* Requirements details inside next step */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Required Documents:</span>
                    <span className="font-semibold text-slate-800">
                      {currentNextApp.documentIds.length} files needed
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Preparation Stage:</span>
                    <span className="font-semibold text-blue-600">
                      {currentNextApp.stage}
                    </span>
                  </div>
                </div>

                {/* Integrated AI Assistant coach tool */}
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-md text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <strong className="font-semibold text-blue-900 block">Stuck on what to do next?</strong>
                    <span className="text-[11px] text-slate-500">Let SolveX inspect your missing files, application logs, and active status.</span>
                  </div>
                  <button
                    onClick={handleWhatDoIDoNow}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase rounded transition shrink-0 flex items-center"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    "What do I do now?"
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Estimated: <strong>1 - 3 Days</strong></span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveStepId(currentNextApp.id);
                      window.scrollTo(0, 0);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center shadow-xs"
                  >
                    Start This Step <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* 2B. OVERALL ROADMAP VISUAL */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
              <div className="border-b pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Overall Compliance Roadmap
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Complete view of all sequential statutory requirements generated for your enterprise footprint.
                </p>
              </div>

              <div className="space-y-4">
                {sortedApprovals.map((app, index) => {
                  const isDone = isStepCompleted(app);
                  const isCurrent = app.id === currentNextApp?.id;
                  const isLocked = index > currentNextAppIndex;

                  return (
                    <div 
                      key={app.id} 
                      onClick={() => {
                        if (isLocked) {
                          alert(`Step "${getSimpleTitle(app.name)}" is locked. Please complete the current active step first.`);
                          return;
                        }
                        setActiveStepId(app.id);
                        window.scrollTo(0, 0);
                      }}
                      className={`p-4 border rounded-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                        isLocked
                          ? 'bg-slate-50/50 border-slate-100 cursor-not-allowed opacity-60'
                          : isDone 
                            ? 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-200 cursor-pointer' 
                            : isCurrent 
                              ? 'bg-blue-50/10 border-blue-200 ring-1 ring-blue-100 hover:border-blue-300 cursor-pointer' 
                              : 'bg-white border-slate-100 hover:border-slate-200 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isLocked
                            ? 'bg-slate-200 text-slate-400'
                            : isDone 
                              ? 'bg-emerald-600 text-white' 
                              : isCurrent 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isLocked ? <Lock className="h-2.5 w-2.5 text-slate-400" /> : isDone ? <Check className="h-3 w-3" /> : index + 1}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h5 className={`font-bold text-xs ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                              {getSimpleTitle(app.name)}
                            </h5>
                            {isCurrent && (
                              <span className="text-[8px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded uppercase animate-pulse">
                                Active Step
                              </span>
                            )}
                            {isLocked && (
                              <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded uppercase flex items-center">
                                <Lock className="h-2 w-2 mr-0.5" /> Locked
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] block ${isLocked ? 'text-slate-300' : 'text-slate-400'}`}>{app.authority}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          isLocked
                            ? 'bg-slate-100 text-slate-400'
                            : isDone 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isLocked ? 'Locked' : app.stage}
                        </span>
                        {!isLocked && <ChevronRight className="h-4 w-4 text-slate-300" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT 1-COLUMN: BUSINESS ATTRIBUTES & LOCAL PERMITS CHECKS */}
          <div className="space-y-6">
            
            {/* Quick SPCB Hazard Details */}
            <div className="bg-[#0b1b3d] text-white rounded-lg p-5 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center">
                <ShieldAlert className="h-4 w-4 mr-1.5 text-blue-400 shrink-0" />
                SolveX Risk Matrix Analysis
              </h4>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex justify-between border-b border-blue-900 pb-2">
                  <span className="text-blue-200 font-sans">Process Hazards:</span>
                  <span className="font-semibold text-white">{classification.processType}</span>
                </div>
                <div className="flex justify-between border-b border-blue-900 pb-2">
                  <span className="text-blue-200 font-sans">Materials Risk:</span>
                  <span className="font-semibold text-white">{classification.materialType}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-blue-200 block text-[10px] uppercase font-bold tracking-wider">Identified Risk Factors:</span>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                    {classification.riskComplianceFactors.map((f, idx) => (
                      <div key={idx} className="flex items-start text-[11px] text-slate-300">
                        <span className="text-blue-400 mr-1.5">•</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security Summary Card */}
            {user && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
                <div className="flex items-center space-x-2 border-b pb-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Your Account Security
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b last:border-none">
                    <span className="text-slate-500 font-sans">Email Authentication</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded text-[10px] uppercase">
                      Verified ✓
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b last:border-none">
                    <span className="text-slate-500 font-sans">Mobile Identity</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded text-[10px] uppercase">
                      Verified ✓
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b last:border-none">
                    <span className="text-slate-500 font-sans">2FA / MFA Protection</span>
                    <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] uppercase ${
                      user.mfaEnabled 
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' 
                        : 'text-amber-700 bg-amber-50 border border-amber-100'
                    }`}>
                      {user.mfaEnabled ? 'Enabled ✓' : 'Disabled ⚠'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b last:border-none">
                    <span className="text-slate-500 font-sans">Documents Encryption</span>
                    <span className="font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded text-[10px] uppercase font-sans">
                      Active (AES-256) ✓
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToTab('Security Center')}
                  className="w-full py-1.5 bg-[#0b1b3d] hover:bg-blue-900 text-white text-[10px] font-bold uppercase tracking-wider rounded transition"
                >
                  Manage Security Settings
                </button>
              </div>
            )}

            {/* Document lockers shortcut */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center">
                  <FileCheck className="h-4 w-4 mr-1.5 text-blue-600 shrink-0" />
                  Dossier Inventory
                </h4>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {uploadedDocsCount}/{totalDocs} Prepared
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {documents.map(doc => (
                  <div key={doc.id} className="flex justify-between items-center text-xs py-1 border-b last:border-none">
                    <span className="font-medium text-slate-700 truncate max-w-[150px]">{doc.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      doc.status === 'Uploaded' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigateToTab('Documents')}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded transition"
              >
                Go to Document Locker
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* ========================================================= */
        /* 3. STEP DETAIL VIEW (ACTIVE MILESTONE ENVIRONMENT) */
        /* ========================================================= */
        activeApp && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-8 animate-fadeIn">
            
            {/* Top Navigation Row inside Step details */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
              <button
                onClick={() => {
                  setActiveStepId(null);
                  setAiQueryResult(null);
                  setQueryInputText('');
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center"
              >
                ← Back to Dashboard Overview
              </button>

              {/* Explain simply Beginner Mode toggle */}
              <button
                onClick={() => setBeginnerMode(!beginnerMode)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center space-x-1.5 ${
                  beginnerMode 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{beginnerMode ? '💡 Beginner Mode Active' : 'Enable Beginner Mode'}</span>
              </button>
            </div>

            {/* 3A. STEP PROGRESS BAR INDICATOR */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
                <span>STEP {activeStepIdx + 1} OF {sortedApprovals.length}</span>
                <span>{Math.round(((activeStepIdx) / sortedApprovals.length) * 100)}% Journey Map Completed</span>
              </div>

              <div className="flex items-center space-x-1">
                {sortedApprovals.map((app, idx) => {
                  const isDone = isStepCompleted(app);
                  const isActive = app.id === activeStepId;
                  const isLocked = idx > currentNextAppIndex;
                  return (
                    <div 
                      key={app.id} 
                      onClick={() => {
                        if (isLocked) {
                          alert(`Step "${getSimpleTitle(app.name)}" is locked. Please complete the current active step first.`);
                          return;
                        }
                        setActiveStepId(app.id);
                        setAiQueryResult(null);
                        setQueryInputText('');
                      }}
                      className={`h-2 rounded-full cursor-pointer transition-all ${
                        isLocked
                          ? 'bg-slate-200 w-8 cursor-not-allowed opacity-50'
                          : isDone 
                            ? 'bg-emerald-600 flex-1' 
                            : isActive 
                              ? 'bg-blue-600 flex-1' 
                              : 'bg-slate-100 w-8'
                      }`}
                      title={app.name + (isLocked ? ' (Locked)' : '')}
                    />
                  );
                })}
              </div>
            </div>

            {/* Header Description blocks */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600">
                {activeApp.category} Statutory License
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {getSimpleTitle(activeApp.name)}
              </h1>
              <p className="text-xs text-slate-500">
                Administering Authority: <strong className="text-slate-700">{activeApp.authority}</strong>
              </p>
            </div>

            {/* 3B. WHY DO YOU NEED THIS & WHO HANDLES IT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
              <div className="p-4 bg-slate-50 border rounded-md space-y-1">
                <strong className="text-slate-800 text-[10px] uppercase tracking-wider block font-bold">
                  Why do you need this?
                </strong>
                <p className="text-slate-600 font-sans">
                  {getSimpleExplain(activeApp.id, activeApp.why)}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border rounded-md space-y-1">
                <strong className="text-slate-800 text-[10px] uppercase tracking-wider block font-bold">
                  Prerequisites and Conditions
                </strong>
                <p className="text-slate-600 font-sans">
                  {activeApp.condition}
                </p>
              </div>
            </div>

            {/* 3C. DEPENDENCY FLOW DIAGRAM (10. Dependency Diagram) */}
            <div className="p-4 bg-blue-50/20 border border-blue-100 rounded-lg space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-blue-50 pb-2">
                <span className="font-bold text-blue-900 uppercase text-[10px]">Statutory Dependency Diagram</span>
                <span className="text-[10px] text-slate-500">Unlocks downstream clearances</span>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-around gap-4 text-center">
                <div className="p-2.5 bg-white border border-slate-200 rounded w-full md:w-1/3">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">1. Prerequisite Inputs</span>
                  <span className="block text-[11px] font-bold text-slate-700 truncate">
                    {activeStepIdx > 0 ? getSimpleTitle(sortedApprovals[activeStepIdx - 1].name).split(' (')[0] : 'PAN, Lease Deed'}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 hidden md:block" />
                <div className="p-3 bg-blue-600 text-white rounded w-full md:w-2/5 ring-4 ring-blue-100">
                  <span className="block text-[8px] font-bold text-blue-200 uppercase">2. Current Step Application</span>
                  <span className="block text-xs font-bold truncate">
                    {getSimpleTitle(activeApp.name).split(' (')[0]}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 hidden md:block" />
                <div className="p-2.5 bg-white border border-slate-200 rounded w-full md:w-1/3">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">3. Unlocks Next Step</span>
                  <span className="block text-[11px] font-bold text-slate-700 truncate">
                    {activeStepIdx < sortedApprovals.length - 1 ? getSimpleTitle(sortedApprovals[activeStepIdx + 1].name).split(' (')[0] : 'Ready for Operations'}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal text-center font-sans pt-1">
                {activeStepIdx > 0 
                  ? `Notice: Preparing this application requires verified details or reference numbers from your previous ${getSimpleTitle(sortedApprovals[activeStepIdx - 1].name).split(' (')[0]} approval.`
                  : "This foundational registration can be initialized immediately with basic corporate credentials."
                }
              </p>
            </div>

            {/* 3D. DOCUMENT-BY-DOCUMENT CHECKLIST FOR THIS STEP */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-bold text-slate-800 text-sm">Required Document Checklist</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Prepare and upload each prerequisite document to unlock submission forms.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.filter(d => activeApp.documentIds.includes(d.id)).map(doc => {
                  const isReady = doc.status === 'Uploaded' || doc.status === 'Ready for Application' || doc.status === 'Approved';
                  return (
                    <div 
                      key={doc.id}
                      className={`p-4 border rounded-md flex flex-col justify-between h-[180px] transition ${
                        isReady ? 'bg-emerald-50/10 border-emerald-100' : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-800 text-xs truncate max-w-[200px]">{doc.name}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans">Issued by: {doc.whoIssues}</p>
                        <p className="text-[11px] text-slate-500 font-sans line-clamp-3">
                          {getSimpleDocExplain(doc.id, doc.whyNeeded)}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedDocForGuide(doc)}
                        className="w-full py-1.5 mt-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded transition"
                      >
                        View Document Guide
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3E. OFFICIAL CONTEXTUAL PORTAL CARD (7-9. Official Portals) */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-800 flex items-center">
                    <Activity className="h-4 w-4 mr-1.5 text-blue-600 shrink-0" />
                    Authorized Government Portal Router
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Context-aware links strictly bound to verified ministries.</p>
                </div>
                {activeApp.portalUrl ? (
                  <span className="text-[9px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded leading-none">
                    ✓ Official portal available
                  </span>
                ) : (
                  <span className="text-[9px] font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded leading-none">
                    ⚠ Official portal not verified
                  </span>
                )}
              </div>

              {/* Differentiating Document vs Application vs tracking Portals explicitly */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Document Source:</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {activeApp.id === 'app-udyam' ? 'UIDAI Aadhaar / Income Tax' : 'GST Common Portal'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 font-sans">Obtain prerequisites</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Approval Application:</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {activeApp.portalName || 'Local Board Authority'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 font-sans">Submit online forms</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Application Tracking:</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {activeApp.portalName || 'Same Official Portal'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 font-sans">Audit status with ARN</span>
                </div>
              </div>

              {activeApp.portalUrl ? (
                <button
                  onClick={() => setShowPortalWarning({ url: activeApp.portalUrl!, label: activeApp.portalName })}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Official Government Portal ↗</span>
                </button>
              ) : (
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded text-[11px] text-amber-900 leading-normal font-sans">
                  The online application portal for this state municipal level requirement is highly localized. Please file physically at the concerned authority office: **{activeApp.authority}**.
                </div>
              )}
            </div>

            {/* 3F. APPLICATION PROCEDURE CHEKLIST (11. Procedure) */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-bold text-slate-800 text-sm">Sequential Application Procedure</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Follow this step-by-step checklist inside the official portal to ensure validation success.</p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 font-sans max-w-2xl">
                {activeApp.procedure.split('. ').map((procStep, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-2 bg-slate-50/50 hover:bg-slate-50 rounded border border-slate-100">
                    <span className="h-5 w-5 bg-slate-200 rounded-full flex items-center justify-center font-bold text-[10px] text-slate-600 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{procStep}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3G. AFTER APPLICATION (ARN Tracker) */}
            <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-4 shadow-2xs">
              <div className="border-b pb-2 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">Post-Submission Tracking</h3>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded leading-none uppercase">
                  State Linkage Simulator
                </span>
              </div>

              {/* Show submission status logic */}
              {activeApp.stage === 'Requirement Identified' || activeApp.stage === 'Documents Required' || activeApp.stage === 'Documents Prepared' || activeApp.stage === 'Documents Ready' || activeApp.stage === 'Open Official Portal' ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-sans leading-normal">
                    Have you completed your filing on the authorized government portal? Enter your submission details here to activate tracking and trigger AI mock reviews.
                  </p>

                  {!showSubmissionForm ? (
                    <button
                      onClick={() => setShowSubmissionForm(true)}
                      className="px-4 py-2 bg-[#0b1b3d] hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded transition"
                    >
                      I Have Submitted My Application On The Portal
                    </button>
                  ) : (
                    <div className="p-4 bg-slate-50 border rounded-md space-y-4 max-w-md">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block">Application Reference Number (ARN)</label>
                        <input
                          type="text"
                          value={arnInput}
                          onChange={(e) => setArnInput(e.target.value)}
                          placeholder="e.g. ARN-2026-904812"
                          className="w-full px-3 py-1.5 border rounded text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block">Date of Submission</label>
                        <input
                          type="date"
                          value={submitDateInput}
                          onChange={(e) => setSubmitDateInput(e.target.value)}
                          className="w-full px-3 py-1.5 border rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveARN(activeApp.id)}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase rounded transition"
                        >
                          Save Reference & Track
                        </button>
                        <button
                          onClick={() => setShowSubmissionForm(false)}
                          className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-700 text-[10px] font-bold uppercase rounded transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Interactive Tracking Progression UI */
                <div className="space-y-5">
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded text-xs text-slate-700 font-sans space-y-1">
                    <div className="flex items-center space-x-2">
                      <span>Government tracking ARN:</span>
                      <strong className="font-mono font-bold text-slate-900">ARN-2026-X{activeApp.id.toUpperCase().split('-')[1]}</strong>
                    </div>
                    <span className="text-[10px] text-slate-400 block leading-none">Filing Date: {new Date().toLocaleDateString()} • Authority status updates are simulated below.</span>
                  </div>

                  {/* Progressive review timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-[10px] font-bold uppercase">
                    <div className={`p-2 border rounded ${activeApp.stage === 'Application Submitted' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      1. Submitted
                    </div>
                    <div className={`p-2 border rounded ${activeApp.stage === 'Government Scrutiny' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      2. Scrutiny
                    </div>
                    <div className={`p-2 border rounded ${activeApp.stage === 'Query / Clarification' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      3. Query Raised
                    </div>
                    <div className={`p-2 border rounded ${activeApp.stage === 'Inspection if applicable' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      4. Inspection
                    </div>
                    <div className={`p-2 border rounded ${activeApp.stage === 'Approval / Rejection' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      5. Approved
                    </div>
                  </div>

                  {/* Warning Boundaries */}
                  <div className="p-3 bg-amber-50 text-amber-900 text-[11px] leading-relaxed font-sans rounded border border-amber-100">
                    <strong>Disclaimer:</strong> SolveX operates as a preparation and guidance portal. Real status decisions and administrative verifications are governed strictly by the issuing state office. Please check updates periodically on the authorized portal website.
                  </div>

                  {/* Simulator Control Box */}
                  <div className="p-4 bg-slate-50 border rounded-md space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Government Office Simulation:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAdvanceGovernmentStage(activeApp.id, activeApp.stage)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold uppercase rounded transition"
                      >
                        Advance Scrutiny Level →
                      </button>
                      <button
                        onClick={() => onUpdateApprovalStage(activeApp.id, 'Query / Clarification')}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase rounded transition"
                      >
                        Simulate Office Query ⚠
                      </button>
                      <button
                        onClick={() => handleMarkStepCompleted(activeApp.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded transition"
                      >
                        Mark Approved & Completed ✓
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3H. QUERY MANAGEMENT PORTLET (13. Query Raised) */}
            {activeApp.stage === 'Query / Clarification' && (
              <div className="p-5 border-2 border-amber-500 rounded-lg bg-amber-50/10 space-y-4 shadow-sm animate-fadeIn">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-500 text-white rounded shrink-0">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Action Required: SPCB Clarification Query Raised</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">The officer has raised a query regarding your submitted blueprints or HP motor ratings.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Department Query Description</label>
                  <textarea
                    value={queryInputText}
                    onChange={(e) => setQueryInputText(e.target.value)}
                    placeholder="e.g. Please clarify why the water effluent discharge volume exceeds SPCB Green category bounds, or submit certified electrical load."
                    className="w-full h-20 p-2.5 border rounded text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-sans"
                  />
                  <button
                    onClick={() => handleAskQueryHelp(activeApp.name, activeApp.authority)}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase rounded transition"
                  >
                    How should I respond?
                  </button>
                </div>

                {aiQueryResult && (
                  <div className="p-4 bg-white border border-amber-200 rounded-md text-xs leading-relaxed text-slate-700 font-sans whitespace-pre-wrap">
                    {aiQueryResult}
                  </div>
                )}
              </div>
            )}

            {/* 3I. STEP COMPLETED ACTION FOOTER */}
            {isStepCompleted(activeApp) && (
              <div className="p-6 bg-emerald-500 text-white rounded-lg space-y-4 shadow-md text-center">
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold tracking-tight">Step Completed Successfully!</h2>
                  <p className="text-xs text-emerald-100 font-sans max-w-md mx-auto">
                    You have secured the official statutory **{getSimpleTitle(activeApp.name)}** from the {activeApp.authority}.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      // Navigate to next logical incomplete approval
                      const nextStep = sortedApprovals.find(a => !isStepCompleted(a));
                      if (nextStep) {
                        setActiveStepId(nextStep.id);
                        setAiQueryResult(null);
                        setQueryInputText('');
                        window.scrollTo(0, 0);
                      } else {
                        setActiveStepId(null);
                      }
                    }}
                    className="px-6 py-2.5 bg-white text-emerald-950 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded transition shadow-xs"
                  >
                    Continue to Next Step →
                  </button>
                  <button
                    onClick={() => setActiveStepId(null)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 border border-emerald-400 text-white font-bold text-xs uppercase tracking-wider rounded transition"
                  >
                    Return to Overview
                  </button>
                </div>
              </div>
            )}

          </div>
        )
      )}

      {/* ========================================================= */}
      {/* 4. MODALS & OVERLAYS SYSTEM */}
      {/* ========================================================= */}

      {/* 4A. "WHAT DO I DO NOW?" AI CONVERSATION MODAL */}
      {aiDiagnosticResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-5 border max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase">
                <Sparkles className="h-4.5 w-4.5" />
                <span>AI Compliance Diagnostic</span>
              </div>
              <button 
                onClick={() => setAiDiagnosticResult(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
              {aiDiagnosticResult}
            </div>

            <div className="border-t pt-3 flex space-x-2 shrink-0">
              <button
                onClick={() => {
                  setAiDiagnosticResult(null);
                  if (currentNextApp) {
                    setActiveStepId(currentNextApp.id);
                  }
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded transition"
              >
                Go to Active Step →
              </button>
              <button
                onClick={() => setAiDiagnosticResult(null)}
                className="px-4 py-2 border text-slate-500 hover:text-slate-700 text-xs font-bold uppercase rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4B. OFFICIAL GOVERNMENT PORTAL LEAVING WARNING (8. Official Portal) */}
      {showPortalWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-5 border border-slate-200">
            <div className="text-center space-y-3">
              <div className="h-10 w-10 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Leaving SolveX Platform</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                You are leaving SolveX and opening the authorized official government portal: <strong className="text-slate-700">{showPortalWarning.label}</strong>.
                <br /><br />
                <span className="text-amber-800 font-medium">SolveX is a compliance guidance platform and is not affiliated with, sponsored by, or authorized to issue approvals on behalf of any government agency. Please ensure you are submitting details on the official domain securely.</span>
              </p>
              <div className="p-2.5 bg-slate-100 rounded text-[10px] text-slate-500 font-mono break-all leading-normal text-left">
                {showPortalWarning.url}
              </div>
            </div>

            <div className="mt-5 flex space-x-2.5">
              <button
                onClick={() => {
                  window.open(showPortalWarning.url, '_blank');
                  setShowPortalWarning(null);
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded transition"
              >
                Continue
              </button>
              <button
                onClick={() => setShowPortalWarning(null)}
                className="flex-1 py-2 border text-slate-500 hover:text-slate-700 text-xs font-bold uppercase rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4C. DOCUMENT GUIDE OVERLAY MODAL (7. Document Guide) */}
      {selectedDocForGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-xl p-6 border max-h-[90vh] flex flex-col justify-between animate-scaleIn">
            
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <span className="text-[8px] font-bold uppercase text-slate-400 tracking-wider">SolveX Document Locker Support</span>
                <h3 className="font-bold text-slate-950 text-sm tracking-tight mt-0.5">{selectedDocForGuide.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedDocForGuide(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 11-Point Document Guidance checklist */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong className="text-slate-800 block">1. Why you need it:</strong>
                  <span className="text-slate-500 block leading-normal">{selectedDocForGuide.whyNeeded}</span>
                </div>
                <div>
                  <strong className="text-slate-800 block">2. Who issues/provides it:</strong>
                  <span className="text-slate-500 block leading-normal">{selectedDocForGuide.whoIssues}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border text-xs">
                <strong className="text-slate-800 block mb-1">3. What information is required:</strong>
                <ul className="list-disc pl-4 space-y-1 text-slate-500">
                  {selectedDocForGuide.infoRequired.map((info, idx) => (
                    <li key={idx}>{info}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <strong className="text-slate-800 block">4. How to prepare/obtain it:</strong>
                <span className="text-slate-500 block leading-normal">{selectedDocForGuide.howToObtain}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border text-xs">
                <strong className="text-slate-800 block mb-1">5. Acceptable parameters list:</strong>
                <ul className="list-disc pl-4 space-y-1 text-slate-500">
                  {selectedDocForGuide.prepSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                <div>
                  <strong className="text-slate-800 block">6. Signature Required:</strong>
                  <span className="text-slate-500 block">Yes, authorized digital signature or self-declaration scan.</span>
                </div>
                <div>
                  <strong className="text-slate-800 block">7. Format & Upload details:</strong>
                  <span className="text-slate-500 block">{selectedDocForGuide.uploadRequirements}</span>
                </div>
                <div>
                  <strong className="text-slate-800 block">8. Validity:</strong>
                  <span className="text-slate-500 block">{selectedDocForGuide.validity}</span>
                </div>
                <div>
                  <strong className="text-slate-800 block">9. Primary Submission Node:</strong>
                  <span className="text-slate-500 block">Filing as a prerequisite inside department single window forms.</span>
                </div>
                <div>
                  <strong className="text-slate-800 block">10. Official Source Agency:</strong>
                  <span className="text-slate-500 block">{selectedDocForGuide.whoIssues}</span>
                </div>
                <div>
                  <strong className="text-slate-800 block">11. Document Portal:</strong>
                  <span className="text-slate-500 block">UIDAI, Corporate Affairs, or State single window dashboards.</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-sans italic text-center pt-2">
                "Once this document is ready, return to SolveX."
              </p>
            </div>

            {/* Document upload simulation controls */}
            <div className="border-t pt-3 flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                onClick={() => {
                  onUpdateDocumentStatus(selectedDocForGuide.id, 'Uploaded', 'simulated_uploaded_file.pdf');
                  setSelectedDocForGuide(null);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded transition"
              >
                I Have This Document (Simulate Upload)
              </button>
              <button
                onClick={() => setSelectedDocForGuide(null)}
                className="px-4 py-2 border text-slate-500 hover:text-slate-700 text-xs font-bold uppercase rounded transition text-center"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

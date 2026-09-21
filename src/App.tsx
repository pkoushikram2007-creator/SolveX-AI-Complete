import React, { useState } from 'react';
import { 
  Sector, 
  ActivityType, 
  BusinessProfile, 
  ClassificationResult, 
  Approval, 
  Document, 
  DocumentStatus,
  ApplicationStage,
  DemoScenario
} from './types';
import { classifyBusiness, generateComplianceRoadmap } from './classification';
import { DEMO_SCENARIOS } from './data';
import Wizard from './components/Wizard';
import Scenarios from './components/Scenarios';
import Dashboard from './components/Dashboard';
import ApprovalsPage from './components/ApprovalsPage';
import DocumentsPage from './components/DocumentsPage';
import ChatAssistant from './components/ChatAssistant';
import InfoViews from './components/InfoViews';
import SecurityModule, { UserAccount, AuditLogEntry } from './components/SecurityModule';
import { 
  ShieldCheck, 
  Compass, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  BookOpen, 
  Award, 
  Calendar, 
  FileCheck, 
  Briefcase, 
  Settings,
  ChevronRight,
  ClipboardList,
  ChevronDown,
  Menu,
  X,
  FileText,
  Clock,
  ArrowRight,
  Lock,
  LogOut,
  User,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('Home');
  
  // 1. Secure Authentication States
  const [user, setUser] = useState<UserAccount | null>(null);
  const [activeBusinessId, setActiveBusinessId] = useState<string>('new-enterprise');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    { timestamp: new Date().toLocaleTimeString(), action: 'Platform Initialization', details: 'SolveX statutory container sandbox booted successfully.', role: 'SYSTEM', user: 'Daemon' },
    { timestamp: new Date().toLocaleTimeString(), action: 'Security Policy Applied', details: 'Client-side isolation keys successfully verified.', role: 'SYSTEM', user: 'Daemon' }
  ]);

  // Secure re-auth challenge state
  const [reauthChallenge, setReauthChallenge] = useState<{
    actionLabel: string;
    onSuccess: () => void;
  } | null>(null);
  const [reauthOtp, setReauthOtp] = useState('');
  const [reauthError, setReauthError] = useState('');

  // 26. Dynamic helper to pre-fill compliance state for multi-business sandbox separation
  const initBusinessState = (scenarioId: string) => {
    const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return { profile: null, classification: null, approvals: [], documents: [] };
    const profile: BusinessProfile = {
      sector: scenario.sector,
      activities: scenario.activities,
      specificActivities: scenario.specificActivities,
      description: scenario.description,
      location: scenario.location,
      projectSize: scenario.projectSize,
      answers: scenario.answers
    };
    const result = classifyBusiness(profile);
    const { approvals, documents } = generateComplianceRoadmap(profile, result);
    return { profile, classification: result, approvals, documents };
  };

  const [businessData, setBusinessData] = useState<Record<string, {
    profile: BusinessProfile | null,
    classification: ClassificationResult | null,
    approvals: Approval[],
    documents: Document[]
  }>>(() => {
    return {
      'new-enterprise': { profile: null, classification: null, approvals: [], documents: [] },
      'mfg-garments-01': initBusinessState('S4'),
      'mfg-wood-02': initBusinessState('S3'),
      'mfg-automotive-03': initBusinessState('S8')
    };
  });

  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  
  // Right AI Assistant collapsible panel state
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(false);
  
  // Mobile responsive menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Pre-populate AI Chat Assistant with a query if requested
  const chatRef = React.useRef<any>(null);

  // Derived states from active business sandbox
  const activeData = businessData[activeBusinessId] || { profile: null, classification: null, approvals: [], documents: [] };
  const profile = activeData.profile;
  const classification = activeData.classification;
  const approvals = activeData.approvals;
  const documents = activeData.documents;

  // Audit Logger helper
  const addAuditLog = (action: string, details: string) => {
    const entry: AuditLogEntry = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      details,
      role: user ? user.role : 'GUEST',
      user: user ? user.name : 'Unauthenticated'
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  const handleLoadProfile = (newProfile: BusinessProfile) => {
    const result = classifyBusiness(newProfile);
    const { approvals: newApps, documents: newDocs } = generateComplianceRoadmap(newProfile, result);
    
    setBusinessData(prev => ({
      ...prev,
      [activeBusinessId]: {
        profile: newProfile,
        classification: result,
        approvals: newApps,
        documents: newDocs
      }
    }));
    setShowWizard(false);
    setActiveTab('Home');
    addAuditLog('Onboard Profile Mapped', `Mapped new business characteristics with ${newApps.length} approvals identified.`);
  };

  const handleSelectScenario = (scenario: DemoScenario) => {
    const newProfile: BusinessProfile = {
      sector: scenario.sector,
      activities: scenario.activities,
      specificActivities: scenario.specificActivities,
      description: scenario.description,
      location: scenario.location,
      projectSize: scenario.projectSize,
      answers: scenario.answers
    };
    
    if (!user) {
      setUser({
        email: 'demo@solvex.example',
        name: 'Hadria (Director)',
        phone: '+91 98765 43210',
        role: 'Entrepreneur',
        companyName: 'SolveX Sandbox Unit',
        mfaEnabled: true,
        emailVerified: true,
        phoneVerified: true
      });
    }

    let targetBizId = 'new-enterprise';
    if (scenario.id === 'S4') targetBizId = 'mfg-garments-01';
    else if (scenario.id === 'S3') targetBizId = 'mfg-wood-02';
    else if (scenario.id === 'S8') targetBizId = 'mfg-automotive-03';
    
    setActiveBusinessId(targetBizId);
    setSelectedScenarioId(scenario.id);
    
    // Calculate and load profile for targetBizId
    const result = classifyBusiness(newProfile);
    const { approvals: newApps, documents: newDocs } = generateComplianceRoadmap(newProfile, result);
    
    setBusinessData(prev => ({
      ...prev,
      [targetBizId]: {
        profile: newProfile,
        classification: result,
        approvals: newApps,
        documents: newDocs
      }
    }));
    setShowWizard(false);
    setActiveTab('Home');
  };

  const handleUpdateDocumentStatus = (docId: string, status: DocumentStatus, fileName?: string) => {
    setBusinessData(prev => ({
      ...prev,
      [activeBusinessId]: {
        ...prev[activeBusinessId],
        documents: prev[activeBusinessId].documents.map(d => 
          d.id === docId ? { ...d, status, fileName, uploadedAt: new Date().toLocaleDateString() } : d
        )
      }
    }));
    const docName = documents.find(d => d.id === docId)?.name || docId;
    addAuditLog('Document Status Update', `Set document status of ${docName} to: ${status}`);
  };

  const handleUpdateApprovalStage = (appId: string, stage: ApplicationStage) => {
    setBusinessData(prev => ({
      ...prev,
      [activeBusinessId]: {
        ...prev[activeBusinessId],
        approvals: prev[activeBusinessId].approvals.map(a => 
          a.id === appId ? { ...a, stage } : a
        )
      }
    }));
    const appName = approvals.find(a => a.id === appId)?.name || appId;
    addAuditLog('Application Stage Change', `Advanced ${appName} to stage: ${stage}`);
  };

  const handleAskAIChat = (question: string) => {
    setRightPanelOpen(true);
    // Find input element inside Chat Assistant and trigger query
    const chatInput = document.querySelector('input[placeholder*="Ask about"]') as HTMLInputElement;
    if (chatInput) {
      chatInput.value = question;
      const sendBtn = chatInput.nextElementSibling as HTMLButtonElement;
      if (sendBtn) {
        setTimeout(() => sendBtn.click(), 100);
      }
    }
  };

  const resetWorkspace = () => {
    setBusinessData(prev => ({
      ...prev,
      [activeBusinessId]: { profile: null, classification: null, approvals: [], documents: [] }
    }));
    setSelectedScenarioId('');
    setActiveTab('Home');
    addAuditLog('Workspace Cleared', `Purged active business profile on company: ${activeBusinessId}`);
  };

  const navLinks = user ? [
    'Home',
    'Approvals',
    'Documents',
    'Applications',
    'Security Center',
    'Business Journey',
    'Renewals',
    'Schemes',
    'AI Assistant',
    'Help'
  ] : [
    'Home',
    'How SolveX Works',
    'Supported Sectors',
    'Help'
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-slate-800 font-sans">
      
      {/* 1. BRAND NAVIGATION HEADER */}
      <header className="bg-[#0b1b3d] text-white border-b border-blue-950 shrink-0 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={resetWorkspace}>
              <div className="bg-blue-600 p-2 rounded text-white flex items-center justify-center font-bold text-lg tracking-wider font-sans">
                SX
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none">SolveX</h1>
                <p className="text-[10px] text-blue-300 font-medium tracking-wide">Activity-Aware Indian Compliance AI</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = activeTab === link;
                return (
                  <button
                    key={link}
                    onClick={() => {
                      setActiveTab(link);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition ${
                      isActive 
                        ? 'bg-blue-900 text-white font-bold' 
                        : 'text-blue-200 hover:text-white hover:bg-blue-950/50'
                    }`}
                  >
                    {link}
                  </button>
                );
              })}
            </nav>

            {/* Actions / Right header */}
            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <>
                  {/* Sandbox Multi-Business Switcher */}
                  <div className="flex items-center bg-blue-950/80 border border-blue-900 rounded px-2 py-1">
                    <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider mr-1.5">Sandbox Co:</span>
                    <select
                      value={activeBusinessId}
                      onChange={(e) => {
                        const targetId = e.target.value;
                        setActiveBusinessId(targetId);
                        addAuditLog('Business Unit Switched', `Switched active compliance sandbox to: ${targetId}`);
                        alert(`Sandbox switched to business: ${targetId === 'mfg-garments-01' ? 'Garment Factory' : targetId === 'mfg-wood-02' ? 'Furniture Assembly' : 'EV Auto Component'}`);
                      }}
                      className="bg-transparent text-white text-xs font-semibold focus:outline-none border-none cursor-pointer pr-1"
                    >
                      <option value="mfg-garments-01" className="bg-[#0b1b3d] text-white">Garment Factory</option>
                      <option value="mfg-wood-02" className="bg-[#0b1b3d] text-white">Furniture Assembly</option>
                      <option value="mfg-automotive-03" className="bg-[#0b1b3d] text-white">EV Auto Components</option>
                    </select>
                  </div>

                  {/* Logged User Avatar Button */}
                  <button
                    onClick={() => setActiveTab('Security Center')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-950 hover:bg-blue-900 rounded transition border border-blue-900"
                  >
                    <User className="h-3.5 w-3.5 text-blue-300" />
                    <span className="text-[11px] text-white font-medium">{user.name.split(' ')[0]} ({user.role})</span>
                  </button>

                  <button
                    onClick={() => {
                      setUser(null);
                      setActiveTab('Home');
                      addAuditLog('User Logout', `Revoked active session for ${user.email}`);
                      alert('You have logged out. All identity keys deactivated.');
                    }}
                    className="p-1.5 text-blue-300 hover:text-red-400 hover:bg-blue-950/50 rounded transition"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab('Security Center');
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase tracking-wider rounded transition flex items-center"
                >
                  <Lock className="h-3.5 w-3.5 mr-1.5" /> Sign In / Demo Auth
                </button>
              )}

              {profile && (
                <button
                  onClick={resetWorkspace}
                  className="px-3 py-1.5 border border-blue-900 hover:bg-blue-950 text-blue-200 hover:text-white text-[11px] font-bold uppercase tracking-wider rounded transition"
                >
                  New Analysis
                </button>
              )}
              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className={`p-2 rounded transition flex items-center space-x-1.5 ${
                  rightPanelOpen ? 'bg-blue-600 text-white' : 'bg-blue-950/40 text-blue-300 hover:text-white'
                }`}
                title="Toggle AI Side panel"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold">AI Coach</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-3">
              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="p-2 rounded bg-blue-950/40 text-blue-300 hover:text-white transition"
              >
                <Sparkles className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded text-blue-200 hover:text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-blue-950 bg-[#07132e] px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link;
              return (
                <button
                  key={link}
                  onClick={() => {
                    setActiveTab(link);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition ${
                    isActive ? 'bg-blue-900 text-white' : 'text-blue-300 hover:text-white hover:bg-blue-950'
                  }`}
                >
                  {link}
                </button>
              );
            })}
            {profile && (
              <button
                onClick={() => {
                  resetWorkspace();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded text-xs font-bold text-red-400 hover:bg-blue-950 uppercase"
              >
                Reset Workspace
              </button>
            )}
          </div>
        )}
      </header>

      {/* 2. MAIN LAYOUT SHELL */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Dynamic Workspace content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          
          {/* HOME TAB CONDITIONAL ROUTING */}
          {activeTab === 'Home' && (
            <div className="space-y-8">
              
              {/* If no profile loaded, show Startup Welcome & Scenarios list */}
              {!profile && !showWizard && (
                <div className="space-y-8">
                  
                  {/* Hero Intro banner */}
                  <div className="bg-white border border-slate-200 rounded-lg p-8 text-center max-w-4xl mx-auto space-y-5 shadow-xs">
                    <span className="text-xs uppercase font-bold tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      India Enterprise Facilitation Portal
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-950 font-sans tracking-tight max-w-2xl mx-auto leading-tight">
                      SolveX Business Approvals & Compliance AI
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl mx-auto font-sans">
                      Start your enterprise with flawless statutory alignment. SolveX calculates customized SPCB environmental clearances, municipal shop licenses, and document dependencies based on your exact physical processes.
                    </p>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      {user === null ? (
                        <>
                          <button
                            onClick={() => {
                              setActiveTab('Security Center');
                            }}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-md transition shadow-xs flex items-center"
                          >
                            Begin Setup (Start) <ChevronRight className="h-4 w-4 ml-1.5" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setActiveTab('Security Center');
                            }}
                            className="px-5 py-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-md transition"
                          >
                            Sign In / Access Account
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setShowWizard(true)}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-md transition shadow-xs flex items-center"
                        >
                          Start Activity Wizard <ChevronRight className="h-4 w-4 ml-1.5" />
                        </button>
                      )}
                      
                      <a
                        href="#scenarios"
                        className="px-5 py-3 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-md transition"
                      >
                        Explore Demo Scenarios ↓
                      </a>
                    </div>
                  </div>

                  {/* Scenarios Anchor */}
                  <div id="scenarios" className="max-w-6xl mx-auto pt-4">
                    <Scenarios 
                      onSelectScenario={handleSelectScenario} 
                      activeScenarioId={selectedScenarioId} 
                    />
                  </div>

                </div>
              )}

              {/* Wizard Onboarding Questionnaire */}
              {showWizard && (
                <div className="max-w-4xl mx-auto">
                  <div className="mb-4">
                    <button
                      onClick={() => setShowWizard(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center"
                    >
                      ← Back to Welcome Center
                    </button>
                  </div>
                  <Wizard onComplete={handleLoadProfile} initialProfile={profile || undefined} />
                </div>
              )}

              {/* Active Workspace Console Dashboard */}
              {profile && classification && !showWizard && (
                <div className="space-y-6">
                  <Dashboard 
                    profile={profile} 
                    classification={classification} 
                    approvals={approvals} 
                    documents={documents} 
                    onNavigateToTab={(tab) => {
                      if (tab === 'Wizard') {
                        setShowWizard(true);
                        setActiveTab('Home');
                      } else {
                        setActiveTab(tab);
                      }
                    }}
                    onUpdateDocumentStatus={handleUpdateDocumentStatus}
                    onUpdateApprovalStage={handleUpdateApprovalStage}
                  />
                </div>
              )}

            </div>
          )}

          {/* Security gating for authenticated features if user is not logged in */}
          {user === null && ['Approvals', 'Documents', 'Applications', 'Security Center', 'Business Journey', 'Renewals', 'Schemes', 'AI Assistant'].includes(activeTab) && activeTab !== 'Security Center' && (
            <div className="max-w-md mx-auto py-12 text-center space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-8 space-y-4 shadow-sm">
                <div className="mx-auto h-12 w-12 bg-blue-50 text-blue-900 border border-blue-100 rounded-full flex items-center justify-center">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Secure Area Restricted</h3>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  To protect sensitive identity files (Aadhaar, PAN, Lease deeds) and track your statutory filings securely, SolveX requires active user authentication.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] font-sans text-left">
                  <strong>Demo Credentials Available:</strong><br />
                  Email: <code className="font-mono bg-amber-100/60 px-1 py-0.2 rounded font-bold">demo@solvex.example</code><br />
                  Password: <code className="font-mono bg-amber-100/60 px-1 py-0.2 rounded font-bold">Demo@12345</code>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('Security Center');
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded transition"
                >
                  Sign In / Register Now
                </button>
              </div>
            </div>
          )}

          {/* SECURITY CENTER TAB */}
          {activeTab === 'Security Center' && (
            <div className="max-w-4xl mx-auto">
              <SecurityModule
                user={user}
                onLogin={(account) => {
                  setUser(account);
                  addAuditLog('User Login', `Authenticated successfully as ${account.email}`);
                  // If there's no active profile set, automatically prompt to start setup
                  const targetData = businessData[activeBusinessId];
                  if (!targetData || !targetData.profile) {
                    setShowWizard(true);
                  }
                  setActiveTab('Home');
                }}
                onLogout={() => {
                  setUser(null);
                  setActiveTab('Home');
                }}
                onUpdateUser={(updated) => {
                  setUser(updated);
                  addAuditLog('Profile Update', `Updated account configuration for ${updated.email}`);
                }}
                activeBusinessId={activeBusinessId}
                onSwitchBusiness={(bizId: string) => {
                  setActiveBusinessId(bizId);
                  addAuditLog('Business Unit Switched', `Switched active compliance sandbox to: ${bizId}`);
                }}
                documents={documents}
                auditLogs={auditLogs}
                onAddAuditLog={(action, details) => {
                  addAuditLog(action, details);
                }}
                onTriggerMfaChallenge={(actionLabel, onSuccess) => {
                  setReauthChallenge({ actionLabel, onSuccess });
                }}
              />
            </div>
          )}

          {/* APPROVALS TAB */}
          {activeTab === 'Approvals' && user && (
            <div className="max-w-6xl mx-auto">
              {profile ? (
                <ApprovalsPage 
                  approvals={approvals} 
                  documents={documents}
                  onUpdateApprovalStage={handleUpdateApprovalStage}
                  onNavigateToTab={setActiveTab}
                />
              ) : (
                <div className="text-center py-12 bg-white border rounded-lg max-w-xl mx-auto shadow-2xs space-y-4">
                  <ClipboardList className="h-12 w-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-base">No active business profile mapped</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Please load a demo scenario or fill in our activity wizard on the home tab to generate your custom approvals list.
                  </p>
                  <button onClick={() => setActiveTab('Home')} className="px-4 py-2 bg-[#0b1b3d] hover:bg-blue-900 text-white text-xs font-semibold rounded">
                    Go to Home Tab
                  </button>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'Documents' && user && (
            <div className="max-w-6xl mx-auto">
              {profile ? (
                <DocumentsPage 
                  documents={documents} 
                  approvals={approvals}
                  onUpdateDocumentStatus={handleUpdateDocumentStatus}
                  onAskAIChat={handleAskAIChat}
                  user={user}
                  onTriggerMfaChallenge={(actionLabel, onSuccess) => {
                    setReauthChallenge({ actionLabel, onSuccess });
                  }}
                />
              ) : (
                <div className="text-center py-12 bg-white border rounded-lg max-w-xl mx-auto shadow-2xs space-y-4">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-base">No active dossier calculated</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Please load a demo scenario or map your activities to generate your required documents list.
                  </p>
                  <button onClick={() => setActiveTab('Home')} className="px-4 py-2 bg-[#0b1b3d] hover:bg-blue-900 text-white text-xs font-semibold rounded">
                    Go to Home Tab
                  </button>
                </div>
              )}
            </div>
          )}

          {/* APPLICATIONS JOURNAL TAB (Visually tracks reference numbers and scrutiny stages) */}
          {activeTab === 'Applications' && user && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight">Active Government Submissions</h2>
                <p className="text-xs text-slate-500 mt-1">Simulate application reference logs, government scrutiny queries, and statutory field inspections.</p>
              </div>

              {profile && approvals.length > 0 ? (
                <div className="space-y-4">
                  {approvals.map((app) => {
                    return (
                      <div key={app.id} className="p-5 bg-white border border-slate-200 rounded-lg space-y-4 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">{app.name}</h3>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Portal: {app.portalName || 'Local Board Office'}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2.5 py-0.5 rounded leading-none">
                              {app.stage}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Application logs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-700">
                          <div className="space-y-1.5">
                            <strong className="text-slate-800 block">Scrutiny Stage:</strong>
                            <p className="text-slate-500 font-sans">
                              {app.stage === 'Requirement Identified' && "Your dossier papers are still missing or incomplete. Submit files to open the official portal."}
                              {app.stage === 'Documents Prepared' && "All mandatory filings have been completed. Securely copy to register."}
                              {app.stage === 'Application Submitted' && "Awaiting circle officer review of submission credentials."}
                              {app.stage === 'Government Scrutiny' && "State department is auditing your architectural site blueprints and capital valuations."}
                              {app.stage === 'Query / Clarification' && "ALERT: Department has issued an online clarification query regarding plant HP power load configurations."}
                              {app.stage === 'Inspection if applicable' && "FIELD INSPECTION ACTIVE: Fire services officer is visiting the physical site to check wet hydrant pressures."}
                              {app.stage.includes('Approval') && "CONGRATULATIONS: digitally-signed statutory certificate has been issued."}
                            </p>
                          </div>

                          <div className="p-3 bg-slate-50 rounded border space-y-2">
                            <strong className="text-[10px] uppercase font-bold text-slate-400 block">Simulation Console:</strong>
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] text-slate-500">Government reference ARN:</span>
                              <strong className="text-[11px] text-slate-800 font-mono">ARN-2026-X{app.id.toUpperCase().split('-')[1]}</strong>
                            </div>
                            <button
                              onClick={() => handleUpdateApprovalStage(app.id, 'Approval / Rejection')}
                              className="w-full py-1.5 bg-[#0b1b3d] hover:bg-blue-900 text-white text-[10px] font-bold uppercase tracking-wider rounded transition"
                            >
                              Simulate Instant Approval
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white border rounded-lg max-w-xl mx-auto shadow-2xs space-y-4">
                  <Clock className="h-12 w-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-base">No active submissions logged</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Please load a demo scenario or complete the activity wizard first.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI ASSISTANT FULL VIEW (Only shown when right panel is collapsed or selected in top nav) */}
          {activeTab === 'AI Assistant' && user && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl font-bold text-slate-950 tracking-tight">Full SolveX AI Coach Workspace</h2>
                <p className="text-xs text-slate-500">Interact in depth with our Indian statutory and industrial regulations database.</p>
              </div>
              <ChatAssistant 
                profile={profile} 
                classification={classification} 
                approvals={approvals} 
                documents={documents} 
              />
            </div>
          )}

          {/* GENERIC INFO VIEWS ROUTER */}
          {['How SolveX Works', 'Supported Sectors', 'Business Journey', 'Renewals', 'Schemes', 'Help'].includes(activeTab) && (
            <InfoViews 
              tab={activeTab} 
              profile={profile} 
              approvals={approvals} 
              documents={documents} 
              onNavigateToTab={setActiveTab}
            />
          )}

        </main>

        {/* Right Side: Persistent Collapsible Chat Assistant */}
        {rightPanelOpen && activeTab !== 'AI Assistant' && (
          <aside className="hidden lg:block w-80 border-l border-slate-200/80 bg-white shrink-0 relative flex flex-col justify-between animate-slideLeft">
            <div className="absolute top-1/2 -left-3 transform -translate-y-1/2 z-10">
              <button 
                onClick={() => setRightPanelOpen(false)}
                className="h-6 w-6 bg-slate-100 border hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center shadow-xs focus:outline-none"
              >
                &gt;
              </button>
            </div>
            <ChatAssistant 
              profile={profile} 
              classification={classification} 
              approvals={approvals} 
              documents={documents} 
            />
          </aside>
        )}

      </div>

      {/* Secure Re-authentication MFA Challenge Modal */}
      {reauthChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="text-center space-y-2">
              <span className="inline-flex bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Confirm Identity to Continue
              </span>
              <h4 className="text-slate-900 font-bold text-sm tracking-tight">Security Access Verification</h4>
              <p className="text-[11px] text-slate-500 font-sans leading-normal">
                You are performing a sensitive action: <strong className="text-slate-800">{reauthChallenge.actionLabel}</strong>. Please confirm with your registered 2FA credentials.
              </p>
            </div>

            <div className="p-2.5 bg-amber-50 text-amber-900 border border-amber-100 rounded text-[11px] font-mono text-center">
              Enter Sandbox verification code: <strong>123456</strong>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400 block text-center">6-Digit Access PIN</label>
              <input
                type="text"
                maxLength={6}
                value={reauthOtp}
                onChange={(e) => setReauthOtp(e.target.value)}
                placeholder="123456"
                className="w-32 mx-auto px-2 py-1.5 border border-slate-200 rounded text-base font-bold font-mono tracking-widest text-center bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:border-blue-600 block"
              />
            </div>

            {reauthError && (
              <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded text-center border border-red-100">
                {reauthError}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (reauthOtp === '123456') {
                    addAuditLog('Identity Confirmed', `Verified high-security challenge for: ${reauthChallenge.actionLabel}`);
                    reauthChallenge.onSuccess();
                    setReauthChallenge(null);
                    setReauthOtp('');
                    setReauthError('');
                  } else {
                    setReauthError('Invalid code. Please use sandbox demo PIN (123456).');
                  }
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded transition font-sans"
              >
                Verify & Continue
              </button>
              <button
                onClick={() => {
                  setReauthChallenge(null);
                  setReauthOtp('');
                  setReauthError('');
                }}
                className="px-4 py-2 border text-slate-500 text-xs font-bold uppercase rounded hover:bg-slate-50 transition font-sans"
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

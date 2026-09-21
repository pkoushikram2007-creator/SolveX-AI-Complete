import React, { useState } from 'react';
import { Approval, Document, ApplicationStage } from '../types';
import { 
  Filter, 
  MapPin, 
  Layers, 
  BookOpen, 
  Search, 
  X, 
  ExternalLink, 
  ArrowRight, 
  HelpCircle, 
  FileText, 
  GitCommit, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface ApprovalsPageProps {
  approvals: Approval[];
  documents: Document[];
  onUpdateApprovalStage: (appId: string, stage: ApplicationStage) => void;
  onNavigateToTab: (tabName: string) => void;
}

export default function ApprovalsPage({ approvals, documents, onUpdateApprovalStage, onNavigateToTab }: ApprovalsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stageFilter, setStageFilter] = useState<string>('All');
  
  // Selected approval for detailed drawer
  const [selectedApp, setSelectedApp] = useState<Approval | null>(null);

  // Filters calculation
  const filteredApprovals = approvals.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.authority.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || app.category === categoryFilter;
    const matchesStage = stageFilter === 'All' || app.stage === stageFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesStage;
  });

  const handleAdvanceStage = (appId: string, currentStage: ApplicationStage) => {
    const stages: ApplicationStage[] = [
      'Requirement Identified',
      'Documents Required',
      'Documents Prepared',
      'Documents Ready',
      'Open Official Portal',
      'Application Submitted',
      'Application Reference Number',
      'Government Scrutiny',
      'Query / Clarification',
      'Inspection if applicable',
      'Verification',
      'Decision',
      'Approval / Rejection',
      'Renewal'
    ];

    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      onUpdateApprovalStage(appId, nextStage);
      // Update selected app state if drawer is open
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, stage: nextStage });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Header and Statistics */}
      <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight">Required Statutory Approvals</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse and coordinate each mandatory environmental, safety, and commercial permit triggered by your business profile.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            Total approvals: {approvals.length}
          </span>
          <span className="font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
            Approved: {approvals.filter(a => a.stage === 'Approval / Rejection' || a.stage === 'Renewal').length}
          </span>
        </div>
      </div>

      {/* 2. Advanced Search & Filters Row */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search approvals by name or authority..."
            className="w-full pl-8 pr-4 py-1.5 border border-slate-200 rounded text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1 px-2 border border-slate-200 rounded text-xs bg-white text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Potentially Applicable">Potentially Applicable</option>
              <option value="Conditional">Conditional</option>
              <option value="Needs Verification">Needs Verification</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-1 px-2 border border-slate-200 rounded text-xs bg-white text-slate-700"
            >
              <option value="All">All Categories</option>
              <option value="Common">Common Start-up</option>
              <option value="Manufacturing">Manufacturing Safety</option>
              <option value="Environmental">Environmental Board</option>
              <option value="Retail">Retail Stores</option>
              <option value="Specific">Sector Specific</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Approvals Grid */}
      {filteredApprovals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApprovals.map((app) => {
            const linkedDocs = documents.filter(d => app.documentIds.includes(d.id));
            
            return (
              <div 
                key={app.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-5 flex flex-col justify-between h-[250px] transition shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">
                        {app.category} Clearance
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{app.name}</h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                      app.status === 'Potentially Applicable' 
                        ? 'bg-blue-50 text-blue-800 border border-blue-100' 
                        : 'bg-amber-50 text-amber-800 border border-amber-100'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                    {app.why}
                  </p>

                  <div className="flex items-center space-x-4 text-[10px] text-slate-400">
                    <span>Authority: <strong className="text-slate-600 font-semibold">{app.authority}</strong></span>
                    <span>•</span>
                    <span className="font-medium text-slate-500">{linkedDocs.length} Papers</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                  <div className="flex items-center text-[10px] text-slate-500 font-sans">
                    <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                    <span>Stage: <strong className="text-blue-700 font-semibold">{app.stage}</strong></span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-3 py-1.5 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 text-slate-700 hover:text-blue-900 text-xs font-semibold rounded transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAdvanceStage(app.id, app.stage)}
                      className="px-3 py-1.5 bg-[#0b1b3d] hover:bg-blue-900 text-white text-xs font-semibold rounded transition flex items-center"
                    >
                      Advance Stage <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-800 text-sm">No approvals found matching filters</h4>
          <p className="text-xs text-slate-400 mt-1">Try relaxing your search terms or filtering by standard categories.</p>
        </div>
      )}

      {/* 4. DETAIL DRAWER (MODAL OVERLAY) */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl h-full bg-white shadow-xl flex flex-col justify-between animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="bg-[#0b1b3d] text-white p-6 flex items-center justify-between border-b border-blue-900">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-300 tracking-widest">{selectedApp.category} Statutory Clearance</span>
                <h3 className="text-lg font-bold tracking-tight mt-1">{selectedApp.name}</h3>
                <p className="text-xs text-slate-300 font-sans mt-0.5">Administered by: {selectedApp.authority}</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="text-slate-300 hover:text-white p-1.5 rounded-full border border-blue-900 bg-blue-950/40 hover:bg-blue-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content (Showing all 16 requested points) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Point 1-4: Basic Applicability Overview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Applicability Diagnostics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                  <div className="p-3 bg-slate-50 rounded border">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Why it is required:</span>
                    <p className="text-slate-800 font-medium">{selectedApp.why}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Applicability Conditions:</span>
                    <p className="text-slate-800 font-medium">{selectedApp.condition}</p>
                  </div>
                </div>
              </div>

              {/* Point 5-6: Required documents & Document dependencies (Visual flow!) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Document Dependancy Network</h4>
                <p className="text-[10px] text-slate-400 font-sans leading-none">Visually tracing which prerequisite document unlocks this application submission.</p>
                
                <div className="p-4 bg-blue-50/20 border border-blue-100 rounded space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-blue-50/50 pb-2 mb-2">
                    <span className="font-bold text-blue-900 uppercase text-[10px]">Sequence Graph</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Requires {selectedApp.documentIds.length} prepared files</span>
                  </div>

                  <div className="flex flex-col md:flex-row items-center md:justify-around gap-4 text-center">
                    <div className="p-2.5 bg-white border border-slate-200 rounded w-full md:w-1/3">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Required Before</span>
                      <span className="block text-[11px] font-bold text-slate-700 truncate">PAN / Lease deed</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 hidden md:block" />
                    <div className="p-3 bg-blue-600 text-white rounded w-full md:w-2/5 ring-2 ring-blue-100">
                      <span className="block text-[8px] font-bold text-blue-200 uppercase">Active Application</span>
                      <span className="block text-xs font-bold truncate">{selectedApp.name.split(' (')[0]}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 hidden md:block" />
                    <div className="p-2.5 bg-white border border-slate-200 rounded w-full md:w-1/3">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Unlocks Next</span>
                      <span className="block text-[11px] font-bold text-slate-700 truncate">Factory / Operation CTO</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Prerequisite checklist files:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {documents.filter(d => selectedApp.documentIds.includes(d.id)).map(doc => (
                      <div key={doc.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{doc.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          doc.status === 'Uploaded' || doc.status === 'Ready for Application'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Point 7-12: Application procedure, submission, verification, and inspection */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Statutory Scrutiny Steps</h4>
                
                <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                  <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-md">
                    <strong className="text-slate-800 block mb-1">7. Complete Application Procedure:</strong>
                    <p className="font-sans leading-normal text-slate-600">{selectedApp.procedure}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-slate-800 block mb-0.5">8. Submission Method:</strong>
                      <span className="block text-slate-600 font-sans">{selectedApp.submissionMethod}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 block mb-0.5">9. Verification Audits:</strong>
                      <span className="block text-slate-600 font-sans">{selectedApp.verificationMethod}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 block mb-0.5">10. Physical Inspection Requirement:</strong>
                      <span className="block text-slate-600 font-sans">{selectedApp.inspectionRequirement}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 block mb-0.5">11. Query Clarification Handling:</strong>
                      <span className="block text-slate-600 font-sans">{selectedApp.queryHandling}</span>
                    </div>
                  </div>

                  <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-md">
                    <strong className="text-slate-800 block mb-0.5">12. Formal Approval Document Issued:</strong>
                    <span className="block text-slate-600 font-sans">{selectedApp.issuedForm}</span>
                  </div>
                </div>
              </div>

              {/* Point 13-14: Validity & Renewal Requirements */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Validity & Renewal Cycles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 border rounded">
                    <strong className="text-slate-800 block mb-1">13. Initial Certificate Validity:</strong>
                    <p className="text-slate-600 font-sans leading-relaxed">{selectedApp.validityYears}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded">
                    <strong className="text-slate-800 block mb-1">14. Renewal Cycle & Conditions:</strong>
                    <p className="text-slate-600 font-sans leading-relaxed">{selectedApp.renewalProcedure}</p>
                  </div>
                </div>
              </div>

              {/* Point 15-16: Official Portal System (Standard government appearance URL buttons) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">15-16. Official Portal System</h4>
                
                <div className="p-4 bg-slate-100 border rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Government Service URL:</span>
                    <span className="text-xs font-bold text-slate-800 block">{selectedApp.portalName || 'Local Municipal Portal'}</span>
                    <span className="text-[10px] text-slate-500 block leading-none">Service: {selectedApp.serviceName} • Type: {selectedApp.applicationType}</span>
                  </div>

                  {selectedApp.portalUrl ? (
                    <a
                      href={selectedApp.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center shrink-0 self-start sm:self-center"
                    >
                      Open Official Portal ↗
                    </a>
                  ) : (
                    <div className="flex flex-col gap-2 shrink-0 self-start sm:self-center">
                      <span className="text-[10px] font-semibold text-slate-400 italic block leading-none">Official portal not verified</span>
                      <button 
                        onClick={() => alert(`Department Contact Info:\n${selectedApp.authority}\nService Desk: 1800-XX-XXXX`)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded transition"
                      >
                        View Authority Information
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Footer Status Simulator */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center text-xs text-slate-500">
                <Clock className="h-4 w-4 mr-1 text-slate-400 animate-spin" />
                <span>Simulated Journey Level: <strong>{selectedApp.stage}</strong></span>
              </div>
              <button
                onClick={() => handleAdvanceStage(selectedApp.id, selectedApp.stage)}
                className="px-4 py-2 bg-[#0b1b3d] hover:bg-blue-900 text-white text-xs font-semibold rounded transition"
              >
                Advance Application Journey →
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

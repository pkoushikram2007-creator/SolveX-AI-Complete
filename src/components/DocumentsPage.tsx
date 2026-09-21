import React, { useState } from 'react';
import { Document, DocumentStatus, Approval } from '../types';
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  HelpCircle, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Clock, 
  ArrowUpRight, 
  Sparkles,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

import { UserAccount } from './SecurityModule';

interface DocumentsPageProps {
  documents: Document[];
  approvals: Approval[];
  onUpdateDocumentStatus: (docId: string, status: DocumentStatus, fileName?: string) => void;
  onAskAIChat: (question: string) => void;
  user?: UserAccount | null;
  onTriggerMfaChallenge: (actionLabel: string, onSuccess: () => void) => void;
}

export default function DocumentsPage({ 
  documents, 
  approvals, 
  onUpdateDocumentStatus, 
  onAskAIChat,
  user,
  onTriggerMfaChallenge
}: DocumentsPageProps) {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for uploading
  const [uploadingDoc, setUploadingDoc] = useState<Document | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  // Selected document for detail drawer
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Filter logic
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (activeFilter !== 'All') {
      if (activeFilter === 'Missing') {
        matchesStatus = doc.status === 'Missing' || doc.status === 'Required';
      } else {
        matchesStatus = doc.status === activeFilter;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  const triggerUpload = (doc: Document) => {
    setUploadingDoc(doc);
    setUploadedFileName(`${doc.name.toLowerCase().replace(/\s+/g, '_')}_final.pdf`);
  };

  const handleConfirmUpload = () => {
    if (uploadingDoc) {
      onUpdateDocumentStatus(uploadingDoc.id, 'Uploaded', uploadedFileName);
      setUploadingDoc(null);
      setUploadedFileName('');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Page Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight font-semibold">Document Inventory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your dossier of entity proofs, layout plans, and licenses. SolveX alerts you which documents are missing for your licenses.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-slate-100 p-1 rounded-md">
          <button
            onClick={() => setActiveFilter('All')}
            className={`px-3 py-1 rounded font-semibold transition ${activeFilter === 'All' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            All ({documents.length})
          </button>
          <button
            onClick={() => setActiveFilter('Missing')}
            className={`px-3 py-1 rounded font-semibold transition ${activeFilter === 'Missing' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Missing ({documents.filter(d => d.status === 'Missing' || d.status === 'Required').length})
          </button>
          <button
            onClick={() => setActiveFilter('Uploaded')}
            className={`px-3 py-1 rounded font-semibold transition ${activeFilter === 'Uploaded' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Uploaded ({documents.filter(d => d.status === 'Uploaded').length})
          </button>
        </div>
      </div>

      {/* 2. Search Box */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search documents by certificate name..."
          className="w-full pl-8 pr-4 py-1.5 border border-slate-200 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-600 placeholder-slate-400"
        />
      </div>

      {/* 3. Document Cards Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const linkedApprovals = approvals.filter(a => doc.usedForApprovals.includes(a.id));
            const isUploaded = doc.status === 'Uploaded' || doc.status === 'Ready for Application' || doc.status === 'Approved';
            
            return (
              <div 
                key={doc.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-5 flex flex-col justify-between h-[250px] transition shadow-2xs animate-fadeIn"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 shrink-0">
                      <FileText className={`h-5 w-5 ${isUploaded ? 'text-emerald-600' : 'text-slate-400'}`} />
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isUploaded 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-800 border border-amber-100'
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">{doc.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">Who Issues: {doc.whoIssues}</p>
                    <p className="text-[11px] text-slate-500 leading-normal mt-1.5 line-clamp-2">{doc.whyNeeded}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 flex flex-col space-y-3">
                  <div className="flex items-center text-[9px] text-slate-400 truncate">
                    <Layers className="h-3 w-3 mr-1 text-slate-400 shrink-0" />
                    <span>Used For: {linkedApprovals.map(a => a.name.split(' (')[0]).join(', ')}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="text-[10px] font-bold text-slate-600 hover:text-blue-900 flex items-center"
                    >
                      View Details
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onAskAIChat(`Which approval is this document for? ${doc.name}`)}
                        className="p-1.5 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 text-slate-500 hover:text-blue-900 rounded transition"
                        title="Ask AI details about this paper"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </button>
                      {isUploaded ? (
                        <button
                          onClick={() => {
                            const isSensitive = doc.name.toLowerCase().includes('pan') || doc.name.toLowerCase().includes('aadhaar') || doc.name.toLowerCase().includes('lease') || doc.name.toLowerCase().includes('deed');
                            if (isSensitive && user && (user.role === 'Staff' || user.role === 'Support')) {
                              alert(`Access Denied: Your current role (${user.role}) is restricted from decrypting highly sensitive identity dossiers.`);
                              return;
                            }
                            if (isSensitive) {
                              onTriggerMfaChallenge(`Download Decrypted copy of ${doc.name}`, () => {
                                alert(`✓ File download initiated: Decrypted ${doc.name} has been securely generated and downloaded.`);
                              });
                            } else {
                              alert(`✓ General File downloaded: ${doc.name}.`);
                            }
                          }}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider rounded transition flex items-center"
                        >
                          <Download className="h-3 w-3 mr-1.5" /> Download
                        </button>
                      ) : (
                        <button
                          onClick={() => triggerUpload(doc)}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider rounded transition flex items-center"
                        >
                          <Upload className="h-3 w-3 mr-1.5" /> Upload
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          <FolderOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-800 text-sm">No documents matching your filter</h4>
          <p className="text-xs text-slate-400 mt-1">Try toggling All or typing different search criteria.</p>
        </div>
      )}

      {/* 4. MODAL SIMULATED UPLOADER */}
      {uploadingDoc && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden animate-zoomIn">
            <div className="bg-[#0b1b3d] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Simulated PDF File Uploader</h3>
                <p className="text-[10px] text-blue-300">File validator for SolveX digital lockers</p>
              </div>
              <button onClick={() => setUploadingDoc(null)} className="text-slate-300 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-6 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-lg text-center bg-slate-50/50 cursor-pointer transition">
                <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <span className="text-xs font-semibold text-slate-700 block">Drag & Drop your file here</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Supports PDF, JPG, PNG up to 5MB</span>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dossier File Name:</label>
                <input
                  type="text"
                  value={uploadedFileName}
                  onChange={(e) => setUploadedFileName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 bg-white"
                />
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded text-[11px] text-slate-600 leading-normal">
                Uploading a mock document will transition status to <strong className="text-slate-800 font-bold uppercase">Uploaded</strong>, advancing your readiness indicators dynamically in the console.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button onClick={() => setUploadingDoc(null)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded">
                Cancel
              </button>
              <button onClick={handleConfirmUpload} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded">
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DOCUMENT DETAIL DRAWER */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl h-full bg-white shadow-xl flex flex-col justify-between animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="bg-[#0b1b3d] text-white p-6 flex items-center justify-between border-b border-blue-900 shrink-0">
              <div>
                <span className="text-[9px] font-bold uppercase text-blue-300 tracking-widest">Document Dossier Detail</span>
                <h3 className="text-base font-bold tracking-tight mt-1">{selectedDoc.name}</h3>
                <span className="text-[10px] font-bold bg-blue-950/40 text-blue-300 px-2 py-0.5 rounded border border-blue-900/60 mt-1 inline-block uppercase">
                  Status: {selectedDoc.status}
                </span>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="text-slate-300 hover:text-white p-1.5 rounded-full border border-blue-900 bg-blue-950/40 hover:bg-blue-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body - Detailed information of the Document (11 requested items) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Item 1: Why you need it */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">1. Why you need it</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">{selectedDoc.whyNeeded}</p>
              </div>

              {/* Item 2: Which approval requires it */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">2. Associated Government Approvals</h4>
                <div className="flex flex-wrap gap-1.5">
                  {approvals.filter(a => selectedDoc.usedForApprovals.includes(a.id)).map(a => (
                    <span key={a.id} className="text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-100 px-2 py-1 rounded">
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Item 3-4: How to obtain & Who issues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">3. How to Obtain</h4>
                  <p className="text-xs text-slate-700 leading-normal">{selectedDoc.howToObtain}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">4. Issuing Authority</h4>
                  <p className="text-xs text-slate-700 leading-normal font-semibold text-slate-800">{selectedDoc.whoIssues}</p>
                </div>
              </div>

              {/* Item 5: What information is required */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">5. Information Required inside Document</h4>
                <ul className="space-y-1 text-xs text-slate-600">
                  {selectedDoc.infoRequired ? selectedDoc.infoRequired.map((info, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{info}</span>
                    </li>
                  )) : (
                    <li className="italic">Standard corporate entity details</li>
                  )}
                </ul>
              </div>

              {/* Item 6-7: Prep steps & Upload requirements */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">6. Preparation Steps</h4>
                  <ol className="space-y-2 text-xs text-slate-600 list-decimal pl-4">
                    {selectedDoc.prepSteps ? selectedDoc.prepSteps.map((step, idx) => (
                      <li key={idx} className="leading-normal">{step}</li>
                    )) : (
                      <li>Log in and fill required form parameters on the portal.</li>
                    )}
                  </ol>
                </div>

                <div className="p-3 bg-slate-50 border rounded text-xs">
                  <strong className="text-slate-800 block mb-1 font-semibold">7. Scan & Upload Requirements:</strong>
                  <span className="text-slate-600 block">{selectedDoc.uploadRequirements || 'Scanned clear PDF, under 2MB size limit.'}</span>
                </div>
              </div>

              {/* Item 8-10: Verification Stage, Validity & Renewal Requirements */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">8-10. Validity and Renewal Cycles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-yellow-50/20 border border-yellow-100 rounded">
                    <strong className="text-amber-900 block mb-1">Document Validity:</strong>
                    <span className="text-slate-700 block font-medium leading-relaxed">{selectedDoc.validity}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded">
                    <strong className="text-slate-800 block mb-1">Renewal Requirements:</strong>
                    <span className="text-slate-600 block leading-relaxed">{selectedDoc.renewalRequirements}</span>
                  </div>
                </div>
              </div>

              {/* Document Dependencies network */}
              {selectedDoc.dependencies && selectedDoc.dependencies.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Document Dependency Chain</h4>
                  <div className="space-y-1.5">
                    {selectedDoc.dependencies.map((dep, idx) => (
                      <div key={idx} className="p-2 bg-blue-50/30 border border-blue-100/50 rounded flex items-center justify-between text-xs">
                        <span className="font-medium text-blue-950">{dep.documentName}</span>
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                          {dep.relationship}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer Actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  onAskAIChat(`Why do I need ${selectedDoc.name}?`);
                }}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center"
              >
                Ask AI about this dossier →
              </button>
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  triggerUpload(selectedDoc);
                }}
                className="px-4 py-2 bg-[#0b1b3d] hover:bg-blue-900 text-white text-xs font-semibold rounded transition"
              >
                Simulate Upload Now
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

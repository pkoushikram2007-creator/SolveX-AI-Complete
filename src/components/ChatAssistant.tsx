import React, { useState, useEffect, useRef } from 'react';
import { BusinessProfile, ClassificationResult, Approval, Document, ChatMessage } from '../types';
import { Send, Sparkles, MessageCircle, RefreshCw, Bookmark, HelpCircle } from 'lucide-react';

interface ChatAssistantProps {
  profile: BusinessProfile | null;
  classification: ClassificationResult | null;
  approvals: Approval[];
  documents: Document[];
}

export default function ChatAssistant({ profile, classification, approvals, documents }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const starterQuestions = [
    "What documents do I need?",
    "Why do I need this approval?",
    "Where do I apply?",
    "Can I apply before getting the land?",
    "What document am I missing?",
    "What should I do after submitting?",
    "Which approval is this document for?"
  ];

  useEffect(() => {
    // Generate initial welcome message based on active scenario
    let text = "Namaste! I am SolveX, your activity-aware business compliance assistant. ";
    if (profile && classification) {
      text += `I have analyzed your business: **${classification.sectorName} (${classification.businessModel})**. I can guide you through the exact registrations, documents, SPCB clearances, and municipal shop approvals required for your operations in **${profile.location.city}, ${profile.location.state}**. \n\nAsk me anything! What would you like to clarify?`;
    } else {
      text += "Select a sector or load an interactive demo scenario above. I will automatically analyze your activity parameters and answer any specific compliance, portal, or sequence query!";
    }

    setMessages([
      {
        id: 'initial',
        sender: 'assistant',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [profile, classification]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateAIResponse = (query: string): string => {
    if (!profile || !classification) {
      return "Please select a sector or load a business scenario profile first, so I can analyze the exact activities and give you custom regulatory answers rather than generic advice.";
    }

    const q = query.toLowerCase();

    // Q1: What documents do I need?
    if (q.includes('document') && q.includes('need')) {
      const docList = documents.map(d => `• **${d.name}** (Issued by: ${d.whoIssues})`).join('\n');
      return `Based on your business activity (**${classification.primaryActivity}** with **${classification.businessModel}** in ${profile.location.state}), you require the following **${documents.length} mandatory documents**:\n\n${docList}\n\nWould you like me to explain how to prepare any specific document?`;
    }

    // Q2: Why do I need this approval?
    if (q.includes('why') && (q.includes('approval') || q.includes('license') || q.includes('consent'))) {
      const appReasons = approvals.map(a => `• **${a.name}**: Required because *${a.why}* (Under condition: ${a.condition})`).join('\n\n');
      return `Here are the detailed regulatory reasons for your required approvals:\n\n${appReasons}\n\nSince your business model triggers **${classification.riskComplianceFactors.length} compliance factors** (e.g. *${classification.riskComplianceFactors[0]}*), these clearances are legally binding before starting operations.`;
    }

    // Q3: Where do I apply?
    if (q.includes('where') && (q.includes('apply') || q.includes('portal'))) {
      const portals = approvals
        .filter(a => a.portalName)
        .map(a => `• **${a.name}**: Apply on the **${a.portalName}** ${a.portalUrl ? `(${a.portalUrl})` : '(No verified direct portal)'}`)
        .join('\n');
      return `You must submit your applications on the respective government portals:\n\n${portals}\n\nSolveX has embedded the official links in your **Approvals Dashboard**. You can click the "Open Official Portal ↗" button to register your business directly.`;
    }

    // Q4: Can I apply before getting the land?
    if (q.includes('before') && q.includes('land')) {
      return `No, you cannot complete most statutory applications before securing your physical premises. \n\nBoth **GST Registration** and **Consent to Establish (CTE)** require uploading a **Registered Rent/Lease Agreement** or **Sale Deed** as mandatory address proof. We recommend finalizing your lease on stamp paper first, as it forms the baseline document for all subsequent industrial safety and environmental clearances.`;
    }

    // Q5: What document am I missing?
    if (q.includes('missing') || q.includes('upload') || q.includes('prepare')) {
      const missingDocs = documents.filter(d => d.status === 'Missing' || d.status === 'Required');
      if (missingDocs.length === 0) {
        return "Excellent! All your mandatory documents have been prepared or marked as uploaded in your SolveX tracker. You are ready to open the official application portals!";
      }
      const missingList = missingDocs.map(d => `• **${d.name}** (Needed for: ${d.usedForApprovals.map(aid => approvals.find(a => a.id === aid)?.name || aid).join(', ')})`).join('\n');
      return `You are currently missing **${missingDocs.length} key documents**:\n\n${missingList}\n\nYou can click on each document in the "Documents" tab to view specific preparation steps and list of information required.`;
    }

    // Q6: What should I do after submitting?
    if (q.includes('after') && (q.includes('submit') || q.includes('scrutiny'))) {
      return `After submitting your application on the official government portal, follow this exact SolveX tracked journey:
1. **Record Application Reference Number (ARN)** on the SolveX applications dashboard.
2. **Track Online Government Scrutiny**: Department officers review documents within 7-15 days.
3. **Handle Queries**: If officers issue a clarification query, log back into the portal and respond within 7 days (or risk rejection).
4. **Prepare for Field Inspection**: Fire officers or SPCB scientists may visit the physical site. Ensure layout plans match physical machinery coordinates.
5. **Receive digitally signed Certificate** and upload it to SolveX for validity and renewal alerts.`;
    }

    // Q7: Which approval is this document for?
    if (q.includes('which approval') || q.includes('used for')) {
      const linkages = documents.map(d => {
        const linkedApps = d.usedForApprovals.map(aid => approvals.find(a => a.id === aid)?.name || aid).join(', ');
        return `• **${d.name}** is used for: **${linkedApps}**`;
      }).join('\n');
      return `Here is how your documents map directly to government approvals:\n\n${linkages}\n\nNotice that primary identity documents like **Business PAN** and **Address Proof** are required across multiple applications, while site blueprints are specific to factory and environmental safety clearances.`;
    }

    // Custom text search questions
    if (q.includes('pollution') || q.includes('spcb') || q.includes('consent') || q.includes('water')) {
      const hasCTE = approvals.find(a => a.id === 'app-cte');
      if (hasCTE) {
        return `Your business **requires** SPCB Consent to Establish (${hasCTE.name.split('-')[1] || 'Environmental'}). This is because your process is classified under **${classification.processType}** using **${profile.projectSize.water} KLD** water. You must construct an ETP or join a CETP as indicated in your profile details before starting machinery setup.`;
      } else {
        return `Your business is currently classified in a low-pollution category (**White or Exempted**). SPCB environmental consents are **Not Applicable** because you are running a dry commercial process. You only need standard GST and Shop registrations.`;
      }
    }

    if (q.includes('battery') || q.includes('ev') || q.includes('lithium')) {
      const hasBWMR = approvals.find(a => a.id === 'app-bwmr');
      if (hasBWMR) {
        return `Yes, your battery pack operations trigger the **Battery Waste Management Rules (BWMR) 2022**. You must register with the CPCB and establish an EPR (Extended Producer Responsibility) contract to recycle spent lithium cells. Failing to do so triggers severe financial penalties under Indian environmental law.`;
      }
    }

    if (q.includes('factory') || q.includes('employee') || q.includes('worker') || q.includes('power')) {
      const hasFactory = approvals.find(a => a.id === 'app-factory');
      if (hasFactory) {
        return `Yes, with **${profile.projectSize.employees} employees** and **${profile.projectSize.power} HP power load**, your facility qualifies as a 'Factory' under the Factories Act 1948. You must secure a DISH Factory License, submit building stability certificates, and undergo structural safety inspections.`;
      } else {
        return `With only **${profile.projectSize.employees} workers**, your business falls below the statutory threshold (10 workers with power) for the Factories Act 1948. A formal Factory License is **Not Applicable**; your workspace is regulated simply under the municipal Shop & Establishment permit.`;
      }
    }

    // Default reply
    return `I understand you are asking about compliance parameters for starting a **${classification.sectorName}** business. \n\nUnder your current setup (${profile.projectSize.investment} Lakhs investment, ${profile.projectSize.employees} employees), you must focus on obtaining your **GST registration** and **Address lease deeds** first, as they unlock the rest of your **${approvals.length} required approvals**. \n\nIs there a specific registration or preparation step you would like me to detail?`;
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI response delay
    setTimeout(() => {
      const aiReplyText = generateAIResponse(userMsg.text);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 400);
  };

  const handleSuggestionClick = (question: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const aiReplyText = generateAIResponse(question);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 400);
  };

  return (
    <div className="flex flex-col h-[520px] bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
      {/* AI Assistant Header */}
      <div className="bg-[#0b1b3d] text-white px-4 py-3.5 flex items-center justify-between border-b border-blue-900 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600/30 p-1.5 rounded-full">
            <Sparkles className="h-4 w-4 text-blue-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight leading-tight">SolveX AI Compliance Assistant</h3>
            <p className="text-[10px] text-blue-300 leading-none">Activity-Aware Expert System</p>
          </div>
        </div>
        <button 
          onClick={() => {
            if (profile) {
              setMessages(prev => [
                {
                  id: `reset-${Date.now()}`,
                  sender: 'assistant',
                  text: `Session re-aligned with profile: **${classification?.sectorName} (${classification?.businessModel})**. Ask me anything!`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            }
          }}
          className="text-blue-300 hover:text-white p-1 rounded transition"
          title="Reset chat session"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div 
              key={m.id} 
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div 
                className={`max-w-[85%] px-3 py-2.5 rounded-lg text-xs leading-relaxed whitespace-pre-line ${
                  isUser 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 font-sans px-1">
                {m.timestamp}
              </span>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Question Suggestions panel (horizontal scroll) */}
      <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center space-x-2 overflow-x-auto shrink-0 scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Ask AI:</span>
        {starterQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => handleSuggestionClick(q)}
            className="text-[10px] px-2.5 py-1 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 text-slate-600 hover:text-blue-900 rounded-full shrink-0 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={profile ? "Ask about CTE, factory thresholds, or portal URLs..." : "Load a scenario to ask specific questions..."}
          disabled={!profile}
          className="flex-1 p-2 border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-600 disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!input.trim() || !profile}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2 rounded transition shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}

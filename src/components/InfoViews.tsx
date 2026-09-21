import React from 'react';
import { BusinessProfile, Approval, Document } from '../types';
import { 
  BookOpen, 
  HelpCircle, 
  Award, 
  MapPin, 
  BadgeCheck, 
  Activity, 
  Calendar, 
  ArrowRight, 
  FileClock,
  Clock,
  AlertTriangle,
  Lightbulb,
  Cpu
} from 'lucide-react';

interface InfoViewsProps {
  tab: string;
  profile: BusinessProfile | null;
  approvals: Approval[];
  documents: Document[];
  onNavigateToTab: (tabName: string) => void;
}

export default function InfoViews({ tab, profile, approvals, documents, onNavigateToTab }: InfoViewsProps) {
  
  if (tab === 'How SolveX Works') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight font-semibold">How SolveX Works</h2>
          <p className="text-xs text-slate-500 mt-1">Discover how our activity-aware engine eliminates generic checklists and calculates precise Indian statutory requirements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3 shadow-2xs">
            <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-center">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-950 text-sm">1. Activity Classification</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Instead of categorizing every business generically as 'manufacturing', SolveX parses exact chemical and physical processes (e.g., wood-shaping, wet fabric bleaching, battery soldering) to map specific safety thresholds.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3 shadow-2xs">
            <div className="h-10 w-10 bg-orange-50 border border-orange-100 rounded-md flex items-center justify-center">
              <Cpu className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-slate-950 text-sm">2. SPCB Pollution Grids</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              We apply official Central Pollution Control Board (CPCB) color zoning (Red, Orange, Green, White) dynamically based on daily wastewater quantities, chemical storage, and boiler specifications.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3 shadow-2xs">
            <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-md flex items-center justify-center">
              <BadgeCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-950 text-sm">3. Statutory Sequences</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              We map prerequisite document trees. Our logical sequencing engine tells you exactly what files must be ready (e.g., Land deed before GST, GST before Shop permit, CTE before Factory safety).
            </p>
          </div>
        </div>

        <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg flex items-start space-x-3 text-xs leading-relaxed text-slate-700">
          <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-slate-900">Important Note for First-time Entrepreneurs:</strong> SolveX acts as an intelligence companion mapping the exact legal compliance footprint. Applications must ultimately be completed on the official Indian central/state single-window portals which we link directly inside the clearances panel.
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'Supported Sectors') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight font-semibold">Currently Supported Sectors</h2>
          <p className="text-xs text-slate-500 mt-1">Explore the dynamic regulatory grids mapped for our initial target sectors in India.</p>
        </div>

        <div className="space-y-4">
          {/* Furniture */}
          <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">A. Furniture & Wood Products</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Covers modular kitchens, solid-wood handcraft units, panel processing, and timber trading. Compliance ranges from simple local Shop permits for showrooms up to Orange SPCB environmental CTE approvals and DISH Factory registrations for high-HP wood cutting and spray polishing facilities.
            </p>
          </div>

          {/* Textiles */}
          <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">B. Textiles & Garments</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Maps school uniform factories, boutique tailors, and heavy chemical dye houses. Differentiates dry sewing workshops (which enjoy Green/White low-pollution classifications) from wet-bleaching and boiler processes that legally trigger Red SPCB effluent restrictions, mandatory CETP enrollment, and Chief Inspector boiler audits.
            </p>
          </div>

          {/* Automotive */}
          <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">C. Automobiles & EV</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Traces electric two-wheeler dealerships, repair workshops, high-HP motor machining, and specialized lithium-ion battery pack assemblers. Highlights the difference between cell chemical manufacturing and clean assembly, triggering specialized CPCB Battery Waste Management Rules (BWMR) and safety vents.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'Business Journey') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight font-semibold">The Entrepreneur Compliance Journey</h2>
          <p className="text-xs text-slate-500 mt-1">Traces the complete statutory pathway of starting, applying, and securing approvals in India.</p>
        </div>

        <div className="relative border-l-2 border-blue-100 pl-6 ml-4 space-y-8 py-2">
          <div className="relative">
            <div className="absolute -left-10 top-0.5 bg-blue-600 text-white text-[10px] h-6 w-6 rounded-full flex items-center justify-center font-bold">1</div>
            <h4 className="font-bold text-slate-900 text-sm">Activity & Process Mapping</h4>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">Analyze exact processes (cutting, painting, assembly) instead of generic sectors to identify matching SPCB, DISH, or CPCB triggers.</p>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-0.5 bg-blue-600 text-white text-[10px] h-6 w-6 rounded-full flex items-center justify-center font-bold">2</div>
            <h4 className="font-bold text-slate-900 text-sm">Dossier Preparation</h4>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">Gather foundational entity identifiers (PAN, GSTIN) and premises contracts. Create approved site layout plans and architectural clearances.</p>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-0.5 bg-blue-600 text-white text-[10px] h-6 w-6 rounded-full flex items-center justify-center font-bold">3</div>
            <h4 className="font-bold text-slate-900 text-sm">Pre-Construction Clearances (CTE)</h4>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">Apply for SPCB Consent to Establish and Factory Layout plan approvals *before* pouring concrete or erecting machinery.</p>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-0.5 bg-blue-600 text-white text-[10px] h-6 w-6 rounded-full flex items-center justify-center font-bold">4</div>
            <h4 className="font-bold text-slate-900 text-sm">Physical Auditing & Inspections</h4>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">Undergo safety audits by municipal fire departments, DISH factory inspectors, and SPCB field officers to test emergency alarms and water traps.</p>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-0.5 bg-blue-600 text-white text-[10px] h-6 w-6 rounded-full flex items-center justify-center font-bold">5</div>
            <h4 className="font-bold text-slate-900 text-sm">Consent to Operate & Licensing</h4>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">Secure final operating consents, open the official portals, file application parameters, and start commercial manufacturing or retail sales.</p>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'Renewals') {
    // Validity & Expiration alert dashboard
    const activeRenewals = approvals.filter(a => a.validityYears && a.validityYears !== 'Perpetual');
    
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight font-semibold">License Renewals & Validity Tracker</h2>
          <p className="text-xs text-slate-500 mt-1">Monitor expiration timelines and set automated statutory alerts to avoid municipal fines.</p>
        </div>

        {activeRenewals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRenewals.map((app) => (
              <div key={app.id} className="p-5 bg-white border border-slate-200 rounded-lg space-y-4 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{app.name}</h3>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Administered by: {app.authority}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded">
                    Action Required
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-100 py-3 my-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Validity Duration:</span>
                    <span className="font-semibold text-slate-800">{app.validityYears}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Renewal Cycle:</span>
                    <span className="font-semibold text-slate-800">Pre-expiry (30-60 days)</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Renewal Procedure:</span>
                  <p className="text-slate-600 leading-normal font-sans">{app.renewalProcedure}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
            <FileClock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-800 text-sm">No expiration tracking active</h4>
            <p className="text-xs text-slate-400 mt-1">Configure your business sector or load a manufacturing scenario to track annual renewals.</p>
          </div>
        )}
      </div>
    );
  }

  if (tab === 'Schemes') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight font-semibold">Government MSME Support Schemes</h2>
          <p className="text-xs text-slate-500 mt-1">Explore subsidy programs and collateral-free lending available for registered Udyam MSMEs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3">
            <span className="text-[9px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded uppercase">Credit Link Subsidy</span>
            <h3 className="font-bold text-slate-900 text-sm">PMEGP Scheme</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Prime Minister Employment Generation Programme offers up to **35% subsidy** on capital investments for manufacturing projects up to ₹50 Lakhs setup in rural districts.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3">
            <span className="text-[9px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded uppercase">Collateral Free Loan</span>
            <h3 className="font-bold text-slate-900 text-sm">CGTMSE Trust Guarantee</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Credit Guarantee Fund Trust for Micro and Small Enterprises provides third-party credit guarantee cover up to **₹5 Crores** without requiring collateral property bindings.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-3">
            <span className="text-[9px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded uppercase">Interest Subvention</span>
            <h3 className="font-bold text-slate-900 text-sm">SIDBI Smile Scheme</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              SIDBI Make in India Soft Loan Fund for Micro, Small & Medium Enterprises provides low-interest soft loans and capital growth financing for eligible machinery setups.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Help Desk FAQ
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight font-semibold">SolveX Help Desk FAQs</h2>
        <p className="text-xs text-slate-500 mt-1">Frequently asked compliance and licensing questions resolved for first-time entrepreneurs.</p>
      </div>

      <div className="space-y-4 text-xs">
        <div className="p-4 bg-white border rounded-lg space-y-2">
          <strong className="text-slate-900 block text-sm font-semibold">Q. What happens if I operate without SPCB Consent (CTE/CTO)?</strong>
          <p className="text-slate-600 leading-relaxed">
            Operating a manufacturing process or wet dyeing unit without obtaining SPCB Consent is a cognizable offense under the Water and Air Acts. SPCB holds powers to issue closure notices and cut off electricity/water connections to the premises.
          </p>
        </div>

        <div className="p-4 bg-white border rounded-lg space-y-2">
          <strong className="text-slate-900 block text-sm font-semibold">Q. Can I use a residential lease for GST Registration?</strong>
          <p className="text-slate-600 leading-relaxed">
            Yes, but you must obtain a commercial No Objection Certificate (NOC) from the landlord and submit electricity bills detailing the non-residential usage to clear State tax circle audits.
          </p>
        </div>

        <div className="p-4 bg-white border rounded-lg space-y-2">
          <strong className="text-slate-900 block text-sm font-semibold">Q. How do I track an application submitted on the Single Window?</strong>
          <p className="text-slate-600 leading-relaxed">
            Copy the Application Reference Number (ARN) generated on the official government portal, and enter it in your SolveX Applications log to track visual milestone scrutiny alerts directly.
          </p>
        </div>
      </div>
    </div>
  );
}

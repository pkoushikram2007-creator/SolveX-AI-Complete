import { 
  Sector, 
  ActivityType, 
  BusinessProfile, 
  ClassificationResult, 
  Approval, 
  Document, 
  ApprovalStatus,
  ApplicationStage
} from './types';

/**
 * Heuristically classifies a business based on its structured selections and free-form description text.
 */
export function classifyBusiness(profile: BusinessProfile): ClassificationResult {
  const text = (profile.description || '').toLowerCase();
  
  // 1. Determine Sector if not selected
  let sector: Sector = profile.sector || 'FURNITURE';
  if (!profile.sector) {
    if (text.includes('wood') || text.includes('furniture') || text.includes('timber') || text.includes('chair') || text.includes('table') || text.includes('bed') || text.includes('cabinet') || text.includes('mdf') || text.includes('plywood')) {
      sector = 'FURNITURE';
    } else if (text.includes('garment') || text.includes('textile') || text.includes('fabric') || text.includes('dye') || text.includes('stitch') || text.includes('cloth') || text.includes('sew') || text.includes('t-shirt') || text.includes('uniform') || text.includes('tailor')) {
      sector = 'TEXTILES';
    } else if (text.includes('ev') || text.includes('auto') || text.includes('car') || text.includes('motor') || text.includes('battery') || text.includes('charger') || text.includes('vehicle') || text.includes('scooter') || text.includes('spare')) {
      sector = 'AUTOMOTIVE';
    }
  }

  // 2. Identify implicit activities from natural language description
  const detectedActivities = new Set<ActivityType>(profile.activities || []);
  
  if (text.includes('make') || text.includes('manufacture') || text.includes('mfg') || text.includes('factory') || text.includes('production')) {
    detectedActivities.add('Manufacturing');
  }
  if (text.includes('cut') || text.includes('dye') || text.includes('bleach') || text.includes('wash') || text.includes('treat') || text.includes('season')) {
    detectedActivities.add('Processing');
  }
  if (text.includes('assemble') || text.includes('assembly') || text.includes('pack')) {
    detectedActivities.add('Assembly');
  }
  if (text.includes('buy') || text.includes('sell') || text.includes('trade') || text.includes('trading')) {
    detectedActivities.add('Trading');
  }
  if (text.includes('wholesale') || text.includes('bulk') || text.includes('distribute')) {
    detectedActivities.add('Wholesale');
  }
  if (text.includes('retail') || text.includes('showroom') || text.includes('shop') || text.includes('store') || text.includes('sales')) {
    detectedActivities.add('Retail / Sale');
  }
  if (text.includes('repair') || text.includes('service') || text.includes('restore') || text.includes('maintenance')) {
    detectedActivities.add('Repair / Service');
  }
  if (text.includes('store') || text.includes('warehouse') || text.includes('stock')) {
    detectedActivities.add('Storage / Warehouse');
  }
  if (text.includes('distribution') || text.includes('logistics')) {
    detectedActivities.add('Distribution');
  }
  if (text.includes('install') || text.includes('installation')) {
    detectedActivities.add('Installation');
  }
  if (text.includes('import') || text.includes('export') || text.includes('overseas')) {
    detectedActivities.add('Import / Export');
  }

  // If no activities selected or detected, default to Retail for retail keywords, else Manufacturing
  if (detectedActivities.size === 0) {
    if (text.includes('retail') || text.includes('showroom') || text.includes('shop')) {
      detectedActivities.add('Retail / Sale');
    } else if (text.includes('service') || text.includes('repair')) {
      detectedActivities.add('Repair / Service');
    } else {
      detectedActivities.add('Manufacturing');
    }
  }

  const activitiesList = Array.from(detectedActivities);

  // 3. Determine business model string
  const modelParts: string[] = [];
  if (activitiesList.includes('Manufacturing')) modelParts.push('Manufacturing');
  if (activitiesList.includes('Processing')) modelParts.push('Processing');
  if (activitiesList.includes('Assembly')) modelParts.push('Assembly');
  if (activitiesList.includes('Trading') || activitiesList.includes('Wholesale')) modelParts.push('Wholesale');
  if (activitiesList.includes('Retail / Sale')) modelParts.push('Retail');
  if (activitiesList.includes('Repair / Service')) modelParts.push('Service');
  
  const businessModel = modelParts.length > 0 ? modelParts.join(' + ') : 'Commercial Services';

  // 4. Primary Activity Determination
  let primaryActivity = 'Retail Sales & Operations';
  if (activitiesList.includes('Manufacturing')) {
    primaryActivity = 'Industrial Manufacturing';
  } else if (activitiesList.includes('Processing')) {
    primaryActivity = 'Industrial Material Processing';
  } else if (activitiesList.includes('Assembly')) {
    primaryActivity = 'Assembly and Integration';
  } else if (activitiesList.includes('Wholesale') || activitiesList.includes('Trading')) {
    primaryActivity = 'Wholesale Distribution & Trading';
  } else if (activitiesList.includes('Repair / Service')) {
    primaryActivity = 'Technical Service and Repair Operations';
  }

  const isManufacturing = activitiesList.includes('Manufacturing') || 
                          activitiesList.includes('Processing') || 
                          activitiesList.includes('Assembly');

  // 5. Materials, Process Type, and Risk Factors
  let processType = 'Standard Commerce';
  let materialType = 'Mixed Commercial Goods';
  const riskFactors: string[] = [];

  if (sector === 'FURNITURE') {
    materialType = (profile.answers.woodMaterial as string) || 'Mixed Wood & Timber';
    if (activitiesList.includes('Processing')) {
      processType = 'Mechanical Wood Shaping & Sanding';
    }
    if (profile.answers.woodCutting === true || text.includes('cut')) {
      riskFactors.push('Occupational Noise & Airborne Sawdust Hazard');
    }
    if (profile.answers.paintPolishVarnish === true || text.includes('polish') || text.includes('paint') || text.includes('varnish')) {
      riskFactors.push('Volatile Organic Compound (VOC) Emissions');
      processType = 'Surface Spray Coating & Polishing';
    }
    if (profile.answers.adhesivesUsed === true || text.includes('glue') || text.includes('adhesive')) {
      riskFactors.push('Formaldehyde & Flammable Chemical Storage');
    }
    if (activitiesList.includes('Manufacturing')) {
      riskFactors.push('Industrial Fire Safety (Combustible Wood Dust)');
    }
  } else if (sector === 'TEXTILES') {
    materialType = 'Fabrics & Yarn';
    if (profile.answers.textileMaterial) {
      materialType = profile.answers.textileMaterial as string;
    }
    if (profile.answers.useDyesBleach === true || text.includes('dye') || text.includes('bleach') || text.includes('wash')) {
      processType = 'Chemical Wet Processing & Dyeing';
      riskFactors.push('High volume Industrial Wastewater Discharge (Dye Effluent)');
      riskFactors.push('Hazardous Chemical Handling (Bleaches, Salts, Acids)');
      if (profile.answers.hasBoiler === true || text.includes('boiler') || text.includes('steam')) {
        riskFactors.push('Air Polluting Fuel-fired Boiler Operation');
      }
    } else {
      processType = 'Dry Textile Fabric Garment Stitching';
      riskFactors.push('Minimal environmental impact (Fabric clippings waste)');
    }
  } else if (sector === 'AUTOMOTIVE') {
    materialType = 'EV Components & Assemblies';
    if (profile.answers.batteryPackAssembly === true || text.includes('battery') || text.includes('pack')) {
      materialType = 'Lithium-Ion Cells & BMS Assemblies';
      processType = 'Battery Module Hot Spot Weld & Assembly';
      riskFactors.push('Lithium-Ion Fire and Thermal Runaway Hazard');
      riskFactors.push('E-Waste & Dangerous Spent battery storage');
    } else if (activitiesList.includes('Manufacturing')) {
      processType = 'EV Precision Auto Parts Machining';
      riskFactors.push('Metal cutting fluids and heavy machine operation hazard');
    }
    
    if (text.includes('service') || text.includes('repair') || profile.answers.isBatteryServicing === true) {
      riskFactors.push('Solder Lead Fumes & Spent Hydraulic Oils disposal');
    }
    if (text.includes('charger') || profile.answers.hasChargingStation === true) {
      riskFactors.push('High-Voltage Grid Electrical Shock Risk');
    }
  }

  // Common Risk factors based on size
  if (profile.projectSize.employees >= 10 && isManufacturing) {
    riskFactors.push('Labor Welfare & Factory Safety Mandates (Factories Act)');
  }
  if (profile.projectSize.investment > 100) {
    riskFactors.push('Large Capital Investment Audit (GST and Asset Filing)');
  }

  // Deduplicate secondary activities
  const secondaryActivities = activitiesList.filter(act => {
    if (act === 'Manufacturing' && primaryActivity === 'Industrial Manufacturing') return false;
    if (act === 'Processing' && primaryActivity === 'Industrial Material Processing') return false;
    if (act === 'Assembly' && primaryActivity === 'Assembly and Integration') return false;
    if (act === 'Retail / Sale' && primaryActivity === 'Retail Sales & Operations') return false;
    return true;
  });

  const sectorNames: Record<Sector, string> = {
    'FURNITURE': 'Furniture & Wood Products',
    'TEXTILES': 'Textiles & Garments',
    'AUTOMOTIVE': 'Automobiles & EV'
  };

  return {
    sectorName: sectorNames[sector] || 'Furniture & Wood Products',
    primaryActivity,
    secondaryActivities,
    businessModel,
    isManufacturing,
    processType,
    materialType,
    riskComplianceFactors: riskFactors.length > 0 ? riskFactors : ['Standard Commercial Operations Risk']
  };
}

/**
 * Calculates approvals, documents, reasons, and dependency connections based on classified profiles.
 */
export function generateComplianceRoadmap(
  profile: BusinessProfile,
  classification: ClassificationResult
): { approvals: Approval[]; documents: Document[] } {
  const sector = profile.sector || 'FURNITURE';
  const activities = profile.activities || [];
  const projectSize = profile.projectSize;
  const isMfg = classification.isManufacturing;

  const approvals: Approval[] = [];
  const documents: Document[] = [];

  // Define global documents list to populate dynamically
  const docsMap: Record<string, Document> = {
    'doc-pan': {
      id: 'doc-pan',
      name: 'Business PAN & TAN Card',
      usedForApprovals: [],
      status: 'Required',
      whyNeeded: 'Mandatory primary identifier issued by the Income Tax Department of India for all legal entities to open bank accounts and file taxes.',
      howToObtain: 'Apply online on the NSDL portal or UTITSL website.',
      infoRequired: ['Promoter identity proofs', 'Address proof of office', 'Certificate of incorporation / Partnership deed'],
      whoIssues: 'Income Tax Department, Government of India',
      prepSteps: ['Obtain Aadhaar link', 'Draft Partnership/Incorporation documents', 'File online PAN form 49A/49B'],
      uploadRequirements: 'Scanned original PDF, under 2MB',
      validity: 'Lifetime validity unless entity is dissolved',
      renewalRequirements: 'No renewal required',
      dependencies: []
    },
    'doc-addr': {
      id: 'doc-addr',
      name: 'Registered Address Lease / Ownership Proof',
      usedForApprovals: [],
      status: 'Required',
      whyNeeded: 'Legal document establishing lawful physical possession of the business premises.',
      howToObtain: 'Execute a registered rent agreement or acquire a sale deed of the land.',
      whoIssues: 'Sub-Registrar Office of local body',
      infoRequired: ['Landlord identification', 'Property tax receipts', 'NOC from land owner'],
      prepSteps: ['Draft lease agreement on stamp paper of appropriate value', 'Register at Sub-Registrar office with witnesses'],
      uploadRequirements: 'Multi-page scanned registered deed/lease in PDF format, up to 5MB',
      validity: 'As per lease agreement term (typically 11 months to 5 years)',
      renewalRequirements: 'Execute a fresh renewal agreement before expiry of the current term',
      dependencies: []
    },
    'doc-udyam': {
      id: 'doc-udyam',
      name: 'Udyam MSME Certificate',
      usedForApprovals: [],
      status: 'Missing',
      whyNeeded: 'Proof of micro, small or medium enterprise status to avail interest subsidies, tender exemptions, and collateral-free loans.',
      howToObtain: 'Register online with Aadhaar & PAN on the Ministry of MSME portal.',
      whoIssues: 'Ministry of Micro, Small and Medium Enterprises, Government of India',
      infoRequired: ['Aadhaar of proprietor/partner', 'Business PAN', 'Bank details', 'Investment in Plant & Machinery', 'Employee count'],
      prepSteps: ['Submit Aadhaar and OTP verification', 'Self-declare investment and turnover metrics'],
      uploadRequirements: 'Online generated PDF certificate, 1MB',
      validity: 'Permanent (unless amended or cancelled)',
      renewalRequirements: 'Update annual investment/turnover statistics dynamically via Income Tax link',
      dependencies: [
        { documentId: 'doc-pan', documentName: 'Business PAN & TAN Card', relationship: 'Required Before' }
      ]
    },
    'doc-gst': {
      id: 'doc-gst',
      name: 'GSTIN Certificate (REG-06)',
      usedForApprovals: [],
      status: 'Missing',
      whyNeeded: 'Mandatory registration for any business involved in supply of goods with turnover exceeding Rs. 40 Lakhs (Rs 20 Lakhs in hill states) or any interstate trading/e-commerce.',
      howToObtain: 'Register online at GST Portal via Form GST REG-01.',
      whoIssues: 'Goods and Services Tax Network (GSTN), Department of Revenue',
      infoRequired: ['PAN Card', 'Proof of constitution (Partnership/MoA)', 'Lease Deed/Electricity Bill', 'Bank statement/cancelled cheque'],
      prepSteps: ['Verify mobile/email with TRN', 'Submit REG-01 with promoter details', 'Respond to clarification query in REG-03 if issued'],
      uploadRequirements: 'REG-06 PDF certificate, under 1MB',
      validity: 'Permanent active status subject to filing monthly returns (GSTR-1, GSTR-3B)',
      renewalRequirements: 'No renewal, continuous filing needed',
      dependencies: [
        { documentId: 'doc-pan', documentName: 'Business PAN & TAN Card', relationship: 'Required Before' },
        { documentId: 'doc-addr', documentName: 'Registered Address Lease / Ownership Proof', relationship: 'Required Before' }
      ]
    },
    'doc-shop': {
      id: 'doc-shop',
      name: 'Shop and Establishment License',
      usedForApprovals: [],
      status: 'Missing',
      whyNeeded: 'Regulates working hours, weekly holidays, wage payments, and employment terms for commercial shops, showrooms, or offices.',
      howToObtain: 'Register with State labor department portal or local municipal body.',
      whoIssues: 'Inspector of Shops and Establishments, State Labor Department',
      infoRequired: ['GSTIN certificate', 'Shop board photo with name in local language', 'Rent agreement', 'Employee lists'],
      prepSteps: ['Take a geo-tagged photograph of the shop front', 'Submit online application and pay municipal fees based on employees'],
      uploadRequirements: 'Scanned municipal license PDF, 2MB',
      validity: '1 to 5 years (varies by state laws)',
      renewalRequirements: 'Apply for renewal 30 days prior to license expiry with fee payment',
      dependencies: [
        { documentId: 'doc-gst', documentName: 'GSTIN Certificate (REG-06)', relationship: 'Required Before' }
      ]
    },
    'doc-siteplan': {
      id: 'doc-siteplan',
      name: 'Approved Site & Machinery Layout Plan',
      usedForApprovals: [],
      status: 'Required',
      whyNeeded: 'Detailed blueprints displaying emergency exits, machinery coordinates, ventilation shafts, and electrical panels, certified by a structural engineer.',
      howToObtain: 'Draft blueprints via an empanelled licensed architect/surveyor.',
      whoIssues: 'Empanelled Chartered Engineer / Structural Architect',
      infoRequired: ['Detailed land boundary survey', 'Machinery specifications & power load requirements'],
      prepSteps: ['Conduct physical site measurement', 'Design emergency evacuation paths', 'Obtain blue-print stamps from structural engineer'],
      uploadRequirements: 'High-resolution blueprint drawings in PDF, under 10MB',
      validity: 'Perpetual unless structural alterations are made',
      renewalRequirements: 'Apply for amendment if machinery layout or built-up area is altered',
      dependencies: [
        { documentId: 'doc-addr', documentName: 'Registered Address Lease / Ownership Proof', relationship: 'Required Before' }
      ]
    },
    'doc-firenoc': {
      id: 'doc-firenoc',
      name: 'Fire No Objection Certificate (NOC)',
      usedForApprovals: [],
      status: 'Missing',
      whyNeeded: 'Safety certificate proving the building complies with State Fire Safety Rules, including functional hydrants, sand buckets, and smoke alarms.',
      howToObtain: 'Apply through State Fire Services Online Single Window System.',
      whoIssues: 'State Fire and Emergency Services Department',
      infoRequired: ['Architect site drawings', 'List of fire safety equipment installed', 'Water storage tank details'],
      prepSteps: ['Install required fire extinguishers & escape signs', 'Conduct fire drill log', 'Apply online for physical field inspection by Fire Officer'],
      uploadRequirements: 'Fire NOC Certificate signed digitally, up to 3MB',
      validity: '1 year for industrial/hazardous facilities, 3 years for commercial offices',
      renewalRequirements: 'Apply for renewal annually after conducting wet hydrant and alarm tests',
      dependencies: [
        { documentId: 'doc-siteplan', documentName: 'Approved Site & Machinery Layout Plan', relationship: 'Required Before' }
      ]
    },
    'doc-cte': {
      id: 'doc-cte',
      name: 'Consent to Establish (CTE) Certificate',
      usedForApprovals: [],
      status: 'Missing',
      whyNeeded: 'Mandatory environmental approval from the State Pollution Control Board before starting any construction or machinery erection.',
      howToObtain: 'Submit an online application in SPCB Single Window portal with environmental reports.',
      whoIssues: 'State Pollution Control Board (e.g. MPCB, TNPCB, KSPCB)',
      infoRequired: ['Water balance chart', 'List of chemicals and raw materials used', 'E-waste / hazardous waste declaration', 'Noise levels audit'],
      prepSteps: ['Determine SPCB color categorization (Red/Orange/Green)', 'Prepare environmental management plan (EMP) report', 'Submit water-use structure'],
      uploadRequirements: 'CTE Order PDF, under 4MB',
      validity: '3 to 5 years or until construction is completed',
      renewalRequirements: 'Convert into Consent to Operate (CTO) before commercial production starts',
      dependencies: [
        { documentId: 'doc-siteplan', documentName: 'Approved Site & Machinery Layout Plan', relationship: 'Required Before' },
        { documentId: 'doc-pan', documentName: 'Business PAN & TAN Card', relationship: 'Required Before' }
      ]
    },
    'doc-factory': {
      id: 'doc-factory',
      name: 'Factory License under Factories Act',
      usedForApprovals: [],
      status: 'Missing',
      whyNeeded: 'Ensures safe work conditions, worker health and welfare facilities in factories with power machinery.',
      howToObtain: 'Apply to Directorate of Industrial Safety & Health (DISH).',
      whoIssues: 'Directorate of Industrial Safety & Health (DISH), State Government',
      infoRequired: ['CTE certificate', 'Approved layout plan', 'Fire NOC', 'Stability certificate from competent authority'],
      prepSteps: ['Ensure restrooms, canteen, first aid and emergency escapes exist', 'Obtain building stability certificate signed by DISH empanelled engineer'],
      uploadRequirements: 'Form 2 DISH Factory License PDF, up to 5MB',
      validity: '1 to 10 years (based on selected fees)',
      renewalRequirements: 'Apply for renewal 2 months before expiration with worker payroll logs',
      dependencies: [
        { documentId: 'doc-cte', documentName: 'Consent to Establish (CTE) Certificate', relationship: 'Required Before' },
        { documentId: 'doc-firenoc', documentName: 'Fire No Objection Certificate (NOC)', relationship: 'Required Before' }
      ]
    },
    'doc-bwmr': {
      id: 'doc-bwmr',
      name: 'Battery Waste Management Rules (BWMR) Certificate',
      usedForApprovals: [],
      status: 'Missing',
      whyNeeded: 'Mandatory under Battery Waste Management Rules 2022 for any entity assembling, selling, or servicing batteries, ensuring recycling of lead-acid or lithium batteries.',
      howToObtain: 'Apply on the CPCB Portal for Battery Management.',
      whoIssues: 'Central Pollution Control Board (CPCB) or SPCB',
      infoRequired: ['Company PAN & GSTIN', 'Battery chemistries handled (e.g. Li-ion, Lead-acid)', 'EPR target undertaking'],
      prepSteps: ['Establish Extended Producer Responsibility (EPR) contract with a registered recycler', 'Declare expected annual battery sales and weight target'],
      uploadRequirements: 'CPCB Registration certificate PDF, 2MB',
      validity: '5 years',
      renewalRequirements: 'Submit annual compliance report of batteries collected and recycled',
      dependencies: [
        { documentId: 'doc-gst', documentName: 'GSTIN Certificate (REG-06)', relationship: 'Required Before' }
      ]
    },
    'doc-iec': {
      id: 'doc-iec',
      name: 'Import Export Code (IEC) Certificate',
      usedForApprovals: [],
      status: 'Missing',
      whyNeeded: 'Required for any business importing manufacturing equipment, raw chemical dyes, battery cells, or exporting garments/furniture abroad.',
      howToObtain: 'Apply online on DGFT Portal via PAN card.',
      whoIssues: 'Directorate General of Foreign Trade (DGFT), Ministry of Commerce',
      infoRequired: ['Individual/Company PAN', 'Bank certificate/cancelled cheque', 'Registered address proof'],
      prepSteps: ['Validate Aadhaar OTP with PAN', 'Complete instant electronic payment of Rs 500 fee on DGFT site'],
      uploadRequirements: 'e-IEC generated certificate PDF, 1MB',
      validity: 'Lifetime validity',
      renewalRequirements: 'Mandatory annual online update on the DGFT portal between April and June',
      dependencies: [
        { documentId: 'doc-pan', documentName: 'Business PAN & TAN Card', relationship: 'Required Before' }
      ]
    }
  };

  // 1. MSME Registration (Udyam) — Always Highly Applicable
  approvals.push({
    id: 'app-udyam',
    name: 'Udyam MSME Registration',
    authority: 'Ministry of Micro, Small & Medium Enterprises, GoI',
    status: 'Potentially Applicable',
    why: 'Required to qualify as an registered MSME under the MSMED Act 2006, granting the company priority sector bank lending, interest subsidies, and protection against delayed buyer payments.',
    condition: 'Highly recommended for all Indian startups and entrepreneurs to access credit schemes.',
    stage: 'Requirement Identified',
    category: 'Common',
    documentIds: ['doc-pan', 'doc-udyam'],
    procedure: '1. Navigate to the official Udyam Portal. 2. Verify Aadhaar Card of the proprietor/managing partner with OTP. 3. Input enterprise PAN and import GST data. 4. Self-declare employee counts and depreciated investments in machinery. 5. Click Final Submit to instantly generate the Certificate.',
    submissionMethod: '100% Online self-registration',
    verificationMethod: 'Automated PAN-Aadhaar verification with income tax database links',
    inspectionRequirement: 'None - Entirely inspection-free registration',
    queryHandling: 'In case of discrepancies, SIDO officers may request an online clarification in the portal',
    issuedForm: 'Udyam Registration Certificate with a unique barcode (UDYAM-XX-00-XXXXX)',
    validityYears: 'Perpetual',
    renewalProcedure: 'No renewal required, but must update financial metrics on the portal annually',
    portalName: 'Udyam Registration Portal',
    portalUrl: 'https://udyamregistration.gov.in',
    serviceName: 'MSME Registration',
    applicationType: 'New Registration (Free of Cost)'
  });
  docsMap['doc-udyam'].usedForApprovals.push('app-udyam');
  docsMap['doc-pan'].usedForApprovals.push('app-udyam');

  // 2. GST Registration — Applicable for Trading, Wholesale, Retail, Manufacturing, etc.
  const gstCondition = (projectSize.investment > 5 || activities.includes('Wholesale') || activities.includes('Trading') || activities.includes('Retail / Sale') || isMfg);
  approvals.push({
    id: 'app-gst',
    name: 'GST Registration (REG-06)',
    authority: 'Department of Revenue, Ministry of Finance, GoI',
    status: gstCondition ? 'Potentially Applicable' : 'Conditional',
    why: 'Necessary to collect and remit indirect tax in India and claim Input Tax Credit on raw materials, components, and service expenditures.',
    condition: 'Mandatory if business turnover exceeds Rs 40 Lakhs (Rs 20 Lakhs for services/hill states), or if executing any interstate commerce or online trading.',
    stage: 'Requirement Identified',
    category: 'Common',
    documentIds: ['doc-pan', 'doc-addr', 'doc-gst'],
    procedure: '1. Register at GST portal to create Temporary Reference Number (TRN) using PAN, email, and mobile. 2. Log in and file GST REG-01 with business address proofs, photographs of promoters, and banking information. 3. State Tax officer reviews within 7 days. 4. Download REG-06 certificate from the portal upon approval.',
    submissionMethod: 'Online through GST Common Portal',
    verificationMethod: 'Document audit by Circle Tax Officer. Biometric verification may be scheduled if flagged by AI risk parameters.',
    inspectionRequirement: 'Physical field inspection of premises is rare, but can occur if address proof is found suspicious or non-standard',
    queryHandling: 'If officer raises a query, a Notice GST REG-03 will be issued online. Respond in REG-04 within 7 working days.',
    issuedForm: 'GST REG-06 Registration Certificate',
    validityYears: 'Permanent unless cancelled or surrendered',
    renewalProcedure: 'No renewal, requires filing GST Returns monthly or quarterly (QRMP)',
    portalName: 'GST Common Portal',
    portalUrl: 'https://www.gst.gov.in',
    serviceName: 'GST New Registration',
    applicationType: 'Online Taxpayer Registration'
  });
  docsMap['doc-gst'].usedForApprovals.push('app-gst');
  docsMap['doc-pan'].usedForApprovals.push('app-gst');
  docsMap['doc-addr'].usedForApprovals.push('app-gst');

  // 3. Shop & Establishment License — Required if office, showroom, service centre exists and is not a core industrial factory (or has retail)
  const needsShop = activities.includes('Retail / Sale') || activities.includes('Wholesale') || activities.includes('Trading') || activities.includes('Repair / Service');
  approvals.push({
    id: 'app-shop',
    name: 'Shop & Establishment Registration',
    authority: 'Municipal Corporation / State Labour Commissionerate',
    status: needsShop ? 'Potentially Applicable' : 'Conditional',
    why: 'Regulates commercial workspaces, establishing legal operation of retail showrooms, wholesale offices, and repair workshops under the state laws.',
    condition: 'Mandatory for any physical storefront, office, or commercial workspace located outside designated industrial factories.',
    stage: 'Requirement Identified',
    category: needsShop ? 'Retail' : 'Common',
    documentIds: ['doc-gst', 'doc-shop'],
    procedure: '1. Visit state labor Single Window portal. 2. Fill in details of owner, address, manager, and count of employees. 3. Upload shop photo with a name board written in regional state language (mandatory in states like Maharashtra, Tamil Nadu). 4. Pay the statutory fee based on worker count and print certificate.',
    submissionMethod: 'State Single Window portal or Municipal website',
    verificationMethod: 'Instant self-declaration or post-registration review by Ward Inspector',
    inspectionRequirement: 'Random spot check by Labor Inspector to verify employee register, working hours, and local signboards',
    queryHandling: 'Online dashboard updates showing deficiency; corrections can be re-uploaded directly',
    issuedForm: 'Form C Shop Registration Certificate',
    validityYears: '1 to 5 Years (State dependent)',
    renewalProcedure: 'File renewal application online 30 days before expiry with renewal fees',
    portalName: 'State Shram Suvidha / Municipal Portal',
    serviceName: 'Shop Registration & License',
    applicationType: 'Municipal Commercial Permit'
  });
  docsMap['doc-shop'].usedForApprovals.push('app-shop');
  docsMap['doc-gst'].usedForApprovals.push('app-shop');

  // 4. SPCB CTE (Consent to Establish) — Manufacturing & Processing
  if (isMfg) {
    let colorCat = 'Green';
    let SPCBWhy = 'Required to ensure industrial pollution levels (air, noise, hazardous wastes) are managed via standard filtration prior to erecting machinery.';
    
    if (sector === 'TEXTILES' && (profile.answers.useDyesBleach === true || classification.processType.includes('Dyeing'))) {
      colorCat = 'Red (High water effluent pollution)';
      SPCBWhy = 'Mandatory SPCB check for textile wet processing which generates heavily contaminated chemical wastewater requiring zero liquid discharge (ZLD).';
    } else if (sector === 'FURNITURE' && profile.answers.paintPolishVarnish === true) {
      colorCat = 'Orange (VOC fumes and chemical residues)';
    } else if (sector === 'AUTOMOTIVE' && (profile.answers.batteryPackAssembly === true || classification.processType.includes('Battery'))) {
      colorCat = 'Orange (Lithium storage, toxic chemicals, electrical risk)';
    }

    approvals.push({
      id: 'app-cte',
      name: `SPCB Consent to Establish (CTE) - ${colorCat} Category`,
      authority: 'State Pollution Control Board (SPCB)',
      status: 'Potentially Applicable',
      why: SPCBWhy,
      condition: 'Mandatory environmental approval under Section 25 of Water Act 1974 and Section 21 of Air Act 1981 before starting any site work or structural machinery setups.',
      stage: 'Requirement Identified',
      category: 'Environmental',
      documentIds: ['doc-pan', 'doc-siteplan', 'doc-cte'],
      procedure: '1. Access SPCB Online Consent Management & Monitoring System (OCMMS). 2. Create profile and perform self-categorization. 3. Input water balance chart (intake vs discharge), list of motors with HP ratings, and raw materials list. 4. Upload factory layout and pay environmental fees. 5. SPCB scientist audits application, conducts site verification if Orange/Red, and issues CTE.',
      submissionMethod: 'State OCMMS Portal (Online)',
      verificationMethod: 'Technical engineering assessment and physical site inspection by Board Regional Officer',
      inspectionRequirement: 'Site inspection is mandatory for Orange and Red category industries before CTE grant to verify industrial buffer zoning',
      queryHandling: 'Clarification query raised in portal dashboard. Replying with revised documents is required within 15 days.',
      issuedForm: 'Consent to Establish Order / Certificate',
      validityYears: '3 to 5 years (valid up to factory completion)',
      renewalProcedure: 'Apply for Consent to Operate (CTO) before beginning production; no CTE renewal needed if factory is complete',
      portalName: 'State SPCB OCMMS Portal',
      serviceName: 'Consent to Establish (CTE)',
      applicationType: 'Environmental Clearance'
    });
    docsMap['doc-cte'].usedForApprovals.push('app-cte');
    docsMap['doc-siteplan'].usedForApprovals.push('app-cte');
    docsMap['doc-pan'].usedForApprovals.push('app-cte');

    // 5. Factory License — Manufacturing + Employee or Power threshold
    // Under Factories Act 1948: Applies if 10+ employees with power, or 20+ employees without power.
    const hasManyEmployees = projectSize.employees >= 10;
    approvals.push({
      id: 'app-factory',
      name: 'Factory License (DISH Permit)',
      authority: 'Directorate of Industrial Safety & Health (DISH), State Government',
      status: hasManyEmployees ? 'Potentially Applicable' : 'Conditional',
      why: 'Assures industrial site structural safety, adequate ventilation, proper machine guarding, and employee welfare amenities (toilets, clean drinking water, fire escapes).',
      condition: 'Mandatory for manufacturing operations employing 10 or more workers with electrical power, or 20 or more workers without power.',
      stage: 'Requirement Identified',
      category: 'Manufacturing',
      documentIds: ['doc-cte', 'doc-siteplan', 'doc-firenoc', 'doc-factory'],
      procedure: '1. Register on DISH Industrial Safety portal. 2. Submit architectural blueprints showing exact machinery positions and HP loads for approval. 3. Fill Form 2 detailing worker count, chemical processes, and health officer. 4. Upload building stability certificate issued by empanelled civil structural engineer. 5. Factory inspector reviews and conducts a safety audit before issuing license.',
      submissionMethod: 'DISH Single Window Portal',
      verificationMethod: 'Rigorous engineering drawing review and physical site inspection by Factory Inspector',
      inspectionRequirement: 'A detailed pre-commissioning safety inspection is mandatory to test machine guards, exhaust ventilation, and emergency exits',
      queryHandling: 'Officer will send a checklist of visual corrections in the portal. Rectify and upload structural proofs within 30 days.',
      issuedForm: 'Form 4 DISH Factory License & Registration Certificate',
      validityYears: '5 to 10 Years',
      renewalProcedure: 'Submit renewal form with annual safety return, certified employee medical logs, and fee payment',
      portalName: 'State DISH Single Window System',
      serviceName: 'DISH Factory Plan Approval & License',
      applicationType: 'Statutory Safety Permit'
    });
    docsMap['doc-factory'].usedForApprovals.push('app-factory');
    docsMap['doc-cte'].usedForApprovals.push('app-factory');
    docsMap['doc-siteplan'].usedForApprovals.push('app-factory');
    docsMap['doc-firenoc'].usedForApprovals.push('app-factory');
  }

  // 6. Fire NOC — Crucial for manufacturing, showrooms, storage warehouses
  const needsFire = isMfg || activities.includes('Retail / Sale') || activities.includes('Storage / Warehouse');
  approvals.push({
    id: 'app-firenoc',
    name: 'Fire Safety Certificate (Fire NOC)',
    authority: 'State Fire and Emergency Services Department',
    status: needsFire ? 'Potentially Applicable' : 'Conditional',
    why: 'Verifies the commercial or industrial premises are equipped with functional firefighting gear, clearly demarcated fire exits, and high water storage for emergencies.',
    condition: 'Highly applicable to factories, warehouses holding combustible materials, and large multi-story retail showrooms.',
    stage: 'Requirement Identified',
    category: isMfg ? 'Manufacturing' : 'Retail',
    documentIds: ['doc-siteplan', 'doc-firenoc'],
    procedure: '1. File online Fire NOC request on State Fire safety portal. 2. Upload approved architect layout showing fire emergency exits, structural stairs, fire hydrants, and sand buckets. 3. Schedule physical mock fire fighting test. 4. Fire Officer conducts inspection and signs NOC digitally.',
    submissionMethod: 'State Fire Service Single Window portal',
    verificationMethod: 'Physical live inspection and pressure testing of fire pumps by fire officials',
    inspectionRequirement: 'Physical field inspection is mandatory; fire fighters will test hydrant pressure, alarms, and check for locked emergency exits',
    queryHandling: 'Deficiency list issued during physical inspection. Compliance report with geo-tagged photos of fixed points must be submitted.',
    issuedForm: 'Fire No Objection Certificate',
    validityYears: '1 Year for industrial, 3 Years for retail/commercial',
    renewalProcedure: 'Conduct annual wet hydrant test by certified vendor and submit online renewal application with test certificates',
    portalName: 'State Fire Single Window System',
    serviceName: 'Fire NOC Approval',
    applicationType: 'Public Safety Clearance'
  });
  docsMap['doc-firenoc'].usedForApprovals.push('app-firenoc');
  docsMap['doc-siteplan'].usedForApprovals.push('app-firenoc');

  // 7. Battery Waste Management & Battery Servicing Permits (Only Automotive + Battery related)
  const isBatteryBusiness = sector === 'AUTOMOTIVE' && 
    (profile.answers.batteryPackAssembly === true || 
     profile.answers.isBatteryServicing === true || 
     profile.specificActivities.includes('Battery pack assembly') ||
     classification.materialType.includes('Lithium'));

  if (isBatteryBusiness) {
    approvals.push({
      id: 'app-bwmr',
      name: 'Battery Waste Management Rules (BWMR) Registration',
      authority: 'Central Pollution Control Board (CPCB) / State SPCB',
      status: 'Potentially Applicable',
      why: 'Imposes Extended Producer Responsibility (EPR) on battery assemblers and dealers to guarantee safe collection and recycling of lithium-ion or lead-acid batteries, preventing lead/toxic dump.',
      condition: 'Mandatory under Battery Waste Management Rules 2022 for all manufacturers, pack assemblers, and dealers of electric vehicles or battery packs.',
      stage: 'Requirement Identified',
      category: 'Specific',
      documentIds: ['doc-gst', 'doc-bwmr'],
      procedure: '1. Register on the CPCB Portal for Battery Waste Management. 2. Enter GST and PAN data to establish profile as Producer/Importer/Assembler. 3. Submit draft Extended Producer Responsibility (EPR) Action Plan detailing binding contracts with certified e-waste recyclers. 4. Pay processing fees and secure EPR Certificate online.',
      submissionMethod: 'CPCB BWMR Central Portal (Online)',
      verificationMethod: 'Automated document verification of recycler tie-up and self-declared sales target parameters',
      inspectionRequirement: 'No prior inspection needed. Audits of physical warehouse are done randomly',
      queryHandling: 'CPCB issues electronic notice of target mismatch; upload rectified EPR action plan online',
      issuedForm: 'CPCB BWMR EPR Registration Certificate',
      validityYears: '5 Years',
      renewalProcedure: 'Submit annual report showing weight details of batteries placed in market vs waste batteries collected',
      portalName: 'CPCB Battery Management Portal',
      portalUrl: 'https://cpcb.nic.in/battery-waste-management',
      serviceName: 'Producer/Assembler BWMR Registration',
      applicationType: 'Extended Producer Responsibility Registration'
    });
    docsMap['doc-bwmr'].usedForApprovals.push('app-bwmr');
    docsMap['doc-gst'].usedForApprovals.push('app-bwmr');
  }

  // 8. Import Export Code (DGFT IEC) — If user selects Import/Export activity
  const isImpExp = activities.includes('Import / Export') || textContainsImpExp(profile.description);
  approvals.push({
    id: 'app-iec',
    name: 'Import Export Code (DGFT IEC)',
    authority: 'Directorate General of Foreign Trade (DGFT), Ministry of Commerce',
    status: isImpExp ? 'Potentially Applicable' : 'Conditional',
    why: 'Necessary to clear customs shipments at Indian ports when importing raw lithium cells, automated looms, heavy woodworking cutters, or exporting finished shirts/furniture.',
    condition: 'Mandatory for any business importing machinery/materials or exporting finished products out of India.',
    stage: 'Requirement Identified',
    category: 'Common',
    documentIds: ['doc-pan', 'doc-iec'],
    procedure: '1. Log in to the DGFT portal. 2. Verify identity with digital signature (DSC) or Aadhaar OTP. 3. Input business details, bank account and IFSC code. 4. Complete online fee payment of Rs 500. 5. Download generated e-IEC certificate immediately.',
    submissionMethod: 'DGFT Portal (100% Online)',
    verificationMethod: 'Automated real-time verification of PAN and bank account database (via PFMS system)',
    inspectionRequirement: 'Completely inspection-free registration',
    queryHandling: 'Instant system rejection in case of PAN mismatch or spelling errors; retry after correcting data',
    issuedForm: 'DGFT e-IEC Certificate',
    validityYears: 'Lifetime',
    renewalProcedure: 'No renewal fees. Must mandatory complete online IEC profile updates between April and June annually',
    portalName: 'DGFT Portal',
    portalUrl: 'https://dgft.gov.in',
    serviceName: 'Apply for e-IEC',
    applicationType: 'Import Export Permit'
  });
  docsMap['doc-iec'].usedForApprovals.push('app-iec');
  docsMap['doc-pan'].usedForApprovals.push('app-iec');

  // Boiler Registration — Textile dyeing with boiler fuel
  const needsBoiler = sector === 'TEXTILES' && profile.answers.hasBoiler === true;
  if (needsBoiler) {
    approvals.push({
      id: 'app-boiler',
      name: 'Boiler Operation License & Inspection',
      authority: 'Chief Inspector of Boilers, State Boiler Inspectorate',
      status: 'Potentially Applicable',
      why: 'Required to prevent critical industrial boiler explosion hazards by checking boiler thickness, valve integrity, and certified operator attendance.',
      condition: 'Mandatory for any industrial wet-dyeing facility operating a steam boiler exceeding 25 liters capacity or 100 sq meters heating area.',
      stage: 'Requirement Identified',
      category: 'Specific',
      documentIds: ['doc-siteplan'],
      procedure: '1. Register at state Boiler single window. 2. Upload manufacturer technical drawings, weld-testing certificates, and safe working pressure logs. 3. Boiler officer performs physical hydraulic test of the steam pipeline. 4. License is issued with max pressure rating.',
      submissionMethod: 'State Boiler Inspectorate portal',
      verificationMethod: 'Severe engineering review and live hydrostatic pressure testing of the physical boiler vessel',
      inspectionRequirement: 'Annual physical inspector visit is mandatory to inspect boiler shell, safety valves, and log sheet audits',
      queryHandling: 'Defects notice issued under Section 8 of Boilers Act; operations must stop until rectifications are complete',
      issuedForm: 'Form V / Form VI Operation Permit',
      validityYears: '1 Year (Annual renewal mandatory)',
      renewalProcedure: 'Book physical hydrostatic testing and pay annual inspection fees 30 days before current license expires',
      portalName: 'State Single Window Boiler Portal',
      serviceName: 'Steam Boiler Permit & Inspection',
      applicationType: 'Critical Boiler Certificate'
    });
  }

  // Final compile: push all populated documents
  Object.keys(docsMap).forEach(key => {
    // If the document is used in at least one approval, we add it to the final array
    if (docsMap[key].usedForApprovals.length > 0) {
      documents.push(docsMap[key]);
    }
  });

  return { approvals, documents };
}

function textContainsImpExp(desc: string): boolean {
  const d = (desc || '').toLowerCase();
  return d.includes('import') || d.includes('export') || d.includes('overseas') || d.includes('global') || d.includes('foreign');
}

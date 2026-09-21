export type Sector = 'FURNITURE' | 'TEXTILES' | 'AUTOMOTIVE';

export type ActivityType =
  | 'Manufacturing'
  | 'Processing'
  | 'Assembly'
  | 'Trading'
  | 'Wholesale'
  | 'Retail / Sale'
  | 'Repair / Service'
  | 'Storage / Warehouse'
  | 'Distribution'
  | 'Installation'
  | 'Import / Export'
  | 'Other';

export interface LocationInfo {
  state: string;
  district: string;
  city: string;
  industrialArea: string;
  landStatus: string;
}

export interface ProjectSizeInfo {
  investment: number; // in INR Lakhs
  capacity: string; // text representation
  power: number; // in HP/kW
  employees: number; // headcount
  area: number; // in sq ft
  water: number; // in Kilo Litres per Day (KLD)
}

export interface BusinessProfile {
  sector: Sector | '';
  activities: ActivityType[];
  specificActivities: string[];
  description: string;
  location: LocationInfo;
  projectSize: ProjectSizeInfo;
  answers: Record<string, string | boolean | number>;
}

export interface ClassificationResult {
  sectorName: string;
  primaryActivity: string;
  secondaryActivities: string[];
  businessModel: string;
  isManufacturing: boolean;
  processType: string;
  materialType: string;
  riskComplianceFactors: string[];
}

export type ApprovalStatus = 'Potentially Applicable' | 'Conditional' | 'Not Applicable' | 'Needs Verification';

export type ApplicationStage =
  | 'Requirement Identified'
  | 'Documents Required'
  | 'Documents Prepared'
  | 'Documents Ready'
  | 'Open Official Portal'
  | 'Application Submitted'
  | 'Application Reference Number'
  | 'Government Scrutiny'
  | 'Query / Clarification'
  | 'Inspection if applicable'
  | 'Verification'
  | 'Decision'
  | 'Approval / Rejection'
  | 'Renewal';

export interface Approval {
  id: string;
  name: string;
  authority: string;
  status: ApprovalStatus;
  why: string;
  condition: string;
  stage: ApplicationStage;
  refNumber?: string;
  category: 'Manufacturing' | 'Process' | 'Retail' | 'Common' | 'Environmental' | 'Specific';
  documentIds: string[];
  procedure: string;
  submissionMethod: string;
  verificationMethod: string;
  inspectionRequirement: string;
  queryHandling: string;
  issuedForm: string;
  validityYears: string;
  renewalProcedure: string;
  portalName: string;
  portalUrl?: string; // Empty or unverified if no URL
  serviceName: string;
  applicationType: string;
}

export type DocumentStatus =
  | 'Missing'
  | 'Required'
  | 'Uploaded'
  | 'Needs Correction'
  | 'Ready for Application'
  | 'Submitted'
  | 'Under Verification'
  | 'Approved'
  | 'Expired'
  | 'Not Applicable';

export type DependencyRelationship = 'Required Before' | 'Can Be Applied In Parallel' | 'Required After';

export interface DocumentDependency {
  documentId: string;
  documentName: string;
  relationship: DependencyRelationship;
}

export interface Document {
  id: string;
  name: string;
  usedForApprovals: string[]; // List of approval IDs
  status: DocumentStatus;
  whyNeeded: string;
  howToObtain: string;
  infoRequired: string[];
  whoIssues: string;
  prepSteps: string[];
  uploadRequirements: string;
  validity: string;
  renewalRequirements: string;
  dependencies: DocumentDependency[];
  uploadedAt?: string;
  fileName?: string;
  expiryDate?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  sector: Sector;
  activities: ActivityType[];
  specificActivities: string[];
  description: string;
  location: LocationInfo;
  projectSize: ProjectSizeInfo;
  answers: Record<string, string | boolean | number>;
}

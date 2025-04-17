
export type CaseStatus = 
  | 'New' 
  | 'Demand Letter Sent' 
  | 'Petition Filed' 
  | 'Order Nisi Granted' 
  | 'Redemption Period' 
  | 'Sale Process' 
  | 'Closed';

export interface Party {
  id: string;
  name: string;
  type: 'Borrower' | 'Lender' | 'ThirdParty' | 'Lawyer' | 'Client';
  contactInfo: {
    email: string;
    phone: string;
    address?: string;
  };
}

export interface Property {
  id: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  pid: string; // Property ID
  legal_description: string; // This is the correct field name
  propertyType: 'Residential' | 'Commercial' | 'Land' | 'Other';
  estimatedValue?: number;
}

export interface Mortgage {
  id: string;
  registrationNumber: string;
  principal: number;
  interestRate: number;
  startDate: string; // ISO date string
  paymentAmount?: number;
  paymentFrequency?: 'Monthly' | 'Bi-weekly' | 'Weekly';
  currentBalance: number;
  perDiemInterest: number;
  arrears?: number;
}

export interface Deadline {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  complete: boolean;
  caseId: string;
  type: 'Statutory' | 'Court' | 'Internal' | 'Client';
}

export interface Document {
  id: string;
  title: string;
  type: "Demand Letter" | "Petition" | "Order Nisi" | "Conduct of Sale" | "Affidavit" | "Final Order" | "Other";
  createdAt: string;
  status: "Draft" | "Finalized" | "Filed" | "Served";
  caseId: string;
  url?: string;
  caseNumber?: string; // Used to display case file number with documents
}

export interface Case {
  id: string;
  fileNumber: string;
  status: CaseStatus;
  property: Property;
  mortgage: Mortgage;
  parties: Party[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deadlines: Deadline[];
  documents: Document[];
  court?: {
    fileNumber?: string;
    registry?: string;
    hearingDate?: string;
    judgeName?: string;
  };
  notes?: string;
}

export interface RecentActivity {
  id: string;
  caseId: string;
  action: string;
  timestamp: string; // ISO date string
  user: string;
  details?: string;
}

// Law firm management related interfaces
export interface LawFirm {
  id: string;
  name: string;
  subscriptionTier: 'basic' | 'standard' | 'premium' | 'enterprise';
  subscriptionStatus: string;
  subscriptionStartDate: string; // ISO date string
  subscriptionEndDate?: string; // ISO date string
  settings?: Record<string, any>;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  enabled: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface UserProfile {
  id: string;
  lawFirmId?: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'manager' | 'staff' | 'client' | 'system_admin';
  email: string;
  avatarUrl?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  lawFirmName?: string; // Added to support Admin page displaying law firm names
}

export interface Feature {
  id: string;
  name: string;
  description?: string;
  basicEnabled: boolean;
  standardEnabled: boolean;
  premiumEnabled: boolean;
  enterpriseEnabled: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string;
}

// Add authentication related interfaces
export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
}

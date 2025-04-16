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
  legalDescription: string;
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
  type: "Demand Letter" | "Petition" | "Order Nisi" | "Conduct of Sale" | "Other";
  createdAt: string;
  status: "Draft" | "Finalized";
  caseId: string;
  url?: string;
  caseNumber?: string; // Add this property to fix errors
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

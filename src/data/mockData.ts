import { Case, Deadline, Document, LawFirm, Mortgage, Party, Property, RecentActivity, UserProfile } from "@/types";

// Mock data for properties
export const mockProperties: Property[] = [
  {
    id: "prop-1",
    address: {
      street: "123 Main Street",
      city: "Vancouver",
      province: "BC",
      postalCode: "V6K 1P3"
    },
    pid: "005-123-456",
    legal_description: "Lot 1, Block A, Plan 12345",
    propertyType: "Residential",
    estimatedValue: 950000
  },
  {
    id: "prop-2",
    address: {
      street: "456 Oak Avenue",
      city: "Burnaby",
      province: "BC",
      postalCode: "V5G 2H4"
    },
    pid: "006-789-012",
    legal_description: "Lot 2, Block B, Plan 67890",
    propertyType: "Commercial",
    estimatedValue: 1200000
  },
  {
    id: "prop-3",
    address: {
      street: "789 Pine Lane",
      city: "Surrey",
      province: "BC",
      postalCode: "V3R 5S7"
    },
    pid: "007-234-567",
    legal_description: "Lot 3, Block C, Plan 23456",
    propertyType: "Land",
    estimatedValue: 500000
  }
];

// Mock data for parties
export const mockParties: Party[] = [
  {
    id: "party-1",
    name: "John Smith",
    type: "Borrower",
    contactInfo: {
      email: "john.smith@example.com",
      phone: "604-123-4567"
    }
  },
  {
    id: "party-2",
    name: "Jane Doe",
    type: "Lender",
    contactInfo: {
      email: "jane.doe@example.com",
      phone: "604-987-6543"
    }
  },
  {
    id: "party-3",
    name: "Acme Corp",
    type: "ThirdParty",
    contactInfo: {
      email: "info@acmecorp.com",
      phone: "604-555-1212"
    }
  }
];

// Mock data for mortgages
export const mockMortgages: Mortgage[] = [
  {
    id: "mortgage-1",
    registrationNumber: "M123456",
    principal: 800000,
    interestRate: 0.035,
    startDate: "2020-01-15T08:00:00.000Z",
    paymentAmount: 3500,
    paymentFrequency: "Monthly",
    currentBalance: 750000,
    perDiemInterest: 76.71
  },
  {
    id: "mortgage-2",
    registrationNumber: "M654321",
    principal: 500000,
    interestRate: 0.04,
    startDate: "2021-05-20T08:00:00.000Z",
    paymentAmount: 2500,
    paymentFrequency: "Monthly",
    currentBalance: 450000,
    perDiemInterest: 54.79
  }
];

// Mock data for deadlines
export const mockDeadlines: Deadline[] = [
  {
    id: "deadline-1",
    caseId: "case-1",
    title: "File Petition",
    description: "File the petition with the court",
    date: "2023-06-30T08:00:00.000Z",
    complete: false,
    type: "Court"
  },
  {
    id: "deadline-2",
    caseId: "case-1",
    title: "Serve Defendant",
    description: "Serve the defendant with the petition",
    date: "2023-07-15T08:00:00.000Z",
    complete: false,
    type: "Statutory"
  }
];

// Mock data for documents
export const mockDocuments: Document[] = [
  {
    id: "doc-1",
    caseId: "case-1",
    title: "Demand Letter",
    type: "Demand Letter",
    createdAt: "2023-05-01T08:00:00.000Z",
    status: "Finalized",
    url: "/docs/demand-letter.pdf"
  },
  {
    id: "doc-2",
    caseId: "case-1",
    title: "Petition",
    type: "Petition",
    createdAt: "2023-06-01T08:00:00.000Z",
    status: "Draft",
    url: "/docs/petition.pdf"
  }
];

// Mock data for cases
export const mockCases: Case[] = [
  {
    id: "case-1",
    fileNumber: "MOR-2023-001",
    status: "Demand Letter Sent",
    property: {
      id: "prop-1",
      address: {
        street: "123 Main Street",
        city: "Vancouver",
        province: "BC",
        postalCode: "V6K 1P3"
      },
      pid: "005-123-456",
      legal_description: "Lot 1, Block A, Plan 12345",
      propertyType: "Residential",
      estimatedValue: 950000
    },
    mortgage: {
      id: "mortgage-1",
      registrationNumber: "M123456",
      principal: 800000,
      interestRate: 0.035,
      startDate: "2020-01-15T08:00:00.000Z",
      paymentAmount: 3500,
      paymentFrequency: "Monthly",
      currentBalance: 750000,
      perDiemInterest: 76.71
    },
    parties: [
      {
        id: "party-1",
        name: "John Smith",
        type: "Borrower",
        contactInfo: {
          email: "john.smith@example.com",
          phone: "604-123-4567"
        }
      },
      {
        id: "party-2",
        name: "Jane Doe",
        type: "Lender",
        contactInfo: {
          email: "jane.doe@example.com",
          phone: "604-987-6543"
        }
      }
    ],
    createdAt: "2023-05-01T08:00:00.000Z",
    updatedAt: "2023-05-15T08:00:00.000Z",
    deadlines: [
      {
        id: "deadline-1",
        caseId: "case-1",
        title: "File Petition",
        description: "File the petition with the court",
        date: "2023-06-30T08:00:00.000Z",
        complete: false,
        type: "Court"
      }
    ],
    documents: [
      {
        id: "doc-1",
        caseId: "case-1",
        title: "Demand Letter",
        type: "Demand Letter",
        createdAt: "2023-05-01T08:00:00.000Z",
        status: "Finalized",
        url: "/docs/demand-letter.pdf"
      }
    ]
  },
  {
    id: "case-2",
    fileNumber: "MOR-2023-002",
    status: "Petition Filed",
    property: {
      id: "prop-2",
      address: {
        street: "456 Oak Avenue",
        city: "Burnaby",
        province: "BC",
        postalCode: "V5G 2H4"
      },
      pid: "006-789-012",
      legal_description: "Lot 2, Block B, Plan 67890",
      propertyType: "Commercial",
      estimatedValue: 1200000
    },
    mortgage: {
      id: "mortgage-2",
      registrationNumber: "M654321",
      principal: 500000,
      interestRate: 0.04,
      startDate: "2021-05-20T08:00:00.000Z",
      paymentAmount: 2500,
      paymentFrequency: "Monthly",
      currentBalance: 450000,
      perDiemInterest: 54.79
    },
    parties: [
      {
        id: "party-3",
        name: "Acme Corp",
        type: "ThirdParty",
        contactInfo: {
          email: "info@acmecorp.com",
          phone: "604-555-1212"
        }
      }
    ],
    createdAt: "2023-06-01T08:00:00.000Z",
    updatedAt: "2023-06-15T08:00:00.000Z",
    deadlines: [
      {
        id: "deadline-2",
        caseId: "case-2",
        title: "Serve Defendant",
        description: "Serve the defendant with the petition",
        date: "2023-07-15T08:00:00.000Z",
        complete: false,
        type: "Statutory"
      }
    ],
    documents: [
      {
        id: "doc-2",
        caseId: "case-2",
        title: "Petition",
        type: "Petition",
        createdAt: "2023-06-01T08:00:00.000Z",
        status: "Draft",
        url: "/docs/petition.pdf"
      }
    ]
  }
];

export const mockRecentActivities: RecentActivity[] = [
  {
    id: "activity-1",
    caseId: "case-1",
    action: "Demand letter sent",
    timestamp: "2023-07-20T14:30:00.000Z",
    user: "John Doe",
    details: "Demand letter was sent to John Smith."
  },
  {
    id: "activity-2",
    caseId: "case-2",
    action: "Petition filed",
    timestamp: "2023-07-21T09:15:00.000Z",
    user: "Jane Smith",
    details: "Petition was filed with the court."
  },
  {
    id: "activity-3",
    caseId: "case-1",
    action: "Deadline approaching",
    timestamp: "2023-07-22T16:45:00.000Z",
    user: "System",
    details: "Deadline for serving defendant is approaching."
  }
];

export const mockLawFirms: LawFirm[] = [
  {
    id: 'lf-1',
    name: 'Smith & Jones Law',
    subscriptionTier: 'standard',
    subscriptionStatus: 'active',
    subscriptionStartDate: '2023-01-01T00:00:00.000Z',
    subscriptionEndDate: '2023-12-31T00:00:00.000Z',
    settings: {
      notificationsEnabled: true,
      theme: 'dark'
    },
    logoUrl: '/logos/smith-jones-law.png',
    contactEmail: 'info@smithjoneslaw.com',
    contactPhone: '604-555-5555',
    address: '123 Main St, Vancouver, BC',
    enabled: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-07-23T12:00:00.000Z'
  },
  {
    id: 'lf-2',
    name: 'Legal Solutions Inc.',
    subscriptionTier: 'premium',
    subscriptionStatus: 'active',
    subscriptionStartDate: '2023-02-15T00:00:00.000Z',
    subscriptionEndDate: '2024-02-14T00:00:00.000Z',
    settings: {
      notificationsEnabled: false,
      theme: 'light'
    },
    logoUrl: '/logos/legal-solutions.png',
    contactEmail: 'contact@legalsolutions.com',
    contactPhone: '604-555-1234',
    address: '456 Oak Ave, Burnaby, BC',
    enabled: true,
    createdAt: '2023-02-15T00:00:00.000Z',
    updatedAt: '2023-07-23T12:00:00.000Z'
  }
];

export const mockUserProfiles: UserProfile[] = [
  {
    id: 'user-1',
    lawFirmId: 'lf-1',
    firstName: 'Alice',
    lastName: 'Smith',
    role: 'admin',
    email: 'alice.smith@smithjoneslaw.com',
    avatarUrl: '/avatars/alice.png',
    createdAt: '2023-01-05T00:00:00.000Z',
    updatedAt: '2023-07-23T12:00:00.000Z',
    lawFirmName: 'Smith & Jones Law'
  },
  {
    id: 'user-2',
    lawFirmId: 'lf-1',
    firstName: 'Bob',
    lastName: 'Johnson',
    role: 'staff',
    email: 'bob.johnson@smithjoneslaw.com',
    avatarUrl: '/avatars/bob.png',
    createdAt: '2023-02-01T00:00:00.000Z',
    updatedAt: '2023-07-23T12:00:00.000Z',
    lawFirmName: 'Smith & Jones Law'
  },
  {
    id: 'user-3',
    lawFirmId: 'lf-2',
    firstName: 'Charlie',
    lastName: 'Brown',
    role: 'manager',
    email: 'charlie.brown@legalsolutions.com',
    avatarUrl: '/avatars/charlie.png',
    createdAt: '2023-03-10T00:00:00.000Z',
    updatedAt: '2023-07-23T12:00:00.000Z',
    lawFirmName: 'Legal Solutions Inc.'
  }
];

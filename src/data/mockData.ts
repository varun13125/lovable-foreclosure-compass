
import { Case, RecentActivity } from '../types';

const currentDate = new Date();

const generateDateString = (daysToAdd: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString();
};

export const mockCases: Case[] = [
  {
    id: '1',
    fileNumber: 'FC-2023-001',
    status: 'New',
    property: {
      id: '1',
      address: {
        street: '123 Main Street',
        city: 'Vancouver',
        province: 'BC',
        postalCode: 'V6B 2W9',
      },
      pid: '012-345-678',
      legalDescription: 'Lot 1, Block A, District Lot 123, Plan 456',
      propertyType: 'Residential',
      estimatedValue: 850000,
    },
    mortgage: {
      id: '1',
      registrationNumber: 'CA123456',
      principal: 450000,
      interestRate: 4.5,
      startDate: '2020-01-15',
      paymentAmount: 2275.33,
      paymentFrequency: 'Monthly',
      currentBalance: 410350.22,
      perDiemInterest: 50.55,
      arrears: 12000,
    },
    parties: [
      {
        id: '1',
        name: 'John Smith',
        type: 'Borrower',
        contactInfo: {
          email: 'john@example.com',
          phone: '604-555-1234',
          address: '123 Main Street, Vancouver, BC, V6B 2W9',
        },
      },
      {
        id: '2',
        name: 'First BC Credit Union',
        type: 'Lender',
        contactInfo: {
          email: 'lending@firstbc.com',
          phone: '604-555-5678',
          address: '789 Granville St, Vancouver, BC, V6Z 1X6',
        },
      },
    ],
    createdAt: generateDateString(-5),
    updatedAt: generateDateString(-2),
    deadlines: [
      {
        id: '1',
        title: 'Send Demand Letter',
        description: 'Send formal demand letter to borrower',
        date: generateDateString(2),
        complete: false,
        caseId: '1',
        type: 'Internal',
      },
      {
        id: '2',
        title: 'Follow up on Demand Letter',
        description: '10-day follow up after demand letter',
        date: generateDateString(12),
        complete: false,
        caseId: '1',
        type: 'Statutory',
      },
    ],
    documents: [],
    notes: 'Client wants to proceed with foreclosure due to missed payments over 3 months.'
  },
  {
    id: '2',
    fileNumber: 'FC-2023-002',
    status: 'Demand Letter Sent',
    property: {
      id: '2',
      address: {
        street: '456 Oak Avenue',
        city: 'Victoria',
        province: 'BC',
        postalCode: 'V8V 3K3',
      },
      pid: '987-654-321',
      legalDescription: 'Lot 7, Plan VIP12345, Section 10',
      propertyType: 'Residential',
      estimatedValue: 735000,
    },
    mortgage: {
      id: '2',
      registrationNumber: 'CA654321',
      principal: 385000,
      interestRate: 3.75,
      startDate: '2019-06-01',
      paymentAmount: 1855.42,
      paymentFrequency: 'Monthly',
      currentBalance: 345200.75,
      perDiemInterest: 35.42,
      arrears: 9200,
    },
    parties: [
      {
        id: '3',
        name: 'Sarah Johnson',
        type: 'Borrower',
        contactInfo: {
          email: 'sarah@example.com',
          phone: '250-555-9876',
          address: '456 Oak Avenue, Victoria, BC, V8V 3K3',
        },
      },
      {
        id: '4',
        name: 'West Coast Bank',
        type: 'Lender',
        contactInfo: {
          email: 'mortgages@wcbank.com',
          phone: '250-555-4321',
          address: '123 Banking Street, Victoria, BC, V8V 1A1',
        },
      },
    ],
    createdAt: generateDateString(-20),
    updatedAt: generateDateString(-7),
    deadlines: [
      {
        id: '3',
        title: 'Demand Letter Response Deadline',
        description: '10-day statutory deadline for response',
        date: generateDateString(3),
        complete: false,
        caseId: '2',
        type: 'Statutory',
      },
      {
        id: '4',
        title: 'Prepare Petition',
        description: 'Prepare petition if no response to demand letter',
        date: generateDateString(4),
        complete: false,
        caseId: '2',
        type: 'Internal',
      },
    ],
    documents: [
      {
        id: '1',
        title: 'Demand Letter',
        type: 'Demand Letter',
        createdAt: generateDateString(-7),
        status: 'Finalized',
        caseId: '2',
      },
    ],
    notes: 'Demand letter sent via registered mail. Awaiting response from borrower.'
  },
  {
    id: '3',
    fileNumber: 'FC-2023-003',
    status: 'Order Nisi Granted',
    property: {
      id: '3',
      address: {
        street: '789 Cedar Road',
        city: 'Kelowna',
        province: 'BC',
        postalCode: 'V1Y 3B3',
      },
      pid: '456-789-012',
      legalDescription: 'Lot 12, Plan KAP87654',
      propertyType: 'Residential',
      estimatedValue: 620000,
    },
    mortgage: {
      id: '3',
      registrationNumber: 'CA987654',
      principal: 325000,
      interestRate: 4.2,
      startDate: '2018-03-15',
      paymentAmount: 1587.65,
      paymentFrequency: 'Monthly',
      currentBalance: 287432.87,
      perDiemInterest: 33.12,
      arrears: 15300,
    },
    parties: [
      {
        id: '5',
        name: 'Michael Chen',
        type: 'Borrower',
        contactInfo: {
          email: 'michael@example.com',
          phone: '250-555-7777',
          address: '789 Cedar Road, Kelowna, BC, V1Y 3B3',
        },
      },
      {
        id: '6',
        name: 'Interior Savings',
        type: 'Lender',
        contactInfo: {
          email: 'loans@interiorsavings.com',
          phone: '250-555-8888',
          address: '555 Banking Ave, Kelowna, BC, V1Y 1A1',
        },
      },
    ],
    createdAt: generateDateString(-90),
    updatedAt: generateDateString(-15),
    court: {
      fileNumber: 'S-12345',
      registry: 'Kelowna',
      hearingDate: generateDateString(-15),
      judgeName: 'Justice Williams',
    },
    deadlines: [
      {
        id: '5',
        title: 'Redemption Period End',
        description: '6-month statutory redemption period',
        date: generateDateString(165),
        complete: false,
        caseId: '3',
        type: 'Statutory',
      },
    ],
    documents: [
      {
        id: '2',
        title: 'Demand Letter',
        type: 'Demand Letter',
        createdAt: generateDateString(-85),
        status: 'Finalized',
        caseId: '3',
      },
      {
        id: '3',
        title: 'Petition',
        type: 'Petition',
        createdAt: generateDateString(-70),
        status: 'Filed',
        caseId: '3',
      },
      {
        id: '4',
        title: 'Affidavit of Service',
        type: 'Affidavit',
        createdAt: generateDateString(-65),
        status: 'Filed',
        caseId: '3',
      },
      {
        id: '5',
        title: 'Order Nisi',
        type: 'Order Nisi',
        createdAt: generateDateString(-15),
        status: 'Filed',
        caseId: '3',
      },
    ],
    notes: 'Order Nisi granted with standard 6-month redemption period.'
  },
  {
    id: '4',
    fileNumber: 'FC-2023-004',
    status: 'Sale Process',
    property: {
      id: '4',
      address: {
        street: '321 Fir Street',
        city: 'Richmond',
        province: 'BC',
        postalCode: 'V6Y 2B2',
      },
      pid: '234-567-890',
      legalDescription: 'Lot 3, Block C, Plan LMP12345',
      propertyType: 'Commercial',
      estimatedValue: 1250000,
    },
    mortgage: {
      id: '4',
      registrationNumber: 'CA567890',
      principal: 825000,
      interestRate: 5.1,
      startDate: '2017-11-01',
      paymentAmount: 4475.92,
      paymentFrequency: 'Monthly',
      currentBalance: 732450.66,
      perDiemInterest: 102.56,
      arrears: 53550,
    },
    parties: [
      {
        id: '7',
        name: 'Richmond Business Corp.',
        type: 'Borrower',
        contactInfo: {
          email: 'info@richmondbusiness.com',
          phone: '604-555-2222',
          address: '321 Fir Street, Richmond, BC, V6Y 2B2',
        },
      },
      {
        id: '8',
        name: 'Pacific Financial',
        type: 'Lender',
        contactInfo: {
          email: 'commercial@pacificfin.com',
          phone: '604-555-3333',
          address: '888 Lender Way, Vancouver, BC, V6C 1H2',
        },
      },
    ],
    createdAt: generateDateString(-270),
    updatedAt: generateDateString(-30),
    court: {
      fileNumber: 'H-98765',
      registry: 'Vancouver',
      hearingDate: generateDateString(-180),
      judgeName: 'Justice Thompson',
    },
    deadlines: [
      {
        id: '6',
        title: 'Review Sale Offers',
        description: 'Review incoming offers for property',
        date: generateDateString(10),
        complete: false,
        caseId: '4',
        type: 'Internal',
      },
      {
        id: '7',
        title: 'Court Approval of Sale',
        description: 'Hearing for approval of sale',
        date: generateDateString(45),
        complete: false,
        caseId: '4',
        type: 'Court',
      },
    ],
    documents: [
      {
        id: '6',
        title: 'Order Nisi',
        type: 'Order Nisi',
        createdAt: generateDateString(-180),
        status: 'Filed',
        caseId: '4',
      },
      {
        id: '7',
        title: 'Conduct of Sale Order',
        type: 'Conduct of Sale',
        createdAt: generateDateString(-90),
        status: 'Filed',
        caseId: '4',
      },
    ],
    notes: 'Property listed for sale. First offer received but below market value.'
  },
];

export const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    caseId: '1',
    action: 'Case Created',
    timestamp: generateDateString(-5),
    user: 'Jennifer Lee',
    details: 'New foreclosure case opened'
  },
  {
    id: '2',
    caseId: '1',
    action: 'Document Uploaded',
    timestamp: generateDateString(-2),
    user: 'Jennifer Lee',
    details: 'Mortgage statement uploaded'
  },
  {
    id: '3',
    caseId: '2',
    action: 'Status Changed',
    timestamp: generateDateString(-7),
    user: 'Robert Chen',
    details: 'Changed from New to Demand Letter Sent'
  },
  {
    id: '4',
    caseId: '2',
    action: 'Document Generated',
    timestamp: generateDateString(-7),
    user: 'Robert Chen',
    details: 'Demand letter generated and sent'
  },
  {
    id: '5',
    caseId: '3',
    action: 'Court Date Added',
    timestamp: generateDateString(-20),
    user: 'Sarah Johnson',
    details: 'Hearing scheduled for Order Nisi'
  },
  {
    id: '6',
    caseId: '3',
    action: 'Status Changed',
    timestamp: generateDateString(-15),
    user: 'Sarah Johnson',
    details: 'Changed from Petition Filed to Order Nisi Granted'
  },
  {
    id: '7',
    caseId: '4',
    action: 'Property Listed',
    timestamp: generateDateString(-60),
    user: 'Michael Wong',
    details: 'Property listed for sale with Realty Group'
  },
  {
    id: '8',
    caseId: '4',
    action: 'Offer Received',
    timestamp: generateDateString(-15),
    user: 'Michael Wong',
    details: 'Offer received for $1.1M'
  }
];

export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    'New': 'status-new',
    'Demand Letter Sent': 'status-demand',
    'Petition Filed': 'status-petition',
    'Order Nisi Granted': 'status-ordernisi',
    'Redemption Period': 'status-redemption',
    'Sale Process': 'status-sale',
    'Closed': 'status-closed'
  };
  
  return statusMap[status] || 'bg-gray-400';
};

export const getCaseById = (id: string): Case | undefined => {
  return mockCases.find(c => c.id === id);
};

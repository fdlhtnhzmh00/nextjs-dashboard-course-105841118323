import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';

export const MOCK_REVENUE: Revenue[] = [
  { month: 'Jan', revenue: 2000 },
  { month: 'Feb', revenue: 1800 },
  { month: 'Mar', revenue: 2200 },
  { month: 'Apr', revenue: 2500 },
  { month: 'May', revenue: 2300 },
  { month: 'Jun', revenue: 2400 },
  { month: 'Jul', revenue: 2100 },
  { month: 'Aug', revenue: 2600 },
  { month: 'Sep', revenue: 2700 },
  { month: 'Oct', revenue: 2800 },
  { month: 'Nov', revenue: 2900 },
  { month: 'Dec', revenue: 3000 },
];

export const MOCK_LATEST_INVOICES: LatestInvoiceRaw[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', image_url: '/customers/default.png', amount: 1000 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', image_url: '/customers/default.png', amount: 2000 },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', image_url: '/customers/default.png', amount: 1500 },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', image_url: '/customers/default.png', amount: 1800 },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', image_url: '/customers/default.png', amount: 2200 },
];

export const MOCK_CUSTOMERS: CustomerField[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Bob Johnson' },
  { id: '4', name: 'Alice Brown' },
  { id: '5', name: 'Charlie Wilson' },
];

export const MOCK_INVOICES: InvoicesTable[] = [
  {
    id: '1',
    customer_id: '1',
    amount: 1000,
    date: '2024-01-15',
    status: 'paid',
    name: 'John Doe',
    email: 'john@example.com',
    image_url: '/customers/default.png',
  },
  {
    id: '2',
    customer_id: '2',
    amount: 2000,
    date: '2024-01-20',
    status: 'pending',
    name: 'Jane Smith',
    email: 'jane@example.com',
    image_url: '/customers/default.png',
  },
];

export const MOCK_CARD_DATA = {
  numberOfCustomers: 5,
  numberOfInvoices: 10,
  totalPaidInvoices: '$5,000',
  totalPendingInvoices: '$2,500',
};

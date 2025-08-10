import postgres from 'postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { MOCK_REVENUE, MOCK_LATEST_INVOICES, MOCK_CUSTOMERS, MOCK_CARD_DATA } from './mock-data'; // Import MOCK_CARD_DATA

// ... (MOCK_REVENUE, MOCK_LATEST_INVOICES, MOCK_CUSTOMERS remain the same)

// Coba koneksi ke database, fallback ke mock data jika gagal
let sql: any = null;
try {
  if (process.env.POSTGRES_URL) {
    sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  }
} catch (error) {
  console.warn('Database connection failed, using mock data');
}

export async function fetchRevenue() {
  try {
    if (!sql) {
      // Return mock data jika database tidak tersedia
      return MOCK_REVENUE;
    }

    const data = await sql<Revenue[]>`
  SELECT * FROM revenue ORDER BY CASE
    WHEN month = 'Jan' THEN 1
    WHEN month = 'Feb' THEN 2
    WHEN month = 'Mar' THEN 3
    WHEN month = 'Apr' THEN 4
    WHEN month = 'May' THEN 5
    WHEN month = 'Jun' THEN 6
    WHEN month = 'Jul' THEN 7
    WHEN month = 'Aug' THEN 8
    WHEN month = 'Sep' THEN 9
    WHEN month = 'Oct' THEN 10
    WHEN month = 'Nov' THEN 11
    WHEN month = 'Dec' THEN 12
  END ASC
`;

    return data;
  } catch (error) {
    console.warn('Database error, using mock data:', error);
    return MOCK_REVENUE;
  }
}

export async function fetchLatestInvoices() {
  try {
    if (!sql) {
      // Return mock data jika database tidak tersedia
      const mockData = MOCK_LATEST_INVOICES.map((invoice: LatestInvoiceRaw) => ({
        ...invoice,
        amount: formatCurrency(invoice.amount),
      }));
      return mockData;
    }

    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice: LatestInvoiceRaw) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.warn('Database error, using mock data:', error);
    const mockData = MOCK_LATEST_INVOICES.map((invoice: LatestInvoiceRaw) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return mockData;
  }
}

export async function fetchCardData() {
  try {
    if (!sql) { // Add this check
      console.warn('Database not available, using mock card data.');
      return MOCK_CARD_DATA; // Return mock data if sql is null
    }

    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? '0');
    const numberOfCustomers = Number(data[1][0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    // Also return mock data on database error for fetchCardData
    console.warn('Database error fetching card data, using mock data.');
    return MOCK_CARD_DATA;
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice: LatestInvoiceRaw) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    // Perbaikan ada di baris ini: tambahkan tipe data untuk 'customer'
    const customers = data.map((customer: CustomerField) => ({...customer}));
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType[]>`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        COUNT(invoices.id) AS total_invoices,
        SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
      GROUP BY customers.id, customers.name, customers.email, customers.image_url
      ORDER BY customers.name ASC
    `;

    // Perbaikan di sini: tambahkan tipe data untuk parameter 'customer'
    const customers = data.rows.map((customer: CustomersTableType) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function fetchCustomersPages(query: string) {
  try {
    const count = await sql`
      SELECT COUNT(*)
      FROM customers
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(count[0].count) / 6); // Asumsikan 6 item per halaman
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of customers.');
  }
}

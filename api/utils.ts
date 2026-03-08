/**
 * Utility functions for order_count calculation
 */

/**
 * Normalize string: trim and lowercase
 */
export function normalizeString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim().toLowerCase();
}

/**
 * Normalize date to YYYY-MM-DD format
 */
export function normalizeDate(value: any): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const str = String(value).trim();
  if (!str) {
    return null;
  }

  // If it's already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // If it contains time, extract date part
  if (str.includes('T')) {
    return str.split('T')[0];
  }

  // If it contains space, extract date part
  if (str.includes(' ')) {
    const datePart = str.split(' ')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart;
    }
  }

  // Try to parse DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  const match = str.match(ddmmyyyy);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return null;
}

/**
 * Check if shift matches with special logic
 * - "Hết ca" matches "Hết ca", "Giữa ca,Hết ca", "Hết ca,Giữa ca"
 * - "Giữa ca" matches "Giữa ca", "Giữa ca,Hết ca", "Hết ca,Giữa ca"
 * - Other cases: exact match or contains
 */
export function matchesShift(salesReportShift: string, orderShift: string): boolean {
  const reportShift = normalizeString(salesReportShift);
  const orderShiftNorm = normalizeString(orderShift);

  if (!reportShift || !orderShiftNorm) {
    return false;
  }

  // Special logic for "Hết ca"
  if (reportShift === 'hết ca') {
    return orderShiftNorm.includes('hết ca');
  }

  // Special logic for "Giữa ca"
  if (reportShift === 'giữa ca') {
    return orderShiftNorm.includes('giữa ca');
  }

  // For other cases: exact match or contains
  return orderShiftNorm === reportShift || orderShiftNorm.includes(reportShift);
}

/**
 * Check if an order matches a sales report record
 */
export function orderMatchesSalesReport(
  order: any,
  salesReport: any
): boolean {
  // 1. Name matching: name (sales_reports) = sale_staff (orders)
  const reportName = normalizeString(salesReport.name || salesReport.ten || salesReport.Tên);
  const orderSaleStaff = normalizeString(order.sale_staff);
  if (reportName !== orderSaleStaff) {
    return false;
  }

  // 2. Date matching: date (sales_reports) = order_date (orders)
  const reportDate = normalizeDate(salesReport.date || salesReport.ngay || salesReport.Ngày);
  const orderDate = normalizeDate(order.order_date);
  if (!reportDate || !orderDate || reportDate !== orderDate) {
    return false;
  }

  // 3. Shift matching (special logic)
  const reportShift = String(salesReport.shift || salesReport.ca || salesReport.casle || '').trim();
  const orderShift = String(order.shift || '').trim();
  if (reportShift && !matchesShift(reportShift, orderShift)) {
    return false;
  }

  // 4. Product matching (optional - skip if empty)
  const reportProduct = normalizeString(salesReport.product || salesReport.san_pham || salesReport.Sản_phẩm);
  if (reportProduct) {
    const orderProduct = normalizeString(order.product);
    if (reportProduct !== orderProduct) {
      return false;
    }
  }

  // 5. Market matching (optional - skip if empty)
  const reportMarket = normalizeString(salesReport.market || salesReport.thi_truong || salesReport.Thị_trường);
  if (reportMarket) {
    const orderCountry = normalizeString(order.country);
    if (reportMarket !== orderCountry) {
      return false;
    }
  }

  return true;
}

/**
 * Fetch all orders with pagination
 * Optionally filter by date range for better performance
 */
export async function fetchAllOrders(
  supabase: any,
  batchSize: number = 10000,
  dateFilter?: { from?: string; to?: string }
): Promise<any[]> {
  const allOrders: any[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from('orders')
      .select('id, sale_staff, order_date, shift, product, country');

    // Apply date filter if provided
    if (dateFilter?.from) {
      query = query.gte('order_date', dateFilter.from);
    }
    if (dateFilter?.to) {
      query = query.lte('order_date', dateFilter.to);
    }

    const { data, error } = await query.range(offset, offset + batchSize - 1);

    if (error) {
      throw new Error(`Error fetching orders: ${error.message}`);
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allOrders.push(...data);
      offset += batchSize;
      hasMore = data.length === batchSize;
    }
  }

  return allOrders;
}

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
 * Normalize Vietnamese names for fuzzy matching:
 * - remove accents
 * - lowercase
 * - collapse multiple spaces
 */
export function normalizeNameForMatch(value: any): string {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) {
    return '';
  }

  // NFD + strip diacritics (works for most accented characters)
  const noAccents = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

  return noAccents.replace(/\s+/g, ' ').trim();
}

/**
 * Fuzzy name matching:
 * - exact match after normalization
 * - one normalized name contains the other
 */
export function namesMatch(name1: any, name2: any): boolean {
  const n1 = normalizeNameForMatch(name1);
  const n2 = normalizeNameForMatch(name2);

  if (!n1 || !n2) {
    return false;
  }

  return n1 === n2 || n1.includes(n2) || n2.includes(n1);
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

  // For other shift values: exact match
  return orderShiftNorm === reportShift;
}

/**
 * Parse number safely from mixed formats (e.g. 1000000, "1,000,000", "1.000.000")
 */
export function safeToNumber(value: any): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const raw = String(value ?? '').trim();
  if (!raw) {
    return 0;
  }

  const normalized = raw
    .replace(/\s/g, '')
    .replace(/,/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '');

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Pick revenue field by priority and parse into number.
 */
export function getOrderRevenue(order: any): number {
  const candidates = [
    order?.total_amount_vnd,
    order?.total_vnd,
    order?.tongtien,
    order?.revenue_vnd,
    order?.total_amount,
    order?.amount,
  ];

  for (const candidate of candidates) {
    const amount = safeToNumber(candidate);
    if (amount !== 0) {
      return amount;
    }
  }

  return 0;
}

/**
 * Check if an order matches a sales report record
 */
export function orderMatchesSalesReport(
  order: any,
  salesReport: any
): boolean {
  // 1. Name matching: name (sales_reports) = sale_staff (orders)
  const reportName = salesReport.name || salesReport.ten || salesReport.Tên;
  const orderSaleStaff = order.nhanvien_sale || order.sale_staff;
  if (!namesMatch(orderSaleStaff, reportName)) {
    return false;
  }

  // 2. Sale Name matching: additional filter by sale name field
  // Check if sales_report has a sale_name field and match with order's sale_staff
  const reportSaleName = salesReport.sale_name || salesReport.sale || salesReport.ten_sale || salesReport.Tên_Sale;
  if (reportSaleName) {
    const normalizedReportSaleName = normalizeNameForMatch(reportSaleName);
    const normalizedOrderSaleStaff = normalizeNameForMatch(orderSaleStaff);
    if (normalizedReportSaleName && normalizedOrderSaleStaff) {
      // Must match exactly or contain each other
      if (normalizedReportSaleName !== normalizedOrderSaleStaff && 
          !normalizedReportSaleName.includes(normalizedOrderSaleStaff) && 
          !normalizedOrderSaleStaff.includes(normalizedReportSaleName)) {
        return false;
      }
    }
  }

  // 3. Date matching: date (sales_reports) = order_date (orders)
  const reportDate = normalizeDate(salesReport.date || salesReport.ngay || salesReport.Ngày);
  const orderDate = normalizeDate(order.order_date);
  if (!reportDate || !orderDate || reportDate !== orderDate) {
    return false;
  }

  // 4. Shift matching - BỎ QUA (không kiểm tra shift)
  // Shift matching đã được bỏ qua theo yêu cầu

  // 5. Product matching (optional - skip if empty)
  const reportProduct = normalizeString(salesReport.product || salesReport.san_pham || salesReport.Sản_phẩm);
  if (reportProduct) {
    const orderProduct = normalizeString(order.product);
    if (reportProduct !== orderProduct) {
      return false;
    }
  }

  // 6. Market matching (optional - skip if empty)
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
      .select('id, sale_staff, order_date, shift, product, country, check_result, total_amount_vnd, total_vnd');

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

/**
 * Calculate order statistics for a sales report
 * Returns: order_count, order_cancel_count_actual, revenue_actual, revenue_cancel_actual, order_success_count
 */
export function calculateOrderStatistics(
  orders: any[],
  salesReport: any
): {
  order_count: number;
  order_cancel_count_actual: number;
  revenue_actual: number;
  revenue_cancel_actual: number;
  order_success_count: number;
} {
  let orderCount = 0;
  let orderCancelCount = 0;
  let revenueActual = 0;
  let revenueCancelActual = 0;

  for (const order of orders) {
    if (orderMatchesSalesReport(order, salesReport)) {
      orderCount++;
      
      // Calculate revenue using prioritized field fallback.
      const amount = getOrderRevenue(order);
      revenueActual += amount;

      // Check if order is cancelled
      const checkResult = normalizeString(order.check_result);
      if (checkResult === 'hủy') {
        orderCancelCount++;
        revenueCancelActual += amount;
      }
    }
  }

  const orderSuccessCount = orderCount - orderCancelCount;

  return {
    order_count: orderCount,
    order_cancel_count_actual: orderCancelCount,
    revenue_actual: revenueActual,
    revenue_cancel_actual: revenueCancelActual,
    order_success_count: orderSuccessCount,
  };
}

/**
 * Update sales report stats with graceful fallback when some columns do not exist.
 */
export async function updateSalesReportStatistics(
  supabase: any,
  reportId: string,
  stats: {
    order_count: number;
    order_cancel_count_actual: number;
    revenue_actual: number;
    revenue_cancel_actual: number;
    order_success_count: number;
  }
): Promise<{ ok: boolean; usedFields: string[]; error?: string }> {
  const payloads: Array<Record<string, number>> = [
    {
      order_count: Number(stats.order_count) || 0,
      order_cancel_count_actual: Number(stats.order_cancel_count_actual) || 0,
      revenue_actual: Number.isFinite(stats.revenue_actual) ? Number(stats.revenue_actual) : 0,
      revenue_cancel_actual: Number.isFinite(stats.revenue_cancel_actual) ? Number(stats.revenue_cancel_actual) : 0,
      order_success_count: Number(stats.order_success_count) || 0,
    },
    {
      order_count: Number(stats.order_count) || 0,
      order_cancel_count: Number(stats.order_cancel_count_actual) || 0,
      revenue_actual: Number.isFinite(stats.revenue_actual) ? Number(stats.revenue_actual) : 0,
      revenue_cancel_actual: Number.isFinite(stats.revenue_cancel_actual) ? Number(stats.revenue_cancel_actual) : 0,
    },
    {
      order_count: Number(stats.order_count) || 0,
      order_cancel_count_actual: Number(stats.order_cancel_count_actual) || 0,
    },
    {
      revenue_actual: Number.isFinite(stats.revenue_actual) ? Number(stats.revenue_actual) : 0,
      revenue_cancel_actual: Number.isFinite(stats.revenue_cancel_actual) ? Number(stats.revenue_cancel_actual) : 0,
    },
    {
      order_count: Number(stats.order_count) || 0,
    },
  ];

  let lastError = '';
  for (const payload of payloads) {
    const { error } = await supabase
      .from('sales_reports')
      .update(payload)
      .eq('id', reportId);

    if (!error) {
      return { ok: true, usedFields: Object.keys(payload) };
    }

    lastError = error.message || String(error);
    if (error.code !== 'PGRST204') {
      return { ok: false, usedFields: Object.keys(payload), error: lastError };
    }
  }

  return { ok: false, usedFields: [], error: lastError || 'Unknown update error' };
}

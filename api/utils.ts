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
  salesReport: any,
  debug: boolean = false
): boolean {
  // 1. Name matching: name (sales_reports) = sale_staff (orders)
  // Try multiple field name variations for sales_report
  const reportName = salesReport.name || salesReport.ten || salesReport.Tên || salesReport.nhanvien || salesReport.nhan_vien;
  
  // Try multiple field name variations for order (only use fields that exist in DB)
  const orderSaleStaff = order.sale_staff || order.sale || order.staff;
  
  if (!reportName || !orderSaleStaff) {
    if (debug) console.log(`[MATCH DEBUG] Missing name: reportName="${reportName}", orderSaleStaff="${orderSaleStaff}"`);
    return false;
  }
  
  const nameMatches = namesMatch(orderSaleStaff, reportName);
  if (!nameMatches) {
    if (debug) console.log(`[MATCH DEBUG] Name mismatch: report="${reportName}" (normalized: "${normalizeNameForMatch(reportName)}") vs order="${orderSaleStaff}" (normalized: "${normalizeNameForMatch(orderSaleStaff)}")`);
    return false;
  }

  // 2. Sale Name matching: additional filter by sale name field (if exists)
  // Check if sales_report has a sale_name field and match with order's sale_staff
  const reportSaleName = salesReport.sale_name || salesReport.sale || salesReport.ten_sale || salesReport.Tên_Sale || salesReport.tên_sale;
  if (reportSaleName) {
    const normalizedReportSaleName = normalizeNameForMatch(reportSaleName);
    const normalizedOrderSaleStaff = normalizeNameForMatch(orderSaleStaff);
    if (normalizedReportSaleName && normalizedOrderSaleStaff) {
      // Must match exactly or contain each other
      const saleNameMatches = normalizedReportSaleName === normalizedOrderSaleStaff || 
                             normalizedReportSaleName.includes(normalizedOrderSaleStaff) || 
                             normalizedOrderSaleStaff.includes(normalizedReportSaleName);
      if (!saleNameMatches) {
        if (debug) console.log(`[MATCH DEBUG] Sale name mismatch: report="${reportSaleName}" vs order="${orderSaleStaff}"`);
        return false;
      }
    }
  }

  // 3. Date matching: date (sales_reports) = order_date (orders)
  const reportDate = normalizeDate(salesReport.date || salesReport.ngay || salesReport.Ngày);
  const orderDate = normalizeDate(order.order_date || order.ngay || order.date);
  if (!reportDate || !orderDate || reportDate !== orderDate) {
    if (debug) console.log(`[MATCH DEBUG] Date mismatch: report="${reportDate}" vs order="${orderDate}"`);
    return false;
  }

  // 4. Shift matching - BỎ QUA (không kiểm tra shift)
  // Shift matching đã được bỏ qua theo yêu cầu

  // 5. Product matching (optional - skip if empty)
  const reportProduct = normalizeString(salesReport.product || salesReport.san_pham || salesReport.Sản_phẩm);
  if (reportProduct) {
    // Lấy từ cột product trong orders
    const orderProduct = normalizeString(order.product || order.san_pham);
    if (reportProduct !== orderProduct) {
      if (debug) console.log(`[MATCH DEBUG] Product mismatch: report="${reportProduct}" vs order="${orderProduct}"`);
      return false;
    }
  }

  // 6. Market matching (optional - skip if empty)
  const reportMarket = normalizeString(salesReport.market || salesReport.thi_truong || salesReport.Thị_trường);
  if (reportMarket) {
    const orderCountry = normalizeString(order.country || order.thi_truong || order.market);
    if (reportMarket !== orderCountry) {
      if (debug) console.log(`[MATCH DEBUG] Market mismatch: report="${reportMarket}" vs order="${orderCountry}"`);
      return false;
    }
  }

  if (debug) console.log(`[MATCH DEBUG] ✅ All conditions matched for order ${order.id}`);
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

  // Debug: Log sales report info (only if needed)
  const reportName = salesReport.name || salesReport.ten || salesReport.Tên || salesReport.nhanvien || salesReport.nhan_vien;
  const reportDate = normalizeDate(salesReport.date || salesReport.ngay || salesReport.Ngày);
  // Only log if no matches found (performance optimization)
  let checkedCount = 0;
  for (const order of orders) {
    checkedCount++;
    // Disable debug by default for performance
    const matches = orderMatchesSalesReport(order, salesReport, false);
    
    if (matches) {
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

  // Only log if no matches found (performance optimization)
  if (orderCount === 0 && checkedCount > 0) {
    console.log(`[DEBUG] No matches found for sales report: name="${reportName}", date="${reportDate}", checked ${checkedCount} orders`);
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

/**
 * Check if shift matches for detail_reports (special logic)
 * - "Hết ca" matches with both "Hết ca" and "Giữa ca"
 * - "Giữa ca" matches only with "Giữa ca"
 */
export function matchesShiftForDetailReport(detailReportShift: string, orderShift: string): boolean {
  const reportShift = normalizeString(detailReportShift);
  const orderShiftNorm = normalizeString(orderShift);

  if (!reportShift || !orderShiftNorm) {
    return false;
  }

  // Special logic: "Hết ca" matches with both "Hết ca" and "Giữa ca"
  if (reportShift === 'hết ca') {
    return orderShiftNorm.includes('hết ca') || orderShiftNorm.includes('giữa ca');
  }

  // Special logic: "Giữa ca" matches only with "Giữa ca"
  if (reportShift === 'giữa ca') {
    return orderShiftNorm.includes('giữa ca');
  }

  // For other shift values: exact match or contains
  return orderShiftNorm === reportShift || orderShiftNorm.includes(reportShift) || reportShift.includes(orderShiftNorm);
}

/**
 * Check if an order matches a detail_report record
 * Matching conditions:
 * 1. Tên (detail_reports) = marketing_staff (orders) [REQUIRED]
 * 2. Ngày (detail_reports) = order_date (orders) [REQUIRED]
 * 3. ca (detail_reports) = shift (orders) [REQUIRED - with special logic]
 * 4. Sản_phẩm (detail_reports) = product (orders) [OPTIONAL - skip if empty]
 * 5. Thị_trường (detail_reports) = country (orders) [OPTIONAL - skip if empty]
 */
export function orderMatchesDetailReport(
  order: any,
  detailReport: any,
  debug: boolean = false
): boolean {
  // 1. Name matching: Tên (detail_reports) = marketing_staff (orders)
  const reportName = detailReport.Tên || detailReport.ten || detailReport.name || detailReport.nhanvien || detailReport.nhan_vien;
  const orderMarketingStaff = order.marketing_staff || order.marketing || order.staff;

  if (!reportName || !orderMarketingStaff) {
    if (debug) console.log(`[MATCH DEBUG] Missing name: reportName="${reportName}", orderMarketingStaff="${orderMarketingStaff}"`);
    return false;
  }

  const nameMatches = namesMatch(orderMarketingStaff, reportName);
  if (!nameMatches) {
    if (debug) console.log(`[MATCH DEBUG] Name mismatch: report="${reportName}" vs order="${orderMarketingStaff}"`);
    return false;
  }

  // 2. Date matching: Ngày (detail_reports) = order_date (orders)
  const reportDate = normalizeDate(detailReport.Ngày || detailReport.ngay || detailReport.date);
  const orderDate = normalizeDate(order.order_date || order.ngay || order.date);
  if (!reportDate || !orderDate || reportDate !== orderDate) {
    if (debug) console.log(`[MATCH DEBUG] Date mismatch: report="${reportDate}" vs order="${orderDate}"`);
    return false;
  }

  // 3. Shift matching: ca (detail_reports) = shift (orders) with special logic
  const reportShift = detailReport.ca || detailReport.shift || detailReport.camkt;
  const orderShift = order.shift || order.ca;
  if (!reportShift || !orderShift) {
    if (debug) console.log(`[MATCH DEBUG] Missing shift: report="${reportShift}", order="${orderShift}"`);
    return false;
  }

  const shiftMatches = matchesShiftForDetailReport(reportShift, orderShift);
  if (!shiftMatches) {
    if (debug) console.log(`[MATCH DEBUG] Shift mismatch: report="${reportShift}" vs order="${orderShift}"`);
    return false;
  }

  // 4. Product matching (optional - skip if empty)
  const reportProduct = normalizeString(detailReport.Sản_phẩm || detailReport.san_pham || detailReport.product || detailReport.productmkt);
  if (reportProduct) {
    const orderProduct = normalizeString(order.product || order.san_pham);
    if (reportProduct !== orderProduct) {
      if (debug) console.log(`[MATCH DEBUG] Product mismatch: report="${reportProduct}" vs order="${orderProduct}"`);
      return false;
    }
  }

  // 5. Market matching (optional - skip if empty)
  const reportMarket = normalizeString(detailReport.Thị_trường || detailReport.thi_truong || detailReport.market || detailReport.marketmkt);
  if (reportMarket) {
    const orderCountry = normalizeString(order.country || order.thi_truong || order.market);
    if (reportMarket !== orderCountry) {
      if (debug) console.log(`[MATCH DEBUG] Market mismatch: report="${reportMarket}" vs order="${orderCountry}"`);
      return false;
    }
  }

  if (debug) console.log(`[MATCH DEBUG] ✅ All conditions matched for order ${order.id}`);
  return true;
}

/**
 * Calculate order statistics for a detail report
 * Returns: order_count, order_cancel_count_actual, revenue_actual, revenue_cancel_actual, order_success_count
 */
export function calculateDetailReportStatistics(
  orders: any[],
  detailReport: any
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

  const reportName = detailReport.Tên || detailReport.ten || detailReport.name || detailReport.nhanvien || detailReport.nhan_vien;
  const reportDate = normalizeDate(detailReport.Ngày || detailReport.ngay || detailReport.date);
  let checkedCount = 0;

  for (const order of orders) {
    checkedCount++;
    const matches = orderMatchesDetailReport(order, detailReport, false);
    
    if (matches) {
      orderCount++;
      
      const amount = getOrderRevenue(order);
      revenueActual += amount;

      const checkResult = normalizeString(order.check_result);
      if (checkResult === 'hủy') {
        orderCancelCount++;
        revenueCancelActual += amount;
      }
    }
  }

  if (orderCount === 0 && checkedCount > 0) {
    console.log(`[DEBUG] No matches found for detail report: name="${reportName}", date="${reportDate}", checked ${checkedCount} orders`);
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
 * Update detail report stats with graceful fallback when some columns do not exist.
 * Maps to Vietnamese column names: "Số đơn thực tế", "Doanh thu chốt thực tế", etc.
 */
export async function updateDetailReportStatistics(
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
  // Try multiple column name variations for detail_reports
  const payloads: Array<Record<string, number>> = [
    // Try Vietnamese column names first (from data sample)
    {
      "Số đơn thực tế": Number(stats.order_count) || 0,
      "Doanh thu chốt thực tế": Number.isFinite(stats.revenue_actual) ? Number(stats.revenue_actual) : 0,
      "Doanh số hoàn hủy thực tế": Number.isFinite(stats.revenue_cancel_actual) ? Number(stats.revenue_cancel_actual) : 0,
      "Số đơn hoàn hủy thực tế": Number(stats.order_cancel_count_actual) || 0,
    },
    // Try English column names
    {
      order_count: Number(stats.order_count) || 0,
      order_cancel_count_actual: Number(stats.order_cancel_count_actual) || 0,
      revenue_actual: Number.isFinite(stats.revenue_actual) ? Number(stats.revenue_actual) : 0,
      revenue_cancel_actual: Number.isFinite(stats.revenue_cancel_actual) ? Number(stats.revenue_cancel_actual) : 0,
      order_success_count: Number(stats.order_success_count) || 0,
    },
    // Try alternative names
    {
      order_count: Number(stats.order_count) || 0,
      order_cancel_count: Number(stats.order_cancel_count_actual) || 0,
      revenue_actual: Number.isFinite(stats.revenue_actual) ? Number(stats.revenue_actual) : 0,
      revenue_cancel_actual: Number.isFinite(stats.revenue_cancel_actual) ? Number(stats.revenue_cancel_actual) : 0,
    },
    // Fallback: only order_count
    {
      order_count: Number(stats.order_count) || 0,
      order_cancel_count_actual: Number(stats.order_cancel_count_actual) || 0,
    },
    // Last fallback: only revenue
    {
      revenue_actual: Number.isFinite(stats.revenue_actual) ? Number(stats.revenue_actual) : 0,
      revenue_cancel_actual: Number.isFinite(stats.revenue_cancel_actual) ? Number(stats.revenue_cancel_actual) : 0,
    },
    // Final fallback: only count
    {
      order_count: Number(stats.order_count) || 0,
    },
  ];

  let lastError = '';
  for (const payload of payloads) {
    const { error } = await supabase
      .from('detail_reports')
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

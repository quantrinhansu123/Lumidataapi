import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  fetchAllOrders,
  normalizeDate,
  namesMatch,
  normalizeString,
  matchesShiftForDetailReport,
} from './utils';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase configuration');
}

/**
 * Check if an order matches a detail report (for cancel count calculation)
 * Only checks: name, date, shift, product, market
 * Does NOT check check_result here - we'll filter by check_result separately
 */
function orderMatchesForCancelCount(
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

  // Use the same shift matching logic as detail reports
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
 * Calculate cancel count for a detail report
 * Counts orders that match AND have check_result = "Hủy"
 */
function calculateCancelCount(
  orders: any[],
  detailReport: any
): number {
  let cancelCount = 0;

  for (const order of orders) {
    // Check if order matches detail report
    const matches = orderMatchesForCancelCount(order, detailReport, false);
    
    if (matches) {
      // Check if order is cancelled
      const checkResult = normalizeString(order.check_result);
      if (checkResult === 'hủy') {
        cancelCount++;
      }
    }
  }

  return cancelCount;
}

/**
 * Update cancel count in detail report
 */
async function updateCancelCount(
  supabase: any,
  reportId: string,
  cancelCount: number
): Promise<{ ok: boolean; usedFields: string[]; error?: string }> {
  // Try multiple column name variations
  const payloads: Array<Record<string, number>> = [
    // Try Vietnamese column names first
    {
      "Số đơn hoàn hủy thực tế": Number(cancelCount) || 0,
    },
    // Try English column names
    {
      order_cancel_count_actual: Number(cancelCount) || 0,
    },
    // Try other variations
    {
      so_don_hoan_huy: Number(cancelCount) || 0,
    },
    {
      "so_don_hoan_huy_thuc_te": Number(cancelCount) || 0,
    },
  ];

  const usedFields: string[] = [];

  for (const payload of payloads) {
    const { data, error } = await supabase
      .from('detail_reports')
      .update(payload)
      .eq('id', reportId)
      .select();

    if (!error) {
      usedFields.push(...Object.keys(payload));
      return { ok: true, usedFields };
    }
  }

  return {
    ok: false,
    usedFields: [],
    error: 'Could not update any column. Tried: ' + payloads.map(p => Object.keys(p).join(', ')).join('; '),
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Validate configuration
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
        error: 'Configuration error',
      });
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get query parameters
    const { recordId, date, recalculateAll, name, ten, Tên } = req.query;
    
    // Support multiple name parameter variations
    const nameFilter = (name || ten || Tên) as string | undefined;

    // Determine which records to process
    let detailReportsQuery = supabase
      .from('detail_reports')
      .select('*');

    const limit = recalculateAll === 'true' ? 50000 : 10000;

    if (recordId) {
      // Calculate for a specific record
      detailReportsQuery = detailReportsQuery.eq('id', recordId as string).limit(1);
    } else if (date) {
      // Calculate for all records on a specific date
      const normalizedDate = normalizeDate(date as string);
      if (!normalizedDate) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Please use YYYY-MM-DD format.',
          error: 'Invalid date',
        });
      }
      // Don't filter by date at database level - filter in memory instead
      detailReportsQuery = detailReportsQuery.limit(limit);
    } else if (recalculateAll === 'true') {
      // Recalculate all records
      detailReportsQuery = detailReportsQuery.limit(50000);
    } else {
      // Default: calculate for ALL records
      detailReportsQuery = detailReportsQuery.limit(limit);
    }

    // Fetch detail reports
    const { data: detailReports, error: detailReportsError } = await detailReportsQuery;

    if (detailReportsError) {
      throw new Error(`Error fetching detail_reports: ${detailReportsError.message}`);
    }

    if (!detailReports || detailReports.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No records found to calculate',
        updated: 0,
        errors: 0,
        total: 0,
        data: [],
      });
    }

    // Filter by date if provided (filter in memory to avoid column name issues)
    let filteredDetailReports = detailReports;
    if (date) {
      const normalizedDate = normalizeDate(date as string);
      if (normalizedDate) {
        filteredDetailReports = detailReports.filter((dr: any) => {
          const drDate = normalizeDate(dr.Ngày || dr.ngay || dr.date || dr.Ngay);
          return drDate === normalizedDate;
        });

        if (filteredDetailReports.length === 0) {
          return res.status(200).json({
            success: true,
            message: `No records found for date: ${normalizedDate}`,
            updated: 0,
            errors: 0,
            total: 0,
            data: [],
          });
        }
      }
    }

    // Filter by name if provided (using fuzzy matching)
    if (nameFilter) {
      filteredDetailReports = filteredDetailReports.filter((dr: any) => {
        const reportName = dr.Tên || dr.ten || dr.name || dr.nhanvien || dr.nhan_vien;
        if (!reportName) {
          return false;
        }
        return namesMatch(reportName, nameFilter);
      });

      if (filteredDetailReports.length === 0) {
        return res.status(200).json({
          success: true,
          message: `No records found matching name: ${nameFilter}`,
          updated: 0,
          errors: 0,
          total: 0,
          data: [],
        });
      }
    }

    // Calculate date range from filtered detail reports for optimized fetching
    const dates = filteredDetailReports
      .map((dr: any) => normalizeDate(dr.Ngày || dr.ngay || dr.date))
      .filter((d: string | null): d is string => d !== null)
      .sort();

    const dateFilter = dates.length > 0
      ? { from: dates[0], to: dates[dates.length - 1] }
      : undefined;

    // Fetch orders (with date filter if available for better performance)
    console.log('Fetching orders...', dateFilter ? `Date range: ${dateFilter.from} to ${dateFilter.to}` : 'All dates');
    const allOrders = await fetchAllOrders(supabase, 10000, dateFilter);
    console.log(`Fetched ${allOrders.length} orders`);

    // Calculate cancel count for each filtered detail report
    const updatedRecords: any[] = [];
    let errors = 0;

    for (const detailReport of filteredDetailReports) {
      try {
        // Calculate cancel count (only orders with check_result = "Hủy")
        const cancelCount = calculateCancelCount(allOrders, detailReport);

        // Update cancel count
        const updateResult = await updateCancelCount(
          supabase,
          detailReport.id,
          cancelCount
        );

        if (!updateResult.ok) {
          console.error(`Error updating record ${detailReport.id}:`, updateResult.error);
          errors++;
        } else {
          updatedRecords.push({
            id: detailReport.id,
            Tên: detailReport.Tên || detailReport.ten || detailReport.name || '',
            Ngày: detailReport.Ngày || detailReport.ngay || detailReport.date || '',
            ca: detailReport.ca || detailReport.shift || detailReport.camkt || '',
            Sản_phẩm: detailReport.Sản_phẩm || detailReport.san_pham || detailReport.product || detailReport.productmkt || '',
            Thị_trường: detailReport.Thị_trường || detailReport.thi_truong || detailReport.market || detailReport.marketmkt || '',
            "Số đơn hoàn hủy thực tế": cancelCount,
            order_cancel_count_actual: cancelCount,
            updated_fields: updateResult.usedFields,
          });
        }
      } catch (error: any) {
        console.error(`Error processing record ${detailReport.id}:`, error);
        errors++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully calculated cancel count for ${updatedRecords.length} detail reports${nameFilter ? ` (filtered by name: ${nameFilter})` : ''}`,
      updated: updatedRecords.length,
      errors: errors,
      total: filteredDetailReports.length,
      data: updatedRecords,
    });
  } catch (error: any) {
    console.error('Error in calculate-cancel-count:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: error.toString(),
    });
  }
}

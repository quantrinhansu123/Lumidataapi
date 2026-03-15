import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
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
 * Fetch all cancelled orders (check_result = "Hủy") with pagination
 */
async function fetchAllCancelledOrders(
  supabase: any,
  batchSize: number = 10000
): Promise<any[]> {
  const allOrders: any[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from('orders')
      .select('id, marketing_staff, order_date, shift, product, country, check_result')
      .eq('check_result', 'Hủy') // Only get cancelled orders
      .range(offset, offset + batchSize - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching cancelled orders: ${error.message}`);
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
 * Find detail reports that match a cancelled order
 * Match by: marketing_staff (name), country (market), product, shift, date
 */
function findMatchingDetailReports(
  cancelledOrder: any,
  detailReports: any[]
): any[] {
  const orderMarketingStaff = cancelledOrder.marketing_staff || cancelledOrder.marketing || cancelledOrder.staff;
  const orderDate = normalizeDate(cancelledOrder.order_date || cancelledOrder.ngay || cancelledOrder.date);
  const orderShift = cancelledOrder.shift || cancelledOrder.ca;
  const orderProduct = normalizeString(cancelledOrder.product || cancelledOrder.san_pham);
  const orderCountry = normalizeString(cancelledOrder.country || cancelledOrder.thi_truong || cancelledOrder.market);

  if (!orderMarketingStaff || !orderDate || !orderShift) {
    return [];
  }

  const matchingReports: any[] = [];

  for (const detailReport of detailReports) {
    // 1. Name matching
    const reportName = detailReport.Tên || detailReport.ten || detailReport.name || detailReport.nhanvien || detailReport.nhan_vien;
    if (!reportName || !namesMatch(orderMarketingStaff, reportName)) {
      continue;
    }

    // 2. Date matching
    const reportDate = normalizeDate(detailReport.Ngày || detailReport.ngay || detailReport.date);
    if (!reportDate || reportDate !== orderDate) {
      continue;
    }

    // 3. Shift matching
    const reportShift = detailReport.ca || detailReport.shift || detailReport.camkt;
    if (!reportShift || !matchesShiftForDetailReport(reportShift, orderShift)) {
      continue;
    }

    // 4. Product matching (optional)
    const reportProduct = normalizeString(detailReport.Sản_phẩm || detailReport.san_pham || detailReport.product || detailReport.productmkt);
    if (reportProduct && reportProduct !== orderProduct) {
      continue;
    }

    // 5. Market matching (optional)
    const reportMarket = normalizeString(detailReport.Thị_trường || detailReport.thi_truong || detailReport.market || detailReport.marketmkt);
    if (reportMarket && reportMarket !== orderCountry) {
      continue;
    }

    // All conditions matched
    matchingReports.push(detailReport);
  }

  return matchingReports;
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
    const { date, from_date, to_date } = req.query;

    console.log('=== Starting Cancel Count Calculation from Orders ===');
    console.log('Fetching all cancelled orders...');

    // Fetch ALL cancelled orders (no limit)
    const cancelledOrders = await fetchAllCancelledOrders(supabase, 10000);
    console.log(`Found ${cancelledOrders.length} cancelled orders`);

    // Filter by date if provided
    let filteredCancelledOrders = cancelledOrders;
    if (date) {
      const normalizedDate = normalizeDate(date as string);
      if (normalizedDate) {
        filteredCancelledOrders = cancelledOrders.filter((order: any) => {
          const orderDate = normalizeDate(order.order_date || order.ngay || order.date);
          return orderDate === normalizedDate;
        });
        console.log(`Filtered to ${filteredCancelledOrders.length} cancelled orders for date: ${normalizedDate}`);
      }
    } else if (from_date || to_date) {
      const normalizedFromDate = from_date ? normalizeDate(from_date as string) : null;
      const normalizedToDate = to_date ? normalizeDate(to_date as string) : null;
      
      if (normalizedFromDate || normalizedToDate) {
        filteredCancelledOrders = cancelledOrders.filter((order: any) => {
          const orderDate = normalizeDate(order.order_date || order.ngay || order.date);
          if (!orderDate) return false;
          if (normalizedFromDate && orderDate < normalizedFromDate) return false;
          if (normalizedToDate && orderDate > normalizedToDate) return false;
          return true;
        });
        console.log(`Filtered to ${filteredCancelledOrders.length} cancelled orders for date range`);
      }
    }

    if (filteredCancelledOrders.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No cancelled orders found',
        updated: 0,
        errors: 0,
        total: 0,
        data: [],
      });
    }

    console.log('Fetching all detail reports...');
    // Fetch ALL detail reports (no limit)
    const { data: allDetailReports, error: detailReportsError } = await supabase
      .from('detail_reports')
      .select('*');

    if (detailReportsError) {
      throw new Error(`Error fetching detail_reports: ${detailReportsError.message}`);
    }

    if (!allDetailReports || allDetailReports.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No detail reports found',
        updated: 0,
        errors: 0,
        total: 0,
        data: [],
      });
    }

    console.log(`Found ${allDetailReports.length} detail reports`);

    // Count cancelled orders per detail report
    const cancelCountMap: Map<string, number> = new Map();

    console.log('Matching cancelled orders to detail reports...');
    let matchedCount = 0;
    let unmatchedCount = 0;

    for (const cancelledOrder of filteredCancelledOrders) {
      const matchingReports = findMatchingDetailReports(cancelledOrder, allDetailReports);
      
      if (matchingReports.length > 0) {
        matchedCount++;
        // Increment cancel count for each matching detail report
        for (const report of matchingReports) {
          const currentCount = cancelCountMap.get(report.id) || 0;
          cancelCountMap.set(report.id, currentCount + 1);
        }
      } else {
        unmatchedCount++;
      }
    }

    console.log(`Matched ${matchedCount} cancelled orders to detail reports`);
    console.log(`Unmatched ${unmatchedCount} cancelled orders`);

    // Update detail reports with cancel counts
    const updatedRecords: any[] = [];
    let errors = 0;

    console.log(`Updating ${cancelCountMap.size} detail reports...`);

    for (const [reportId, cancelCount] of cancelCountMap.entries()) {
      try {
        const updateResult = await updateCancelCount(
          supabase,
          reportId,
          cancelCount
        );

        if (!updateResult.ok) {
          console.error(`Error updating record ${reportId}:`, updateResult.error);
          errors++;
        } else {
          // Find the detail report to get its details
          const detailReport = allDetailReports.find((dr: any) => dr.id === reportId);
          if (detailReport) {
            updatedRecords.push({
              id: reportId,
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
        }
      } catch (error: any) {
        console.error(`Error processing record ${reportId}:`, error);
        errors++;
      }
    }

    console.log(`Successfully updated ${updatedRecords.length} detail reports`);

    return res.status(200).json({
      success: true,
      message: `Successfully calculated cancel count from ${filteredCancelledOrders.length} cancelled orders. Updated ${updatedRecords.length} detail reports.`,
      cancelled_orders_total: filteredCancelledOrders.length,
      matched_orders: matchedCount,
      unmatched_orders: unmatchedCount,
      updated: updatedRecords.length,
      errors: errors,
      total_detail_reports: cancelCountMap.size,
      data: updatedRecords,
    });
  } catch (error: any) {
    console.error('Error in calculate-cancel-from-orders:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: error.toString(),
    });
  }
}

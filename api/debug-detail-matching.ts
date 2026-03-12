import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  fetchAllOrders,
  normalizeDate,
  orderMatchesDetailReport,
  namesMatch,
  normalizeString,
  matchesShiftForDetailReport,
} from './utils';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Validate configuration
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Missing Supabase configuration',
        error: 'Configuration error',
      });
    }

    const { recordId } = req.query;

    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: 'Missing recordId parameter',
        error: 'Bad request',
      });
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the detail report
    const { data: detailReport, error: detailReportError } = await supabase
      .from('detail_reports')
      .select('*')
      .eq('id', recordId as string)
      .single();

    if (detailReportError || !detailReport) {
      return res.status(404).json({
        success: false,
        message: `Detail report not found: ${recordId}`,
        error: detailReportError?.message || 'Not found',
      });
    }

    // Get date from detail report for filtering orders
    const reportDate = normalizeDate(detailReport.Ngày || detailReport.ngay || detailReport.date);
    const dateFilter = reportDate ? { from: reportDate, to: reportDate } : undefined;

    // Fetch orders (with date filter for better performance)
    const allOrders = await fetchAllOrders(supabase, 10000, dateFilter);

    // Extract detail report fields
    const reportName = detailReport.Tên || detailReport.ten || detailReport.name || detailReport.nhanvien || detailReport.nhan_vien;
    const reportShift = detailReport.ca || detailReport.shift || detailReport.camkt;
    const reportProduct = detailReport.Sản_phẩm || detailReport.san_pham || detailReport.product || detailReport.productmkt;
    const reportMarket = detailReport.Thị_trường || detailReport.thi_truong || detailReport.market || detailReport.marketmkt;

    // Debug matching for each order with detailed breakdown
    const matches: any[] = [];
    const nonMatches: any[] = [];
    const debugDetails: any[] = [];

    for (const order of allOrders) {
      const orderMarketingStaff = order.marketing_staff || order.marketing || order.staff;
      const orderDate = normalizeDate(order.order_date || order.ngay || order.date);
      const orderShift = order.shift || order.ca;
      const orderProduct = order.product || order.san_pham;
      const orderCountry = order.country || order.thi_truong || order.market;

      // Check each condition separately
      const nameMatch = reportName && orderMarketingStaff ? namesMatch(orderMarketingStaff, reportName) : false;
      const dateMatch = reportDate && orderDate ? reportDate === orderDate : false;
      const shiftMatch = reportShift && orderShift ? matchesShiftForDetailReport(reportShift, orderShift) : false;
      const productMatch = reportProduct ? (normalizeString(reportProduct) === normalizeString(orderProduct)) : true;
      const marketMatch = reportMarket ? (normalizeString(reportMarket) === normalizeString(orderCountry)) : true;

      const allMatch = nameMatch && dateMatch && shiftMatch && productMatch && marketMatch;

      const orderInfo = {
        id: order.id,
        marketing_staff: orderMarketingStaff,
        order_date: orderDate,
        shift: orderShift,
        product: orderProduct,
        country: orderCountry,
        check_result: order.check_result,
        total_amount_vnd: order.total_amount_vnd || order.total_vnd,
        matching_checks: {
          name: { match: nameMatch, report: reportName, order: orderMarketingStaff },
          date: { match: dateMatch, report: reportDate, order: orderDate },
          shift: { match: shiftMatch, report: reportShift, order: orderShift },
          product: { match: productMatch, report: reportProduct || '(empty)', order: orderProduct, skipped: !reportProduct },
          market: { match: marketMatch, report: reportMarket || '(empty)', order: orderCountry, skipped: !reportMarket },
        },
        final_match: allMatch,
      };

      if (allMatch) {
        matches.push(orderInfo);
      } else {
        nonMatches.push(orderInfo);
      }

      // Keep first 50 debug details
      if (debugDetails.length < 50) {
        debugDetails.push(orderInfo);
      }
    }

    return res.status(200).json({
      success: true,
      detail_report: {
        id: detailReport.id,
        Tên: reportName,
        Ngày: reportDate,
        ca: reportShift,
        Sản_phẩm: reportProduct,
        Thị_trường: reportMarket,
      },
      matching_summary: {
        total_orders_checked: allOrders.length,
        matches: matches.length,
        non_matches: nonMatches.length,
      },
      matching_orders: matches,
      non_matching_orders: nonMatches.slice(0, 20), // Limit to first 20 for readability
      debug_details: debugDetails, // First 50 orders with detailed matching info
    });
  } catch (error: any) {
    console.error('Error in debug-detail-matching:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: error.toString(),
    });
  }
}

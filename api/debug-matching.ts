import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  orderMatchesSalesReport,
  normalizeString,
  normalizeDate,
} from './utils';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Missing Supabase configuration',
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { recordId } = req.query;

    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: 'Missing recordId parameter',
      });
    }

    // Get sales report
    const { data: salesReport, error: salesReportError } = await supabase
      .from('sales_reports')
      .select('*')
      .eq('id', recordId as string)
      .single();

    if (salesReportError || !salesReport) {
      return res.status(404).json({
        success: false,
        message: 'Sales report not found',
      });
    }

    // Normalize sales report values
    const reportName = normalizeString(salesReport.name || salesReport.ten || salesReport.Tên);
    const reportDate = normalizeDate(salesReport.date || salesReport.ngay || salesReport.Ngày);
    const reportShift = String(salesReport.shift || salesReport.ca || salesReport.casle || '').trim();
    const reportProduct = normalizeString(salesReport.product || salesReport.san_pham || salesReport.Sản_phẩm);
    const reportMarket = normalizeString(salesReport.market || salesReport.thi_truong || salesReport.Thị_trường);

    // Get potential matching orders
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, sale_staff, order_date, shift, product, country')
      .eq('order_date', reportDate || '')
      .limit(1000);

    if (ordersError) {
      throw new Error(`Error fetching orders: ${ordersError.message}`);
    }

    // Debug matching for each order
    const debugResults: any[] = [];
    let matchCount = 0;

    for (const order of allOrders || []) {
      const orderName = normalizeString(order.sale_staff);
      const orderDate = normalizeDate(order.order_date);
      const orderShift = String(order.shift || '').trim();
      const orderProduct = normalizeString(order.product);
      const orderCountry = normalizeString(order.country);

      const debug: any = {
        order_id: order.id,
        checks: {
          name: {
            report: reportName,
            order: orderName,
            match: reportName === orderName,
          },
          date: {
            report: reportDate,
            order: orderDate,
            match: reportDate === orderDate,
          },
          shift: {
            report: reportShift,
            order: orderShift,
            match: reportShift ? (orderShift.toLowerCase().includes(reportShift.toLowerCase())) : true,
          },
          product: {
            report: reportProduct || '(empty - skipped)',
            order: orderProduct,
            match: reportProduct ? (reportProduct === orderProduct) : true,
            skipped: !reportProduct,
          },
          market: {
            report: reportMarket || '(empty - skipped)',
            order: orderCountry,
            match: reportMarket ? (reportMarket === orderCountry) : true,
            skipped: !reportMarket,
          },
        },
      };

      const allMatch = 
        debug.checks.name.match &&
        debug.checks.date.match &&
        debug.checks.shift.match &&
        debug.checks.product.match &&
        debug.checks.market.match;

      debug.final_match = allMatch;

      if (allMatch) {
        matchCount++;
        debugResults.unshift(debug); // Put matches first
      } else {
        debugResults.push(debug);
      }
    }

    return res.status(200).json({
      success: true,
      sales_report: {
        id: salesReport.id,
        name: salesReport.name || salesReport.ten || salesReport.Tên,
        date: salesReport.date || salesReport.ngay || salesReport.Ngày,
        shift: reportShift,
        product: salesReport.product || salesReport.san_pham || salesReport.Sản_phẩm,
        market: salesReport.market || salesReport.thi_truong || salesReport.Thị_trường,
        normalized: {
          name: reportName,
          date: reportDate,
          shift: reportShift,
          product: reportProduct,
          market: reportMarket,
        },
      },
      total_orders_checked: allOrders?.length || 0,
      matching_orders: matchCount,
      debug_results: debugResults.slice(0, 50), // Limit to 50 for response size
    });
  } catch (error: any) {
    console.error('Error in debug-matching:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: error.toString(),
    });
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  orderMatchesSalesReport,
  normalizeString,
  normalizeDate,
  normalizeNameForMatch,
  namesMatch,
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

    // Normalize sales report values (same as in orderMatchesSalesReport)
    const reportName = salesReport.name || salesReport.ten || salesReport.Tên || salesReport.nhanvien || salesReport.nhan_vien;
    const reportDate = normalizeDate(salesReport.date || salesReport.ngay || salesReport.Ngày);
    const reportProduct = normalizeString(salesReport.product || salesReport.san_pham || salesReport.Sản_phẩm);
    const reportMarket = normalizeString(salesReport.market || salesReport.thi_truong || salesReport.Thị_trường);
    const reportSaleName = salesReport.sale_name || salesReport.sale || salesReport.ten_sale || salesReport.Tên_Sale || salesReport.tên_sale;

    // Get potential matching orders (with date filter if available)
    let ordersQuery = supabase
      .from('orders')
      .select('id, sale_staff, order_date, shift, product, country, check_result, total_amount_vnd, total_vnd');
    
    if (reportDate) {
      ordersQuery = ordersQuery.eq('order_date', reportDate);
    }
    
    const { data: allOrders, error: ordersError } = await ordersQuery.limit(1000);

    if (ordersError) {
      throw new Error(`Error fetching orders: ${ordersError.message}`);
    }

    // Debug matching for each order (using same logic as orderMatchesSalesReport)
    const debugResults: any[] = [];
    let matchCount = 0;

    for (const order of allOrders || []) {
      const orderSaleStaff = order.sale_staff || order.sale || order.staff;
      const orderDate = normalizeDate(order.order_date);
      const orderProduct = normalizeString(order.product || order.san_pham);
      const orderCountry = normalizeString(order.country || order.thi_truong || order.market);

      // Check each condition separately
      const nameMatch = reportName && orderSaleStaff ? namesMatch(orderSaleStaff, reportName) : false;
      
      // Sale name matching (if exists)
      let saleNameMatch = true;
      if (reportSaleName) {
        const normalizedReportSaleName = normalizeNameForMatch(reportSaleName);
        const normalizedOrderSaleStaff = normalizeNameForMatch(orderSaleStaff);
        if (normalizedReportSaleName && normalizedOrderSaleStaff) {
          saleNameMatch = normalizedReportSaleName === normalizedOrderSaleStaff || 
                         normalizedReportSaleName.includes(normalizedOrderSaleStaff) || 
                         normalizedOrderSaleStaff.includes(normalizedReportSaleName);
        }
      }
      
      const dateMatch = reportDate && orderDate ? reportDate === orderDate : false;
      const productMatch = reportProduct ? (reportProduct === orderProduct) : true;
      const marketMatch = reportMarket ? (reportMarket === orderCountry) : true;

      const debug: any = {
        order_id: order.id,
        order_sale_staff: orderSaleStaff,
        order_date: order.order_date,
        order_product: order.product,
        order_country: order.country,
        checks: {
          name: {
            report: reportName,
            order: orderSaleStaff,
            normalized_report: normalizeNameForMatch(reportName),
            normalized_order: normalizeNameForMatch(orderSaleStaff),
            match: nameMatch,
          },
          sale_name: {
            report: reportSaleName || '(empty - skipped)',
            match: saleNameMatch,
            skipped: !reportSaleName,
          },
          date: {
            report: reportDate,
            order: orderDate,
            match: dateMatch,
          },
          product: {
            report: reportProduct || '(empty - skipped)',
            order: orderProduct,
            match: productMatch,
            skipped: !reportProduct,
          },
          market: {
            report: reportMarket || '(empty - skipped)',
            order: orderCountry,
            match: marketMatch,
            skipped: !reportMarket,
          },
        },
      };

      const allMatch = nameMatch && saleNameMatch && dateMatch && productMatch && marketMatch;

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
        name: reportName,
        date: reportDate,
        product: salesReport.product || salesReport.san_pham || salesReport.Sản_phẩm,
        market: salesReport.market || salesReport.thi_truong || salesReport.Thị_trường,
        sale_name: reportSaleName || null,
        normalized: {
          name: normalizeNameForMatch(reportName),
          date: reportDate,
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

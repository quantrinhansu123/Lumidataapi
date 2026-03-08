import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  fetchAllOrders,
  calculateOrderStatistics,
  normalizeDate,
} from './utils';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Only POST is supported.',
    });
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

    // Parse webhook payload
    const { type, record } = req.body;

    if (!type || !record) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook payload. Expected { type, record }',
        error: 'Invalid payload',
      });
    }

    // Only process INSERT and UPDATE events
    if (type !== 'INSERT' && type !== 'UPDATE') {
      return res.status(200).json({
        success: true,
        message: `Event type ${type} ignored. Only INSERT and UPDATE are processed.`,
      });
    }

    // Get the sales report record
    const salesReport = record;

    // Calculate date range for optimized fetching
    const reportDate = normalizeDate(salesReport.date || salesReport.ngay || salesReport.Ngày);
    const dateFilter = reportDate ? { from: reportDate, to: reportDate } : undefined;

    // Fetch all orders (with pagination to avoid timeout)
    console.log('Fetching orders for webhook...');
    const allOrders = await fetchAllOrders(supabase, 10000, dateFilter);
    console.log(`Fetched ${allOrders.length} orders`);

    // Calculate all statistics
    const stats = calculateOrderStatistics(allOrders, salesReport);

    // Update the sales report with all calculated values
    const { error: updateError } = await supabase
      .from('sales_reports')
      .update({
        order_count: stats.order_count,
        order_cancel_count_actual: stats.order_cancel_count_actual,
        revenue_actual: stats.revenue_actual,
        revenue_cancel_actual: stats.revenue_cancel_actual,
        order_success_count: stats.order_success_count,
      })
      .eq('id', salesReport.id);

    if (updateError) {
      throw new Error(`Error updating sales_report: ${updateError.message}`);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully calculated statistics for record ${salesReport.id}`,
      recordId: salesReport.id,
      name: salesReport.name || salesReport.ten || salesReport.Tên,
      date: salesReport.date || salesReport.ngay || salesReport.Ngày,
      shift: salesReport.shift || salesReport.ca || salesReport.casle || '',
      product: salesReport.product || salesReport.san_pham || salesReport.Sản_phẩm || '',
      market: salesReport.market || salesReport.thi_truong || salesReport.Thị_trường || '',
      order_count: stats.order_count,
      order_cancel_count_actual: stats.order_cancel_count_actual,
      revenue_actual: stats.revenue_actual,
      revenue_cancel_actual: stats.revenue_cancel_actual,
      order_success_count: stats.order_success_count,
    });
  } catch (error: any) {
    console.error('Error in webhook-sales-reports:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: error.toString(),
    });
  }
}

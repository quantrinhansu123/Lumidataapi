import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  orderMatchesSalesReport,
  fetchAllOrders,
  normalizeDate,
} from './utils';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase configuration');
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
    const { recordId, date, recalculateAll } = req.query;

    // Determine which records to process
    let salesReportsQuery = supabase
      .from('sales_reports')
      .select('*');

    const limit = recalculateAll === 'true' ? 10000 : 1000;

    if (recordId) {
      // Calculate for a specific record
      salesReportsQuery = salesReportsQuery.eq('id', recordId as string).limit(1);
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
      salesReportsQuery = salesReportsQuery.eq('date', normalizedDate).limit(limit);
    } else if (recalculateAll === 'true') {
      // Recalculate all records
      salesReportsQuery = salesReportsQuery.limit(limit);
    } else {
      // Default: calculate for records without order_count or with order_count = 0/null
      salesReportsQuery = salesReportsQuery
        .or('order_count.is.null,order_count.eq.0')
        .limit(limit);
    }

    // Fetch sales reports
    const { data: salesReports, error: salesReportsError } = await salesReportsQuery;

    if (salesReportsError) {
      throw new Error(`Error fetching sales_reports: ${salesReportsError.message}`);
    }

    if (!salesReports || salesReports.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No records found to calculate',
        updated: 0,
        errors: 0,
        total: 0,
        data: [],
      });
    }

    // Calculate date range from sales reports for optimized fetching
    const dates = salesReports
      .map((sr: any) => normalizeDate(sr.date || sr.ngay || sr.Ngày))
      .filter((d: string | null): d is string => d !== null)
      .sort();

    const dateFilter = dates.length > 0
      ? { from: dates[0], to: dates[dates.length - 1] }
      : undefined;

    // Fetch orders (with date filter if available for better performance)
    console.log('Fetching orders...', dateFilter ? `Date range: ${dateFilter.from} to ${dateFilter.to}` : 'All dates');
    const allOrders = await fetchAllOrders(supabase, 10000, dateFilter);
    console.log(`Fetched ${allOrders.length} orders`);

    // Calculate order_count for each sales report
    const updatedRecords: any[] = [];
    let errors = 0;

    for (const salesReport of salesReports) {
      try {
        // Count matching orders
        let orderCount = 0;
        for (const order of allOrders) {
          if (orderMatchesSalesReport(order, salesReport)) {
            orderCount++;
          }
        }

        // Update the sales report with the calculated order_count
        const { error: updateError } = await supabase
          .from('sales_reports')
          .update({ order_count: orderCount })
          .eq('id', salesReport.id);

        if (updateError) {
          console.error(`Error updating record ${salesReport.id}:`, updateError);
          errors++;
        } else {
          updatedRecords.push({
            id: salesReport.id,
            name: salesReport.name || salesReport.ten || salesReport.Tên,
            date: salesReport.date || salesReport.ngay || salesReport.Ngày,
            shift: salesReport.shift || salesReport.ca || salesReport.casle || '',
            product: salesReport.product || salesReport.san_pham || salesReport.Sản_phẩm || '',
            market: salesReport.market || salesReport.thi_truong || salesReport.Thị_trường || '',
            order_count: orderCount,
          });
        }
      } catch (error: any) {
        console.error(`Error processing record ${salesReport.id}:`, error);
        errors++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully calculated order_count for ${updatedRecords.length} records`,
      updated: updatedRecords.length,
      errors: errors,
      total: salesReports.length,
      data: updatedRecords,
    });
  } catch (error: any) {
    console.error('Error in calculate-order-count:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: error.toString(),
    });
  }
}

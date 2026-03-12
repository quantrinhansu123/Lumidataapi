import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  fetchAllOrders,
  normalizeDate,
  calculateDetailReportStatistics,
  updateDetailReportStatistics,
  namesMatch,
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
    const { recordId, date, recalculateAll, name, ten, Tên } = req.query;
    
    // Support multiple name parameter variations
    const nameFilter = (name || ten || Tên) as string | undefined;

    // Determine which records to process
    let detailReportsQuery = supabase
      .from('detail_reports')
      .select('*');

    // Increase limit to handle all nhân sự
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
      // This avoids column name issues
      detailReportsQuery = detailReportsQuery.limit(limit);
    } else if (recalculateAll === 'true') {
      // Recalculate all records (no limit or very high limit)
      detailReportsQuery = detailReportsQuery.limit(50000);
    } else {
      // Default: calculate for ALL records (not just those without order_count)
      // This ensures all nhân sự are calculated
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

    // Calculate order_count for each filtered detail report
    const updatedRecords: any[] = [];
    let errors = 0;

    for (const detailReport of filteredDetailReports) {
      try {
        // Calculate all statistics
        const stats = calculateDetailReportStatistics(allOrders, detailReport);

        // Update with fallback payloads so missing columns do not break the entire job.
        const updateResult = await updateDetailReportStatistics(
          supabase,
          detailReport.id,
          stats
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
            "Số đơn thực tế": stats.order_count,
            "Doanh thu chốt thực tế": stats.revenue_actual,
            "Doanh số hoàn hủy thực tế": stats.revenue_cancel_actual,
            "Số đơn hoàn hủy thực tế": stats.order_cancel_count_actual,
            // Keep English names for backward compatibility
            order_count: stats.order_count,
            order_cancel_count_actual: stats.order_cancel_count_actual,
            revenue_actual: stats.revenue_actual,
            revenue_cancel_actual: stats.revenue_cancel_actual,
            order_success_count: stats.order_success_count,
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
      message: `Successfully calculated order_count for ${updatedRecords.length} detail reports${nameFilter ? ` (filtered by name: ${nameFilter})` : ''}`,
      updated: updatedRecords.length,
      errors: errors,
      total: filteredDetailReports.length,
      data: updatedRecords,
    });
  } catch (error: any) {
    console.error('Error in calculate-detail-report-count:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: error.toString(),
    });
  }
}

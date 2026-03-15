import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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

    // Get query parameters for filtering
    const { 
      team, 
      position, 
      branch, 
      email, 
      name,
      limit,
      offset 
    } = req.query;

    // Build query
    let query = supabase
      .from('users')
      .select('*');

    // Apply filters
    if (team) {
      // Support multiple team values separated by comma
      const teams = String(team).split(',').map(t => t.trim()).filter(t => t);
      if (teams.length === 1) {
        query = query.eq('team', teams[0]);
      } else {
        query = query.in('team', teams);
      }
    }

    // Note: position and branch filters will be applied in memory after fetching
    // because column names may vary (Vị trí, position, vi_tri, chuc_vu, etc.)
    // This ensures compatibility with different database schemas

    if (email) {
      query = query.eq('email', email);
    }

    if (name) {
      // Fuzzy search for name - try common column names
      const nameStr = String(name).trim();
      query = query.or(`name.ilike.%${nameStr}%,full_name.ilike.%${nameStr}%,ho_ten.ilike.%${nameStr}%`);
    }

    // Apply pagination
    const limitNum = limit ? parseInt(String(limit), 10) : 10000;
    const offsetNum = offset ? parseInt(String(offset), 10) : 0;
    
    if (limitNum > 0) {
      query = query.range(offsetNum, offsetNum + limitNum - 1);
    }

    // Execute query
    const { data: users, error } = await query;

    if (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }

    if (!users || users.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users found',
        total: 0,
        employeeData: [],
      });
    }

    // Filter in memory for position and branch if needed (when column names don't match)
    let filteredUsers = users;
    
    if (position && users.length > 0) {
      const positions = String(position).split(',').map(p => p.trim()).filter(p => p);
      filteredUsers = filteredUsers.filter((user: any) => {
        const userPosition = user['Vị trí'] || user.position || user.vi_tri || user.chuc_vu || '';
        return positions.some(p => 
          userPosition.toLowerCase().includes(p.toLowerCase()) || 
          p.toLowerCase().includes(userPosition.toLowerCase())
        );
      });
    }

    if (branch && filteredUsers.length > 0) {
      const branches = String(branch).split(',').map(b => b.trim()).filter(b => b);
      filteredUsers = filteredUsers.filter((user: any) => {
        const userBranch = user['chi nhánh'] || user.chi_nhanh || user.branch || '';
        return branches.some(b => 
          userBranch.toLowerCase().includes(b.toLowerCase()) || 
          b.toLowerCase().includes(userBranch.toLowerCase())
        );
      });
    }

    // Map database columns to Vietnamese response format
    const employeeData = filteredUsers.map((user: any) => {
      // Try multiple column name variations
      const fullName = user['Họ Và Tên'] || user.full_name || user.name || user.ho_ten || user.ten || user.ho_va_ten || '';
      const email = user.email || user.Email || '';
      const team = user.team || user.Team || '';
      const position = user['Vị trí'] || user.position || user.vi_tri || user.chuc_vu || '';
      const branch = user['chi nhánh'] || user.chi_nhanh || user.branch || '';
      const linkAnh = user.avatar_url || user.link_anh || '';
      const ca = user.ca || user.Ca || user.shift || user.shift_ca || '';

      return {
        id: user.id || '',
        'Họ Và Tên': fullName,
        Email: email,
        Team: team,
        'Vị trí': position,
        'chi nhánh': branch,
        link_anh: linkAnh,
        ca: ca,
      };
    });

    return res.status(200).json({
      success: true,
      message: `Successfully fetched ${employeeData.length} employees`,
      total: employeeData.length,
      employeeData: employeeData,
    });
  } catch (error: any) {
    console.error('Error in employees API:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: error.toString(),
      employeeData: [],
    });
  }
}

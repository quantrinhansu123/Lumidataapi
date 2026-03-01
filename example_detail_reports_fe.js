    /**
 * API Wrapper cho Detail Reports
 * 
 * LOGIC FILTER (AND):
 * - Tất cả các filter được combine bằng logic AND để thu hẹp data
 * - Có thể truyền multiple values cho cùng 1 biến (sẽ thành OR trong biến đó)
 * - Ví dụ: { team: ["Team A", "Team B"], san_pham: "SP1", thi_truong: "VN" }
 *   → Chỉ lấy: (Team A OR Team B) AND SP1 AND VN
 * - Nếu filter team thì chỉ hiển thị nhân sự của các team đó
 * - Nếu filter thi_truong thì chỉ hiển thị nhân sự của các thị trường đó
 * - Nếu filter san_pham thì chỉ hiển thị data của sản phẩm đó
 * 
 * STATISTICS RESPONSE:
 * - Các filter chỉ để THU HẸP PHẠM VI tính toán
 * - Response vẫn trả về ĐẦY ĐỦ các breakdown: by_ten, by_ca, by_team, by_san_pham, by_thi_truong
 * 
 * Ví dụ:
 * Filter: { team: ["Team A"], san_pham: "SP1", from_date: "01/02", to_date: "10/02" }
 * → API lọc: Chỉ Team A AND SP1 AND trong khoảng 01/02-10/02
 * → Response: by_ten chỉ hiển thị nhân sự Team A, cùng đầy đủ breakdowns
 * 
 * Filter: { team: ["Team A", "Team B"], thi_truong: ["VN", "TQ"], from_date: "01/02", to_date: "10/02" }
 * → API lọc: (Team A OR Team B) AND (VN OR TQ) AND trong khoảng 01/02-10/02
 * → Response: by_ten chỉ hiển thị nhân sự của Team A + B tại thị trường VN + TQ
 * 
 * Lọc theo ngày:
 * - Lọc 1 ngày: `ngay` (ví dụ: ngay: "01/02/2026")
 * - Lọc từ ngày đến ngày: `from_date` và `to_date`
 * 
 * Ví dụ GET:
 * getDetailReports({ team: ["Team A"], from_date: "01/02/2026", to_date: "10/02/2026" })
 * → URL: /detail_reports?team=Team%20A&from_date=01/02/2026&to_date=10/02/2026
 * 
 * Ví dụ GET - Multiple values:
 * getDetailReports({ team: ["Team A", "Team B"], thi_truong: ["VN", "TQ"], san_pham: "SP1" })
 * → URL: /detail_reports?team=Team%20A&team=Team%20B&thi_truong=VN&thi_truong=TQ&san_pham=SP1
 * 
 * Ví dụ POST Statistics:
 * getDetailReportsStatisticsByBody({ 
 *   filters: { team: ["Team A"], san_pham: "SP1", thi_truong: "VN" },
 *   date_range: { from: "01/02/2026", to: "10/02/2026" } 
 * })
 * → Tính stats cho Team A AND SP1 AND VN
 * → Vẫn trả về by_ten (nhân sự Team A tại VN), by_ca, by_team, by_san_pham, by_thi_truong
 */

const API_BASE_URL = "https://lumidataapi.vercel.app";

    function buildQuery(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        if (Array.isArray(value)) {
        value
            .map((item) => (item ?? "").toString().trim())
            .filter(Boolean)
            .forEach((item) => searchParams.append(key, item));
        return;
        }

        const text = value.toString().trim();
        if (!text) return;
        searchParams.append(key, text);
    });

    return searchParams.toString();
    }

    async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        },
        ...options,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error || `Request failed: ${response.status}`);
    }

    return data;
    }

    export async function getDetailReports(params = {}) {
    const query = buildQuery(params);
    const url = `${API_BASE_URL}/detail_reports${query ? `?${query}` : ""}`;
    return requestJson(url);
    }

    export async function getDetailReportsStatisticsByQuery(params = {}) {
    const query = buildQuery(params);
    const url = `${API_BASE_URL}/detail_reports/statistics${query ? `?${query}` : ""}`;
    return requestJson(url);
    }

    export async function getDetailReportsStatisticsByBody(payload = {}) {
    const url = `${API_BASE_URL}/detail_reports/statistics`;
    return requestJson(url, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    }

    /**
     * Helper: Lấy query params từ URL hiện tại (dùng cho React Router, Vue Router, etc.)
     * @param {URLSearchParams|string} searchParams - URL search params hoặc search string
     * @returns {Object} Object chứa các filter params
     * 
     * Ví dụ:
     * URL: /detail-reports?team=Team%20A&san_pham=SP1&from_date=01/02/2026
     * → getFiltersFromURL(window.location.search)
     * → { team: "Team A", san_pham: "SP1", from_date: "01/02/2026" }
     */
    export function getFiltersFromURL(searchParams) {
    const params = typeof searchParams === 'string' 
        ? new URLSearchParams(searchParams)
        : searchParams;

    const filters = {};
    for (const [key, value] of params.entries()) {
        const trimmed = value.trim();
        if (!trimmed) continue;

        // Nếu có nhiều giá trị cho cùng 1 key → array
        if (filters[key]) {
        if (Array.isArray(filters[key])) {
            filters[key].push(trimmed);
        } else {
            filters[key] = [filters[key], trimmed];
        }
        } else {
        filters[key] = trimmed;
        }
    }
    return filters;
    }

    // ====================
    // Example FE usage
    // ====================
    async function demo() {
    try {
        // 1) Lọc theo Team (chỉ hiển thị nhân sự Team A)
        const teamAData = await getDetailReports({
        team: "Team A",
        limit: 20,
        });
        console.log("Chỉ Team A:", teamAData.data);

        // 2) Lọc theo Thị trường (chỉ hiển thị nhân sự tại thị trường VN)
        const marketVNData = await getDetailReports({
        thi_truong: "VN",
        limit: 20,
        });
        console.log("Chỉ thị trường VN:", marketVNData.data);

        // 3) Lọc kết hợp: (Team A OR Team B) AND (VN OR TQ) AND SP1 (logic AND)
        const multiFilter = await getDetailReports({
        team: ["Team A", "Team B"],  // Multiple teams
        thi_truong: ["VN", "TQ"],   // Multiple markets
        san_pham: "SP1",
        limit: 50,
        });
        console.log("(Team A OR Team B) AND (VN OR TQ) AND SP1:", multiFilter.data);

        // 4) Lọc theo Team + Thi_truong + Ca + Từ ngày đến ngày
        const complexFilter = await getDetailReports({
        team: ["MKT-Độc Anh"],
        thi_truong: "VN",
        ca: "Sáng",
        from_date: "01/02/2026",
        to_date: "10/02/2026",
        limit: 50,
        });
        console.log("Team MKT-Độc Anh AND VN AND Sáng AND từ 01/02-10/02:", complexFilter.data);

        // 5) Thống kê theo Team + Thi_truong (GET)
        const statsTeamMarket = await getDetailReportsStatisticsByQuery({
        team: "MKT-Độc Anh",
        thi_truong: "VN",
        from_date: "01/02/2026",
        to_date: "10/02/2026",
        });
        console.log("Stats cho MKT-Độc Anh tại VN (từ 01/02-10/02):");
        console.log("  - Tổng records:", statsTeamMarket.statistics.total_records);
        console.log("  - by_ten (nhân sự Team MKT-Độc Anh tại VN):", statsTeamMarket.statistics.by_ten);
        console.log("  - by_ca (ca làm việc):", statsTeamMarket.statistics.by_ca);
        console.log("  - by_thi_truong (chủ yếu VN):", statsTeamMarket.statistics.by_thi_truong);
        console.log("  - by_san_pham (sản phẩm):", statsTeamMarket.statistics.by_san_pham);

        // 6) Thống kê với multiple teams, multiple markets (POST)
        const statsMultiFilter = await getDetailReportsStatisticsByBody({
        filters: {
            team: ["Team A", "Team B"],     // OR: Team A OR Team B
            thi_truong: ["VN", "TQ"],      // OR: VN OR TQ
            san_pham: "SP1",                // AND tất cả filter
            ca: "Sáng",
        },
        date_range: {
            from: "01/02/2026",
            to: "10/02/2026",
        },
        date_column: "ngay",
        });
        console.log("Stats (Team A OR Team B) AND (VN OR TQ) AND SP1 AND Sáng:");
        console.log("  - Total records:", statsMultiFilter.statistics.total_records);
        console.log("  - by_ten (nhân sự của các team tại các thị trường):", statsMultiFilter.statistics.by_ten);
        console.log("  - by_team (Team A + B):", statsMultiFilter.statistics.by_team);
        console.log("  - by_thi_truong (VN + TQ):", statsMultiFilter.statistics.by_thi_truong);
        console.log("  - by_san_pham (chủ yếu SP1):", statsMultiFilter.statistics.by_san_pham);
        console.log("  - by_ca (chủ yếu Sáng):", statsMultiFilter.statistics.by_ca);

        // 7) Lọc chỉ theo Sản phẩm (tất cả team)
        const productOnly = await getDetailReports({
        san_pham: "SP1",
        limit: 100,
        });
        console.log("Chỉ sản phẩm SP1 (all teams & markets):", productOnly.data);

        // 8) Lấy tất cả dữ liệu (không filter)
        const allData = await getDetailReports({
        limit: 100,
        });
        console.log("Tất cả dữ liệu:", allData.data);

        // ===================================================
        // LINK EXAMPLES (URL-encoded):
        // ===================================================
        // GET - Single team:
        // https://lumidataapi.vercel.app/detail_reports?team=MKT-%C4%90%E1%BB%A9c%20Anh&from_date=01/02/2026&to_date=10/02/2026
        //
        // GET - Multiple teams (mỗi team là 1 param):
        // https://lumidataapi.vercel.app/detail_reports?team=Team%20A&team=Team%20B&from_date=01/02/2026&to_date=10/02/2026
        //
        // GET - Multiple teams + multiple markets:
        // https://lumidataapi.vercel.app/detail_reports?team=Team%20A&team=Team%20B&thi_truong=VN&thi_truong=TQ&from_date=01/02/2026&to_date=10/02/2026
        //
        // GET - Team + Market + Product:
        // https://lumidataapi.vercel.app/detail_reports?team=MKT-%C4%90%E1%BB%A9c%20Anh&thi_truong=VN&san_pham=SP1&from_date=01/02/2026&to_date=10/02/2026
        //
        // Statistics GET:
        // https://lumidataapi.vercel.app/detail_reports/statistics?team=MKT-%C4%90%E1%BB%A9c%20Anh&thi_truong=VN&from_date=01/02/2026&to_date=10/02/2026
        //
        // Statistics GET - Multiple teams:
        // https://lumidataapi.vercel.app/detail_reports/statistics?team=Team%20A&team=Team%20B&thi_truong=VN&thi_truong=TQ&from_date=01/02/2026&to_date=10/02/2026
        //
        // LƯU Ý: 
        // - Khi truyền multiple values cho cùng biến → repeat param name (team=A&team=B)
        // - Nếu filter team → by_ten chỉ hiển thị nhân sự của các team đó
        // - Nếu filter thi_truong → by_ten chỉ hiển thị nhân sự tại các thị trường đó
        // - Filters combine bằng AND (các biến khác nhau) hoặc OR (cùng biến)
    } catch (error) {
        console.error("API error:", error.message);
    }
    }

    // Bỏ comment nếu muốn chạy demo trực tiếp
    // demo();

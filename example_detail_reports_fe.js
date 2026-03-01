    /**
 * API Wrapper cho Detail Reports
 * 
 * LOGIC FILTER (AND):
 * - Tất cả các filter được combine bằng logic AND để thu hẹp data
 * - Ví dụ: { team: "Team A", san_pham: "SP1", thi_truong: "VN" }
 *   → Chỉ lấy records thỏa mãn CẢ 3 điều kiện (Team A AND SP1 AND VN)
 * 
 * STATISTICS RESPONSE:
 * - Các filter chỉ để THU HẸP PHẠM VI tính toán
 * - Response vẫn trả về ĐẦY ĐỦ các breakdown: by_ten, by_ca, by_team, by_san_pham, by_thi_truong
 * 
 * Ví dụ:
 * Filter: { team: "Team A", san_pham: "SP1", from_date: "01/02", to_date: "10/02" }
 * → API lọc: Chỉ lấy records của Team A AND SP1 AND trong khoảng 01/02-10/02
 * → Response statistics:
 *   - by_ten: Các nhân sự (của Team A đã lọc)
 *   - by_ca: Các ca làm việc
 *   - by_team: Sẽ chủ yếu là Team A (vì đã filter team)
 *   - by_san_pham: Sẽ chủ yếu là SP1 (vì đã filter)
 *   - by_thi_truong: Breakdown theo thị trường (trong phạm vi đã lọc)
 * 
 * Lọc theo ngày:
 * - Lọc 1 ngày: `ngay` (ví dụ: ngay: "01/02/2026")
 * - Lọc từ ngày đến ngày: `from_date` và `to_date`
 * 
 * Ví dụ GET:
 * getDetailReports({ team: "Team A", from_date: "01/02/2026", to_date: "10/02/2026" })
 * → Chỉ lấy data Team A từ 01/02 đến 10/02
 * 
 * Ví dụ POST Statistics:
 * getDetailReportsStatisticsByBody({ 
 *   filters: { team: ["Team A"], san_pham: "SP1" },
 *   date_range: { from: "01/02/2026", to: "10/02/2026" } 
 * })
 * → Tính stats cho Team A + SP1 + khoảng ngày
 * → Vẫn trả về by_ten, by_ca, by_team, by_san_pham, by_thi_truong
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

        // 2) Lọc kết hợp: Team A AND Sản phẩm SP1 AND Thị trường VN (logic AND)
        const multiFilter = await getDetailReports({
        team: "Team A",
        san_pham: "SP1",
        thi_truong: "VN",
        limit: 20,
        });
        console.log("Team A AND SP1 AND VN:", multiFilter.data);

        // 3) Lọc theo Team + Ca + Từ ngày đến ngày (logic AND)
        const teamCaDateRange = await getDetailReports({
        team: "Team A",
        ca: "Sáng",
        from_date: "01/02/2026",
        to_date: "10/02/2026",
        limit: 50,
        });
        console.log("Team A AND Ca Sáng AND từ 01/02 đến 10/02:", teamCaDateRange.data);

        // 4) Thống kê theo Team + Sản phẩm (GET)
        // Filter để thu hẹp data, nhưng vẫn nhận đầy đủ breakdown
        const statsTeamProduct = await getDetailReportsStatisticsByQuery({
        team: "Team A",
        san_pham: "SP1",
        from_date: "01/02/2026",
        to_date: "10/02/2026",
        });
        console.log("Stats cho Team A AND SP1 (từ 01/02-10/02):");
        console.log("  - Tổng records:", statsTeamProduct.statistics.total_records);
        console.log("  - by_ten (các nhân sự của Team A):", statsTeamProduct.statistics.by_ten);
        console.log("  - by_ca (ca làm việc):", statsTeamProduct.statistics.by_ca);
        console.log("  - by_team (chủ yếu Team A):", statsTeamProduct.statistics.by_team);
        console.log("  - by_san_pham (chủ yếu SP1):", statsTeamProduct.statistics.by_san_pham);
        console.log("  - by_thi_truong (thị trường):", statsTeamProduct.statistics.by_thi_truong);

        // 5) Thống kê với multiple filters (POST)
        // Filters chỉ để thu hẹp → vẫn nhận đầy đủ by_ten, by_ca, by_team, etc.
        const statsMultiFilter = await getDetailReportsStatisticsByBody({
        filters: {
            team: ["Team A", "Team B"], // OR trong team
            san_pham: "SP1",           // AND với sản phẩm
            thi_truong: "VN",          // AND với thị trường
            ca: "Sáng",                 // AND với ca
        },
        date_range: {
            from: "01/02/2026",
            to: "10/02/2026",
        },
        date_column: "ngay",
        });
        console.log("Stats (Team A OR Team B) AND SP1 AND VN AND Ca Sáng:");
        console.log("  - Total records:", statsMultiFilter.statistics.total_records);
        console.log("  - Total mess/cmt:", statsMultiFilter.statistics.total_mess_cmt);
        console.log("  - Total CPQC:", statsMultiFilter.statistics.total_cpqc);
        console.log("  - by_ten (nhân sự trong phạm vi filter):", statsMultiFilter.statistics.by_ten);
        console.log("  - by_ca (chủ yếu Ca Sáng):", statsMultiFilter.statistics.by_ca);
        console.log("  - by_team (Team A + B):", statsMultiFilter.statistics.by_team);
        console.log("  - by_san_pham (chủ yếu SP1):", statsMultiFilter.statistics.by_san_pham);
        console.log("  - by_thi_truong (chủ yếu VN):", statsMultiFilter.statistics.by_thi_truong);

        // 6) Lọc chỉ theo Sản phẩm (tất cả team)
        const productOnly = await getDetailReports({
        san_pham: "SP1",
        limit: 100,
        });
        console.log("Chỉ sản phẩm SP1 (all teams):", productOnly.data);

        // 7) Lấy tất cả dữ liệu (không filter)
        const allData = await getDetailReports({
        limit: 100,
        });
        console.log("Tất cả dữ liệu:", allData.data);

        // ===================================================
        // LƯU Ý QUAN TRỌNG VỀ STATISTICS:
        // ===================================================
        // - Filters (team, san_pham, thi_truong, ngày) → Thu hẹp phạm vi data
        // - Response statistics → Vẫn trả về ĐẦY ĐỦ các breakdown:
        //   + by_ten: Danh sách nhân sự (trong phạm vi đã filter)
        //   + by_ca: Breakdown theo ca (Sáng/Chiều/Tối)
        //   + by_team: Breakdown theo team
        //   + by_san_pham: Breakdown theo sản phẩm
        //   + by_thi_truong: Breakdown theo thị trường
        // 
        // Ví dụ:
        // Filter: { team: "Team A", san_pham: "SP1" }
        // → Lọc data: Chỉ Team A + SP1
        // → Response: Vẫn có by_ten (nhân sự Team A), by_ca, by_team (chủ yếu A), etc.
        //
        // Filter chỉ để "zoom in" vào 1 phần data
        // Statistics vẫn cho breakdown đầy đủ của phần data đó
    } catch (error) {
        console.error("API error:", error.message);
    }
    }

    // Bỏ comment nếu muốn chạy demo trực tiếp
    // demo();

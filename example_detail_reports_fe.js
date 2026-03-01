    /**
 * API Wrapper cho Detail Reports
 * 
 * RESPONSE STRUCTURE - STATISTICS:
 * {
 *   "total_records": số lượng record
 *   "total_cpqc": tổng CPQC
 *   "total_mess_cmt": tổng số message/comment
 *   "average_mess_cmt": trung bình message/comment
 *   "by_ten": {
 *     "count": { "Tên nhân viên": số lần, ... },
 *     "total_mess_cmt": { "Tên nhân viên": tổng, ... },
 *     "total_cpqc": { "Tên nhân viên": tổng, ... }
 *   }
 * }
 * 
 * FILTER PARAMETERS:
 * - team=X → Lọc nhân viên theo team X
 * - ca=X → Lọc theo ca (Sáng, Chiều, Tối, etc.)
 * - san_pham=X → Lọc theo sản phẩm
 * - thi_truong=X → Lọc theo thị trường
 * - from_date=dd/mm/yyyy → Từ ngày
 * - to_date=dd/mm/yyyy → Đến ngày
 * 
 * VÍ DỤ:
 * ?team=HN-MKT&from_date=01/02/2026&to_date=10/02/2026
 * → by_ten: nhân sự HN-MKT trong khoảng ngày
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

    // ====================================
    // ORDERS API - Bảng orders
    // ====================================

    export async function getOrders(params = {}) {
    const query = buildQuery(params);
    const url = `${API_BASE_URL}/orders${query ? `?${query}` : ""}`;
    return requestJson(url);
    }

    export async function getOrdersStatisticsByQuery(params = {}) {
    const query = buildQuery(params);
    const url = `${API_BASE_URL}/orders/statistics${query ? `?${query}` : ""}`;
    return requestJson(url);
    }

    export async function getOrdersStatisticsByBody(payload = {}) {
    const url = `${API_BASE_URL}/orders/statistics`;
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

        // 5) Thống kê theo Team (GET)
        const statsTeamMarket = await getDetailReportsStatisticsByQuery({
        team: "HN-MKT",
        from_date: "01/02/2026",
        to_date: "10/02/2026",
        });
        console.log("Stats cho HN-MKT (từ 01/02-10/02):");
        console.log("  - Tổng records:", statsTeamMarket.statistics.total_records);
        console.log("  - Tổng CPQC:", statsTeamMarket.statistics.total_cpqc);
        console.log("  - Tổng mess_cmt:", statsTeamMarket.statistics.total_mess_cmt);
        console.log("  - by_ten (nhân sự HN-MKT):", statsTeamMarket.statistics.by_ten);

        // 6) Thống kê với multiple teams (POST)
        const statsMultiFilter = await getDetailReportsStatisticsByBody({
        filters: {
            team: ["HN-MKT", "SG-MKT"],     // OR: HN-MKT OR SG-MKT
        },
        date_range: {
            from: "01/02/2026",
            to: "10/02/2026",
        },
        date_column: "ngay",
        });
        console.log("Stats (HN-MKT OR SG-MKT):");
        console.log("  - Total records:", statsMultiFilter.statistics.total_records);
        console.log("  - Total CPQC:", statsMultiFilter.statistics.total_cpqc);
        console.log("  - by_ten (nhân sự các team):", statsMultiFilter.statistics.by_ten);

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
        // ORDERS TABLE - Gọi bảng orders
        // ===================================================

        // 9) Lấy orders không filter
        const allOrders = await getOrders({
        limit: 50,
        });
        console.log("Tất cả orders:", allOrders.data);

        // 10) Lấy orders theo team
        const ordersByTeam = await getOrders({
        team: "Team A",
        limit: 30,
        });
        console.log("Orders của Team A:", ordersByTeam.data);

        // 11) Lấy orders theo ngày
        const ordersByDate = await getOrders({
        order_date: "01/02/2026",
        limit: 20,
        });
        console.log("Orders ngày 01/02/2026:", ordersByDate.data);

        // 12) Lấy orders theo nhân viên marketing
        const ordersByMarketing = await getOrders({
        marketing_staff: "Nhân viên A",
        limit: 30,
        });
        console.log("Orders từ nhân viên marketing:", ordersByMarketing.data);

        // 13) Thống kê orders theo team (GET)
        const ordersStats = await getOrdersStatisticsByQuery({
        team: "Team A",
        created_at: "01/02/2026",
        });
        console.log("Stats orders Team A ngày 01/02:", ordersStats.statistics);

        // 14) Thống kê orders với multiple teams (POST)
        const ordersStatsPost = await getOrdersStatisticsByBody({
        filters: {
            team: ["Team A", "Team B"],
            delivery_status: "Delivered",
        },
        date_range: {
            from: "01/02/2026",
            to: "10/02/2026",
        },
        date_column: "created_at",
        });
        console.log("Stats orders POST:", ordersStatsPost.statistics);

        // ===================================================
        // KẾT HỢP DETAIL_REPORTS + ORDERS (cùng 1 request)
        // ===================================================

        // 15) Gọi detail_reports + orders cùng lúc
        const [detailData, orderData] = await Promise.all([
        getDetailReports({
            team: "Team A",
            from_date: "01/02/2026",
            to_date: "10/02/2026",
            limit: 50,
        }),
        getOrders({
            team: "Team A",
            created_at: "01/02/2026",
            limit: 50,
        }),
        ]);
        console.log("Combined - Detail Reports:", detailData.data);
        console.log("Combined - Orders:", orderData.data);

        // 16) Gọi statistics của detail_reports
        const [detailStats, orderStats] = await Promise.all([
        getDetailReportsStatisticsByQuery({
            team: "HN-MKT",
            from_date: "01/02/2026",
            to_date: "10/02/2026",
        }),
        getOrdersStatisticsByQuery({
            team: "HN-MKT",
            created_at: "01/02/2026",
        }),
        ]);
        console.log("Stats - Detail Reports (by_ten only):", detailStats.statistics.by_ten);
        console.log("Stats - Orders:", orderStats.statistics);

        // ===================================================
        // LINK EXAMPLES (URL-encoded):
        // ===================================================
        // DETAIL_REPORTS STATISTICS - Response chỉ có by_ten:
        // 
        // 1. Hiển thị tên nhân sự của HN-MKT:
        // https://lumidataapi.vercel.app/detail_reports/statistics?team=HN-MKT
        // → by_ten: Tên nhân sự HN-MKT (count, total_mess_cmt, total_cpqc)
        // 
        // 2. Hiển thị tên nhân sự + đổi ngày:
        // https://lumidataapi.vercel.app/detail_reports/statistics?team=HN-MKT&from_date=01/02/2026&to_date=10/02/2026
        // → by_ten: Tên nhân sự HN-MKT (trong khoảng ngày)
        // 
        // 3. Multiple teams:
        // https://lumidataapi.vercel.app/detail_reports/statistics?team=HN-MKT&team=SG-MKT
        // → by_ten: Nhân sự HN-MKT + SG-MKT
        //
        // ===================================================
        // ORDERS:
        // GET - Lấy orders của team:
        // https://lumidataapi.vercel.app/orders?team=Team%20A&limit=50
        //
        // GET - Lấy orders theo ngày tạo:
        // https://lumidataapi.vercel.app/orders?created_at=01/02/2026&team=Team%20A&limit=30
        //
        // Statistics GET:
        // https://lumidataapi.vercel.app/orders/statistics?team=Team%20A&created_at=01/02/2026
        //
        // ===================================================
        // LƯU Ý:
        // ===================================================
        // - Response detail_reports/statistics chỉ có: total_records, total_cpqc, total_mess_cmt, by_ten
        // - by_ten: { count: {...}, total_mess_cmt: {...}, total_cpqc: {...} }
        // - Khi truyền multiple values cho cùng biến → repeat param name (team=A&team=B)
    } catch (error) {
        console.error("API error:", error.message);
    }
    }

    // Bỏ comment nếu muốn chạy demo trực tiếp
    // demo();

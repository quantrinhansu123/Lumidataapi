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
 *     "total_cpqc": { "Tên nhân viên": tổng, ... },
 *     "total_vnd": { "Tên nhân viên": tổng VNĐ từ orders, ... }
 *   }
 * }
 * 
 * FILTER PARAMETERS:
 * - nhan_su=Tên1,Tên2,Tên3 → Lọc theo danh sách tên nhân viên (cách nhau bởi dấu phẩy)
 * - ca=X → Lọc theo ca (Sáng, Chiều, Tối, etc.)
 * - san_pham=X → Lọc theo sản phẩm
 * - thi_truong=X → Lọc theo thị trường
 * - from_date=dd/mm/yyyy → Từ ngày (áp dụng cho detail_reports và orders)
 * - to_date=dd/mm/yyyy → Đến ngày (áp dụng cho detail_reports và orders)
 * 
 * VÍ DỤ:
 * ?nhan_su=Nguyễn Văn A,Trần Thị B&from_date=01/02/2026&to_date=10/02/2026
 * → by_ten: Nguyễn Văn A và Trần Thị B trong khoảng ngày + total_vnd từ orders
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
        // 1) Lọc theo danh sách nhân sự (nhan_su)
        const specificStaff = await getDetailReports({
        nhan_su: "Nguyễn Văn A,Trần Thị B",
        limit: 20,
        });
        console.log("Chỉ Nguyễn Văn A và Trần Thị B:", specificStaff.data);

        // 2) Lọc theo Thị trường (chỉ hiển thị nhân sự tại thị trường VN)
        const marketVNData = await getDetailReports({
        thi_truong: "VN",
        limit: 20,
        });
        console.log("Chỉ thị trường VN:", marketVNData.data);

        // 3) Lọc kết hợp: nhan_su + thi_truong + san_pham
        const multiFilter = await getDetailReports({
        nhan_su: "Nguyễn Văn A,Trần Thị B,Lê Văn C",
        thi_truong: ["VN", "TQ"],   // Multiple markets
        san_pham: "SP1",
        limit: 50,
        });
        console.log("(3 nhân sự) AND (VN OR TQ) AND SP1:", multiFilter.data);

        // 4) Lọc theo nhan_su + Thi_truong + Ca + Từ ngày đến ngày
        const complexFilter = await getDetailReports({
        nhan_su: "Nguyễn Văn A",
        thi_truong: "VN",
        ca: "Sáng",
        from_date: "01/02/2026",
        to_date: "10/02/2026",
        limit: 50,
        });
        console.log("Nguyễn Văn A AND VN AND Sáng AND từ 01/02-10/02:", complexFilter.data);

        // 5) Thống kê theo danh sách nhân sự (GET)
        const statsSpecificStaff = await getDetailReportsStatisticsByQuery({
        nhan_su: "Nguyễn Văn A,Trần Thị B",
        from_date: "01/02/2026",
        to_date: "10/02/2026",
        });
        console.log("Stats cho 2 nhân sự (từ 01/02-10/02):");
        console.log("  - Tổng records:", statsSpecificStaff.statistics.total_records);
        console.log("  - Tổng CPQC:", statsSpecificStaff.statistics.total_cpqc);
        console.log("  - Tổng mess_cmt:", statsSpecificStaff.statistics.total_mess_cmt);
        console.log("  - by_ten:", statsSpecificStaff.statistics.by_ten);
        console.log("  - total_vnd từ orders:", statsSpecificStaff.statistics.by_ten.total_vnd);

        // 6) Thống kê với nhan_su (POST)
        const statsMultiFilter = await getDetailReportsStatisticsByBody({
        filters: {
            nhan_su: "Nguyễn Văn A,Trần Thị B,Lê Văn C",
        },
        date_range: {
            from: "01/02/2026",
        },
        date_column: "ngay",
        });
        console.log("Stats (3 nhân sự):");
        console.log("  - Total records:", statsMultiFilter.statistics.total_records);
        console.log("  - Total CPQC:", statsMultiFilter.statistics.total_cpqc);
        console.log("  - total_vnd từ orders:", statsMultiFilter.statistics.by_ten.total_vnd);
        console.log("  - by_ten:", statsMultiFilter.statistics.by_ten);

        // 7) Lọc chỉ theo Sản phẩm (tất cả team)
        const productOnly = await getDetailReports({
        san_pham: "SP1",
        limit: 100,
        });
        console.log("Chỉ sản phẩm SP1 (all teams & markets):", productOnly.data);

        // 8) Lấy tất cả wait getDetailReports({
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
            nhan_su: "Nguyễn Văn A",
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

        // 16) Gọi statistics của detail_reports + orders
        const [detailStats, orderStats] = await Promise.all([
        getDetailReportsStatisticsByQuery({
            nhan_su: "Nguyễn Văn A,Trần Thị B",
            from_date: "01/02/2026",
            to_date: "10/02/2026",
        }),
        getOrdersStatisticsByQuery({
            team: "Team A",
            created_at: "01/02/2026",
        }),
        ]);
        console.log("Stats - Detail Reports (by_ten + total_vnd):", detailStats.statistics.by_ten);
        console.log("Stats - Orders:", orderStats.statistics);

        // ===================================================
        // LINK EXAMPLES (URL-encoded):
        // ===================================================
        // DETAIL_REPORTS STATISTICS - Response có by_ten với total_vnd từ orders:
        // 
        // LOGIC KẾT NỐI 2 BẢNG:
        // 1. Filter detail_reports theo nhan_su, ca, san_pham, thi_truong, date range
        // 2. Lấy danh sách staff names từ kết quả filtered detail_reports
        // 3. Query orders theo date range (created_at) và marketing_staff
        // 4. Tính total_vnd từ orders CHỈ cho các staff có trong detail_reports
        // 
        // 1. Hiển thị tên nhân sự cụ thể:
        // https://lumidataapi.vercel.app/detail_reports/statistics?nhan_su=Nguyễn%20Văn%20A,Trần%20Thị%20B
        // → by_ten: Nguyễn Văn A và Trần Thị B (count, total_mess_cmt, total_cpqc, total_vnd)
        // 
        // 2. Hiển thị nhân sự + đổi ngày:
        // https://lumidataapi.vercel.app/detail_reports/statistics?nhan_su=Nguyễn%20Văn%20A&from_date=01/02/2026&to_date=10/02/2026
        // → by_ten: Nguyễn Văn A (trong khoảng ngày)
        // 
        // 3. Lọc nhiều nhân sự (dấu phẩy):
        // https://lumidataapi.vercel.app/detail_reports/statistics?nhan_su=A,B,C&ca=Sáng
        // → by_ten: Nhân sự A, B, C trong ca Sáng
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
        // - Response detail_reports/statistics bao gồm: total_records, total_cpqc, total_mess_cmt, by_ten
        // - by_ten: { count: {...}, total_mess_cmt: {...}, total_cpqc: {...}, total_vnd: {...} }
        // - total_vnd: Tổng tiền VNĐ từ bảng orders (chỉ tính cho staff có trong filtered detail_reports)
        // - Orders chỉ được query theo: date_range + marketing_staff (KHÔNG map filters ca/san_pham/thi_truong)
        // - nhan_su: Danh sách tên nhân viên cách nhau bằng dấu phẩy (VD: "Tên1,Tên2,Tên3")
        // - Khi truyền multiple values cho cùng biến → repeat param name (ca=A&ca=B)
    }
    }

    // Bỏ comment nếu muốn chạy demo trực tiếp
    // demo();

    /**
 * API Wrapper cho Detail Reports
 * 
 * Lọc theo ngày:
 * - Lọc 1 ngày: dùng param `ngay` (ví dụ: ngay: "01/02/2026")
 * - Lọc từ ngày đến ngày: dùng param `from_date` và `to_date`
 * 
 * Ví dụ GET:
 * getDetailReports({ from_date: "01/02/2026", to_date: "10/02/2026" })
 * 
 * Ví dụ POST:
 * getDetailReportsStatisticsByBody({ date_range: { from: "01/02/2026", to: "10/02/2026" } })
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

    // ====================
    // Example FE usage
    // ====================
    async function demo() {
    try {
        // 1) Lấy danh sách detail_reports - lọc theo 1 ngày (GET)
        const listResultSingleDay = await getDetailReports({
        team: "Team A",
        ngay: "01/02/2026",
        ca: "Sáng",
        limit: 20,
        });
        console.log("Danh sách 1 ngày:", listResultSingleDay.data);

        // 2) Lấy danh sách detail_reports - lọc từ ngày đến ngày (GET)
        const listResultDateRange = await getDetailReports({
        team: "Team A",
        ca: "Sáng",
        from_date: "01/02/2026",
        to_date: "10/02/2026",
        limit: 50,
        });
        console.log("Danh sách từ ngày đến ngày:", listResultDateRange.data);

        // 3) Thống kê từ ngày đến ngày bằng query params (GET)
        const statsGetDateRange = await getDetailReportsStatisticsByQuery({
        team: "Team A",
        from_date: "01/02/2026",
        to_date: "10/02/2026",
        ca: "Sáng",
        });
        console.log("Stats GET - tổng bản ghi:", statsGetDateRange.statistics.total_records);
        console.log("Stats GET - by_team:", statsGetDateRange.statistics.by_team);

        // 4) Thống kê từ ngày đến ngày bằng body (POST)
        const statsPost = await getDetailReportsStatisticsByBody({
        filters: {
            team: ["Team A", "Team B"],
            ca: "Sáng",
        },
        date_range: {
            from: "01/02/2026",
            to: "10/02/2026",
        },
        date_column: "ngay",
        });

        console.log("Stats POST - tổng mess/cmt:", statsPost.statistics.total_mess_cmt);
        console.log("Stats POST - by_ca:", statsPost.statistics.by_ca);

        // 5) Lấy tất cả dữ liệu (không filter)
        const allData = await getDetailReports({
        limit: 100,
        });
        console.log("Tất cả dữ liệu:", allData.data);
    } catch (error) {
        console.error("API error:", error.message);
    }
    }

    // Bỏ comment nếu muốn chạy demo trực tiếp
    // demo();

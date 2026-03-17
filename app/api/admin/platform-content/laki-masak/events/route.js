import { respondSuccess, respondError } from "@/lib/response.js";
import logger from "@/lib/logger.js";
import { requireAuthWithPermission } from "@/lib/helper/permission.helper.js";
import { getLakiMasakMeramuEvents } from "@/modules/admin/platform.content/services/platform.event.content.service.js";

const STATUS_PARAM_MAP = {
  "akan-datang": "UPCOMING",
  "sedang-berlangsung": "ONGOING",
  berakhir: "FINISHED",
};

export async function GET(request) {
  try {
    await requireAuthWithPermission(request, "categories.view");

    const { searchParams } = new URL(request.url);
    const rawStatus = searchParams.get("status") || undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100);
    const rawCursor = searchParams.get("cursor");
    const cursor = rawCursor ? parseInt(rawCursor, 10) : undefined;

    const filters = {
      q: searchParams.get("q") || undefined,
      status: rawStatus ? (STATUS_PARAM_MAP[rawStatus] ?? rawStatus) : undefined,
      limit,
      cursor,
    };

    const result = await getLakiMasakMeramuEvents(filters);

    return respondSuccess(result, 200);
  } catch (error) {
    logger.error("Error fetching laki masak meramu events", { error: error.message });
    if (error.statusCode) {
      return respondError({ message: error.message, status: error.statusCode });
    }
    return respondError({ message: "Failed to fetch meramu events", status: 500 });
  }
}

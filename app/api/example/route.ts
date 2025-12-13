import { NextResponse } from "next/server";
import logger from "@/lib/logger";

/**
 * Example API endpoint for testing data fetching
 * GET /api/example
 */
export async function GET() {
  try {
    logger.info("Example API endpoint called");

    const data = {
      message: "API is working",
      timestamp: new Date().toISOString(),
      data: {
        items: [
          { id: 1, name: "Item 1", value: 100 },
          { id: 2, name: "Item 2", value: 200 },
          { id: 3, name: "Item 3", value: 300 },
          { id: 4, name: "Item 4", value: 400 },
          { id: 5, name: "Item 5", value: 500 },
        ],
      },
    };

    return NextResponse.json(data);
  } catch (error) {
    logger.error({ error }, "Error in example API endpoint");
    return NextResponse.json(
      { error: "Internal server error", message: "An error occurred" },
      { status: 500 }
    );
  }
}

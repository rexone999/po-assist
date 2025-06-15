import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("🎉 PO Assist installed successfully!")
    console.log("Client Key:", body.clientKey)
    console.log("Timestamp:", new Date().toISOString())

    // Return success IMMEDIATELY to prevent timeout
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Installation successful",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  } catch (error) {
    console.log("Install error (non-critical):", error)

    // Still return 200 to prevent Jira installation failure
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Installed with warnings",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

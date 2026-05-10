import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Read data from search params so share URLs can embed score data
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("u") ?? "anon"
  const aura = parseInt(searchParams.get("a") ?? "847", 10)
  const tier = searchParams.get("t") ?? "Internship Gold"
  const university = searchParams.get("uni") ?? ""

  // Determine flame color based on tier
  const flameColor =
    aura >= 2000
      ? "#f59e0b"
      : aura >= 1500
      ? "#f97316"
      : aura >= 1000
      ? "#ea580c"
      : "#fb923c"

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "serif",
        }}
      >
        {/* Top: brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              fontWeight: 500,
              color: "#737373",
              letterSpacing: "-0.02em",
            }}
          >
            RankedIn
          </span>
          <span style={{ color: "#404040", fontSize: "18px" }}>/</span>
          <span style={{ fontSize: "22px", color: "#525252" }}>aura scan</span>
        </div>

        {/* Middle: score */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            {/* Flame icon (inline SVG via text alternative) */}
            <div
              style={{
                width: "64px",
                height: "80px",
                background: flameColor,
                borderRadius: "50% 50% 30% 30% / 60% 60% 40% 40%",
                boxShadow: `0 0 40px ${flameColor}88`,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "96px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {aura.toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 500,
                color: "#D4D4D4",
                fontStyle: "italic",
              }}
            >
              {tier}
            </span>
            <span style={{ fontSize: "20px", color: "#525252" }}>
              @{username}
              {university ? `  ·  ${university}` : ""}
            </span>
          </div>
        </div>

        {/* Bottom: CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span style={{ fontSize: "18px", color: "#404040" }}>
            find out your aura score
          </span>
          <span
            style={{
              fontSize: "18px",
              color: "#737373",
              background: "#171717",
              padding: "12px 28px",
              borderRadius: "999px",
              border: "1px solid #262626",
            }}
          >
            rankedin.app/scan
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

"use client"

import { useState, useEffect } from "react"

export default function JiraFastPage() {
  const [brdContent, setBrdContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedStories, setGeneratedStories] = useState<any[]>([])
  const [message, setMessage] = useState("✅ Ready!")

  useEffect(() => {
    // ⚡ INSTANT LOAD - No delays, no async operations

    // Immediate Jira iframe communication
    if (window.parent !== window) {
      // Send ready signal immediately
      window.parent.postMessage({ type: "addon-ready", source: "po-assist" }, "*")

      // Send height immediately
      const sendHeight = () => {
        const height = Math.max(document.documentElement.scrollHeight, 250)
        window.parent.postMessage({ type: "resize", height }, "*")
      }

      // Multiple quick height updates
      sendHeight()
      setTimeout(sendHeight, 10)
      setTimeout(sendHeight, 50)
      setTimeout(sendHeight, 100)

      // Simple observer for changes
      const observer = new MutationObserver(sendHeight)
      observer.observe(document.body, { childList: true, subtree: true })

      return () => observer.disconnect()
    }
  }, [])

  // Quick resize on story changes
  useEffect(() => {
    if (window.parent !== window) {
      const height = Math.max(document.documentElement.scrollHeight, 250)
      window.parent.postMessage({ type: "resize", height }, "*")
    }
  }, [generatedStories])

  const generateStories = async () => {
    if (!brdContent.trim()) {
      setMessage("❌ Please enter BRD content")
      return
    }

    setIsGenerating(true)
    setMessage("⏳ Generating...")

    try {
      const response = await fetch("/api/generate-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brdContent,
          projectName: "Jira Project",
        }),
      })

      if (!response.ok) throw new Error("Failed")

      const data = await response.json()
      setGeneratedStories(data.stories)
      setMessage(`✅ Generated ${data.stories.length} stories!`)
    } catch (error) {
      setMessage("❌ Generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  const publishToJira = async () => {
    if (generatedStories.length === 0) return

    setMessage("⏳ Publishing...")

    try {
      const response = await fetch("/api/publish-to-jira", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stories: generatedStories,
          projectKey: "TEST",
        }),
      })

      if (!response.ok) throw new Error("Failed")

      const data = await response.json()
      setMessage(`✅ Published ${data.publishedCount} stories!`)
    } catch (error) {
      setMessage("❌ Publishing failed")
    }
  }

  return (
    <div
      style={{
        padding: "10px",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "white",
        fontSize: "13px",
      }}
    >
      {/* Ultra-compact header */}
      <div
        style={{
          background: "#0052cc",
          color: "white",
          padding: "6px 10px",
          borderRadius: "3px",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: "600" }}>🚀 PO Assist</div>
        <div style={{ fontSize: "10px", opacity: 0.9 }}>AI Stories</div>
      </div>

      {/* Status */}
      <div
        style={{
          padding: "4px 8px",
          marginBottom: "10px",
          backgroundColor: message.includes("❌") ? "#ffebee" : message.includes("⏳") ? "#fff3e0" : "#e8f5e8",
          borderRadius: "3px",
          fontSize: "11px",
          color: message.includes("❌") ? "#c62828" : message.includes("⏳") ? "#ef6c00" : "#2e7d32",
        }}
      >
        {message}
      </div>

      {/* BRD Input */}
      <div style={{ marginBottom: "10px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "3px",
            fontSize: "11px",
            fontWeight: "500",
            color: "#172b4d",
          }}
        >
          📋 BRD Content:
        </label>
        <textarea
          value={brdContent}
          onChange={(e) => setBrdContent(e.target.value)}
          placeholder="Paste BRD content here..."
          style={{
            width: "100%",
            height: "60px",
            padding: "4px",
            border: "1px solid #dfe1e6",
            borderRadius: "3px",
            fontSize: "11px",
            fontFamily: "inherit",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Buttons */}
      <div style={{ marginBottom: "10px", display: "flex", gap: "6px" }}>
        <button
          onClick={generateStories}
          disabled={isGenerating || !brdContent.trim()}
          style={{
            backgroundColor: isGenerating || !brdContent.trim() ? "#f4f5f7" : "#0052cc",
            color: isGenerating || !brdContent.trim() ? "#6b778c" : "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: "3px",
            cursor: isGenerating || !brdContent.trim() ? "not-allowed" : "pointer",
            fontSize: "11px",
            fontWeight: "500",
            flex: 1,
          }}
        >
          {isGenerating ? "⏳ Generating..." : "✨ Generate"}
        </button>

        {generatedStories.length > 0 && (
          <button
            onClick={publishToJira}
            style={{
              backgroundColor: "#00875a",
              color: "white",
              border: "none",
              padding: "6px 10px",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: "500",
              flex: 1,
            }}
          >
            📤 Publish
          </button>
        )}
      </div>

      {/* Stories */}
      {generatedStories.length > 0 && (
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#172b4d",
              marginBottom: "6px",
              paddingBottom: "2px",
              borderBottom: "1px solid #0052cc",
            }}
          >
            📝 Stories ({generatedStories.length}):
          </div>
          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
            {generatedStories.slice(0, 6).map((story, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#f4f5f7",
                  border: "1px solid #dfe1e6",
                  borderRadius: "3px",
                  padding: "4px",
                  marginBottom: "3px",
                  fontSize: "10px",
                }}
              >
                <div style={{ marginBottom: "2px", display: "flex", gap: "3px" }}>
                  <span
                    style={{
                      backgroundColor: story.type === "epic" ? "#0052cc" : "#6b778c",
                      color: "white",
                      padding: "1px 3px",
                      borderRadius: "2px",
                      fontSize: "8px",
                      fontWeight: "600",
                    }}
                  >
                    {story.type.toUpperCase()}
                  </span>
                  <span
                    style={{
                      backgroundColor: "#dfe1e6",
                      color: "#42526e",
                      padding: "1px 3px",
                      borderRadius: "2px",
                      fontSize: "8px",
                    }}
                  >
                    {story.priority}
                  </span>
                </div>
                <div style={{ fontWeight: "500", marginBottom: "1px", color: "#172b4d" }}>{story.title}</div>
                <div style={{ color: "#6b778c", lineHeight: "1.2" }}>{story.description?.substring(0, 60)}...</div>
              </div>
            ))}
            {generatedStories.length > 6 && (
              <div style={{ textAlign: "center", color: "#6b778c", fontSize: "9px", padding: "2px" }}>
                +{generatedStories.length - 6} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

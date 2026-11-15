import { useEffect, useRef, useState } from "react"

const fieldStyle = {
  display: "block",
  boxSizing: "border-box",
  width: "100%",
  marginTop: 7,
  padding: "11px 12px",
  border: "1px solid #dce5f1",
  borderRadius: 8,
  background: "#f8faff",
  color: "#243247",
  fontSize: 12,
}

const labelStyle = {
  display: "block",
  marginBottom: 16,
  color: "#60758d",
  fontSize: 12,
}

export default function NewTaskForm({ onClose, onCreate }) {
  const dialogRef = useRef(null)
  const sendingRef = useRef(false)

  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [brief, setBrief] = useState("")
  const [clipCount, setClipCount] = useState("3")
  const [duration, setDuration] = useState("45")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const dialog = dialogRef.current

    if (dialog && !dialog.open) {
      dialog.showModal()
    }

    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  function handleCancel(event) {
    event.preventDefault()

    if (!sendingRef.current) {
      onClose()
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (sendingRef.current) return

    setError("")
    setSending(true)
    sendingRef.current = true

    let task

    try {
      const response = await fetch("/worker-api/youtube/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim(),
          brief: brief.trim(),
          clip_count: Number(clipCount),
          duration: Number(duration),
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        let message = "Permintaan gagal."

        if (typeof data?.detail === "string") {
          message = data.detail
        } else if (Array.isArray(data?.detail)) {
          message = data.detail.map((item) => item.msg).join(". ")
        }

        throw new Error(message)
      }

      if (!data?.id) {
        throw new Error(
          "Respons worker tidak valid. Periksa daftar task sebelum mencoba lagi."
        )
      }

      task = data
    } catch (requestError) {
      let message = requestError.message

      if (requestError instanceof TypeError) {
        message =
          "Koneksi worker terputus. Periksa /worker-api/tasks sebelum mengirim ulang."
      }

      setError(message)
      sendingRef.current = false
      setSending(false)
      return
    }

    sendingRef.current = false
    setSending(false)
    onCreate(task)
  }

  let buttonLabel = "Ambil video dari YouTube"

  if (sending) {
    buttonLabel = "Mengirim permintaan…"
  }

  return (
    <dialog
      ref={dialogRef}
      className="office-task-dialog"
      aria-labelledby="youtube-task-title"
      onCancel={handleCancel}
      style={{
        boxSizing: "border-box",
        width: 500,
        maxWidth: "calc(100vw - 40px)",
        maxHeight: "90vh",
        overflowY: "auto",
        margin: "auto",
        padding: 24,
        border: "1px solid #e0e7ef",
        borderRadius: 16,
        background: "white",
        color: "#243247",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <h2
          id="youtube-task-title"
          style={{ margin: 0, fontSize: 19, fontWeight: 700 }}
        >
          Video dari YouTube
        </h2>

        <button
          type="button"
          disabled={sending}
          onClick={onClose}
          aria-label="Tutup form"
          style={{
            padding: "4px 10px",
            border: 0,
            borderRadius: 6,
            background: "#f1f5fa",
            color: "#718096",
            fontSize: 22,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      <p style={{ color: "#8290a3", fontSize: 12, lineHeight: 1.8 }}>
        Paste link satu video. Gunakan sumber yang boleh lu
        download dan gunakan.
      </p>

      <form onSubmit={handleSubmit} aria-busy={sending}>
        <fieldset
          disabled={sending}
          style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
        >
          <label style={labelStyle}>
            Link YouTube
            <input
              type="url"
              required
              maxLength={2000}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              style={fieldStyle}
            />
          </label>

          <label style={labelStyle}>
            Nama pekerjaan
            <input
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Contoh: Klip podcast terbaru"
              style={fieldStyle}
            />
          </label>

          <label style={labelStyle}>
            Brief untuk tim
            <textarea
              rows={3}
              maxLength={3000}
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              placeholder="Topik, audiens, gaya subtitle…"
              style={{ ...fieldStyle, resize: "vertical" }}
            />
          </label>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            <label style={{ ...labelStyle, flex: "1 1 140px" }}>
              Jumlah klip
              <select
                value={clipCount}
                onChange={(event) => setClipCount(event.target.value)}
                style={fieldStyle}
              >
                {[1, 3, 5].map((count) => (
                  <option key={count} value={count}>
                    {count} klip
                  </option>
                ))}
              </select>
            </label>

            <label style={{ ...labelStyle, flex: "1 1 140px" }}>
              Durasi target
              <select
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                style={fieldStyle}
              >
                {[30, 45, 60, 90].map((seconds) => (
                  <option key={seconds} value={seconds}>
                    {seconds} detik
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <p
          style={{
            padding: 12,
            borderRadius: 8,
            background: "#eff6ff",
            color: "#60758d",
            fontSize: 11,
            lineHeight: 1.8,
          }}
        >
          Download maksimal 720p, sumber maksimal 2 jam,
          dan file final maksimal 1 GB. Tahap ini belum
          menjalankan transkripsi atau clipping.
        </p>

        {error && (
          <p role="alert" style={{ color: "#b42318", fontSize: 12 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          style={{
            width: "100%",
            marginTop: 12,
            padding: 12,
            border: 0,
            borderRadius: 9,
            background: "#3b82f6",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            cursor: sending ? "wait" : "pointer",
          }}
        >
          {buttonLabel}
        </button>
      </form>
    </dialog>
  )
}
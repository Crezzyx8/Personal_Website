import { useState } from "react"
import OfficeScene from "./OfficeScene"
import NewTaskForm from "./NewTaskForm"
import "./AiOffice.css"
import OfficeDepartments from "./OfficeDepartments"

const STORAGE_KEY = "filbert-office-tasks-v1"

const agents = [
  {
    name: "Producer",
    task: "Mengatur brief dan antrean",
    color: "#f59e0b",
  },
  {
    name: "Clip Strategist",
    task: "Memilih momen menarik",
    color: "#3b82f6",
  },
  {
    name: "Video Editor",
    task: "Editing dan subtitle",
    color: "#10b981",
  },
  {
    name: "Content Reviewer",
    task: "Memeriksa konteks dan teks",
    color: "#8b5cf6",
  },
  {
    name: "Technical Reviewer",
    task: "Memeriksa video dan audio",
    color: "#ec4899",
  },
  {
    name: "Publisher",
    task: "Upload YouTube dan TikTok",
    color: "#14b8a6",
  },
]

const productionSteps = [
  "Terima video",
  "Pilih momen",
  "Edit dan subtitle",
  "Review konten",
  "Review teknis",
  "Publish",
]

const primaryButtonStyle = {
  padding: "9px 14px",
  border: 0,
  borderRadius: 8,
  background: "#3b82f6",
  color: "white",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
}

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
}

function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (task) =>
        task &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.createdAt === "string" &&
        task.file &&
        typeof task.file.name === "string"
    )
  } catch {
    return []
  }
}

function formatDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Waktu tidak tersedia"
  }

  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function ProductionFlow() {
  return (
    <div className="office-flow">
      <h3>Alur produksi</h3>

      <ol>
        {productionSteps.map((step, index) => (
          <li key={step}>
            <span className="office-step-number">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function AgentDetails({ agent }) {
  return (
    <div className="office-agent-detail" aria-live="polite">
      <span
        className="office-detail-avatar"
        style={{ backgroundColor: agent.color }}
        aria-hidden="true"
      >
        {getInitials(agent.name)}
      </span>

      <h3>{agent.name}</h3>
      <p>{agent.task}</p>

      <div className="office-detail-section">
        <strong>Status koneksi</strong>
        <span>Belum terhubung ke worker</span>
      </div>

      <div className="office-detail-section">
        <strong>Pekerjaan aktif</strong>
        <span>Belum ada pekerjaan berjalan</span>
      </div>

      <div className="office-review-note">
        <strong>Animasi visual</strong>
        <p>
          Gerakan karakter belum mencerminkan proses AI nyata.
        </p>
      </div>
    </div>
  )
}

function TaskDetails({ task }) {
  const fileSize = (
    Number(task.file.size || 0) /
    1024 /
    1024
  ).toFixed(1)

  return (
    <div className="office-agent-detail" aria-live="polite">
      <h3 style={{ overflowWrap: "anywhere" }}>
        {task.title}
      </h3>

      <p style={{ whiteSpace: "pre-wrap" }}>
        {task.brief || "Tidak ada brief tambahan."}
      </p>

      <div className="office-detail-section">
        <strong>Video sumber</strong>
        <span style={{ overflowWrap: "anywhere" }}>
          {task.file.name}
        </span>
      </div>

      <div className="office-detail-section">
        <strong>Ukuran file</strong>
        <span>{fileSize} MB</span>
      </div>

      <div className="office-detail-section">
        <strong>Target hasil</strong>
        <span>
          {task.clipCount} klip · {task.duration} detik per klip
        </span>
      </div>

      <div className="office-detail-section">
        <strong>Dibuat</strong>
        <span>{formatDate(task.createdAt)} WIB</span>
      </div>

      <div className="office-review-note">
        <strong>Menunggu worker</strong>
        <p>
          Brief tersimpan di browser. File video belum diupload,
          diproses, atau dipublikasikan.
        </p>
      </div>
    </div>
  )
}

function TaskQueue({ tasks, onSelectTask, onNewTask }) {
  let queueContent

  if (tasks.length === 0) {
    queueContent = (
      <div className="office-queue-empty">
        <span aria-hidden="true">▤</span>
        <p>Belum ada brief produksi.</p>

        <button
          type="button"
          onClick={onNewTask}
          style={{
            ...primaryButtonStyle,
            marginTop: 14,
          }}
        >
          Buat task pertama
        </button>
      </div>
    )
  } else {
    queueContent = (
      <div
        style={{
          display: "grid",
          gap: 10,
          margin: "18px 0",
          maxHeight: 360,
          overflowY: "auto",
        }}
      >
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onSelectTask(task)}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #e0e7ef",
              borderRadius: 9,
              background: "#f8faff",
              color: "#243247",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <strong
              style={{
                display: "block",
                fontSize: 11,
                overflowWrap: "anywhere",
              }}
            >
              {task.title}
            </strong>

            <span
              style={{
                display: "block",
                marginTop: 5,
                color: "#8290a3",
                fontSize: 10,
              }}
            >
              {task.clipCount} klip · {task.duration} detik
            </span>

            <span
              style={{
                display: "block",
                marginTop: 7,
                color: "#a57a2e",
                fontSize: 9,
              }}
            >
              Menunggu worker
            </span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <>
      {queueContent}
      <ProductionFlow />
    </>
  )
}

function ActivityPanel({ tasks }) {
  let activityContent

  if (tasks.length === 0) {
    activityContent = (
      <div className="office-empty-state">
        <span className="office-empty-icon" aria-hidden="true">
          ◷
        </span>

        <h3>Belum ada aktivitas</h3>
        <p>Buat brief pertama melalui tombol Task Baru.</p>
      </div>
    )
  } else {
    activityContent = (
      <div style={{ marginTop: 18 }}>
        {tasks.slice(0, 8).map((task) => (
          <div
            key={task.id}
            style={{
              padding: "12px 0",
              borderBottom: "1px solid #edf0f5",
            }}
          >
            <strong
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                overflowWrap: "anywhere",
              }}
            >
              Brief dibuat: {task.title}
            </strong>

            <p
              style={{
                margin: "5px 0",
                color: "#8290a3",
                fontSize: 10,
              }}
            >
              {formatDate(task.createdAt)} WIB
            </p>

            <span
              style={{
                color: "#a57a2e",
                fontSize: 10,
              }}
            >
              Menunggu worker
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <aside className="office-panel">
      <div className="office-panel-heading">
        <h2>Aktivitas langsung</h2>
        <span className="office-counter">{tasks.length}</span>
      </div>

      {activityContent}

      <div className="office-panel-note">
        <span className="office-status-dot" />
        Aktivitas ini mencatat brief, bukan eksekusi AI
      </div>
    </aside>
  )
}

export default function AiOffice() {
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [tasks, setTasks] = useState(loadTasks)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [storageError, setStorageError] = useState("")

  const selectedTask = tasks.find(
    (task) => task.id === selectedTaskId
  )

  function handleCreateTask(task) {
  const nextTasks = [
    task,
    ...tasks.filter((existing) => existing.id !== task.id),
  ]

  setTasks(nextTasks)
  setSelectedTaskId(task.id)
  setSelectedAgent(null)
  setShowTaskForm(false)
  setStorageError("")

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextTasks)
    )
  } catch {
    setStorageError(
      "Video berhasil disimpan di worker, tetapi cache browser gagal disimpan. Jangan upload ulang."
    )
  }
}

  function openTaskForm() {
    setStorageError("")
    setShowTaskForm(true)
  }

  function closeTaskForm() {
    setShowTaskForm(false)
    setStorageError("")
  }

  function selectAgent(agent) {
    setSelectedAgent(agent)
    setSelectedTaskId(null)
  }

  function selectTask(task) {
    setSelectedTaskId(task.id)
    setSelectedAgent(null)
  }

  function clearSelection() {
    setSelectedAgent(null)
    setSelectedTaskId(null)
  }

  let panelTitle = "Antrean pekerjaan"

  let panelContent = (
    <TaskQueue
      tasks={tasks}
      onSelectTask={selectTask}
      onNewTask={openTaskForm}
    />
  )

  if (selectedAgent) {
    panelTitle = "Detail agent"
    panelContent = <AgentDetails agent={selectedAgent} />
  } else if (selectedTask) {
    panelTitle = "Detail pekerjaan"
    panelContent = <TaskDetails task={selectedTask} />
  }

  let panelAction = (
    <span className="office-counter">{tasks.length}</span>
  )

  if (selectedAgent || selectedTask) {
    panelAction = (
      <button
        type="button"
        className="office-detail-close"
        onClick={clearSelection}
      >
        Kembali
      </button>
    )
  }

  return (
    <main className="office-page">
      <header className="office-header">
        <div className="office-brand">
          <div
            className="office-brand-icon"
            aria-hidden="true"
          >
            FH
          </div>

          <div>
            <h1>Kantor Virtual Filbert</h1>
            <p>Tim produksi konten YouTube dan TikTok</p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span className="office-badge">
            <span className="office-status-dot" />
            Worker belum terhubung
          </span>

          <button
            type="button"
            onClick={openTaskForm}
            style={primaryButtonStyle}
          >
            + Task Baru
          </button>
        </div>
      </header>

      <OfficeDepartments />

      {storageError && (
        <p
          role="alert"
          style={{
            padding: 14,
            border: "1px solid #fecdca",
            borderRadius: 8,
            background: "#fef3f2",
            color: "#b42318",
            fontSize: 12,
          }}
        >
          {storageError}
        </p>
      )}

      <div className="office-layout">
        <ActivityPanel tasks={tasks} />

        <section
          className="office-room"
          aria-labelledby="studio-title"
        >
          <div className="office-room-heading">
            <div>
              <h2 id="studio-title">Content Studio</h2>
              <p>Ruang kerja tim produksi</p>
            </div>

            <span className="office-room-badge">
              6 peran agent
            </span>
          </div>

          <OfficeScene />

          <div className="office-room-footer">
            <span className="office-room-footer-label">
              WORKFLOW
            </span>

            <p>
              Producer → Strategist → Editor → Review konten →
              Review teknis → Publisher
            </p>
          </div>
        </section>

        <aside
          className="office-panel"
          aria-label="Detail dan antrean pekerjaan"
        >
          <div className="office-panel-heading">
            <h2>{panelTitle}</h2>
            {panelAction}
          </div>

          {panelContent}
        </aside>
      </div>

      <section
        className="office-agents"
        aria-label="Pilih anggota tim"
      >
        {agents.map((agent) => {
          const isSelected =
            selectedAgent?.name === agent.name

          let cardClassName = "office-agent-card"

          if (isSelected) {
            cardClassName += " is-selected"
          }

          return (
            <button
              type="button"
              key={agent.name}
              className={cardClassName}
              style={{ "--agent-color": agent.color }}
              onClick={() => selectAgent(agent)}
              aria-pressed={isSelected}
              aria-label={`Lihat detail ${agent.name}`}
            >
              <span className="office-agent-title">
                <span
                  className="office-agent-avatar"
                  aria-hidden="true"
                >
                  {getInitials(agent.name)}
                </span>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 650,
                  }}
                >
                  {agent.name}
                </span>
              </span>

              <span
                style={{
                  display: "block",
                  minHeight: 32,
                  margin: "10px 0",
                  color: "#8290a3",
                  fontSize: 10,
                  lineHeight: 1.7,
                }}
              >
                {agent.task}
              </span>

              <span className="office-agent-status">
                <span />
                Belum terhubung
              </span>
            </button>
          )
        })}
      </section>

      <footer className="office-page-footer">
        <span>Filbert AI Office</span>
        <span>
          Brief tersimpan di browser ini · Video belum diupload
        </span>
      </footer>

      {showTaskForm && (
        <NewTaskForm
          onClose={closeTaskForm}
          onCreate={handleCreateTask}
        />
      )}
    </main>
  )
}

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg = { sender: 'user', text: input }
    setMessages((msgs) => [...msgs, userMsg])
    setLoading(true)
    setInput("")
    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      setMessages((msgs) => [...msgs, { sender: 'bot', text: data.response }])
    } catch (err) {
      setMessages((msgs) => [...msgs, { sender: 'bot', text: 'Error: Could not reach backend.' }])
    }
    setLoading(false)
    requestAnimationFrame(() => {
      if (inputRef.current) inputRef.current.focus()
    })
  }

  return (
    <div
      style={{
        width: 1100,
        minHeight: '90vh',
        margin: '40px auto',
        background: '#f7f7f8',
        borderRadius: 16,
        boxShadow: '0 4px 32px #0001',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <header style={{ padding: '32px 64px 16px 64px', background: '#fff', borderBottom: '1px solid #ececec' }}>
        <h1 style={{ color: '#222', fontSize: 32, margin: 0, letterSpacing: -1, fontWeight: 700 }}>Ask me anything about Kai</h1>
      </header>
      <div
        style={{
          flex: 1,
          padding: '32px 64px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: '#bbb', fontSize: 20, textAlign: 'center', marginTop: 120 }}>
            Who is Kai? Ask me!
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                background: msg.sender === 'user' ? '#1976d2' : '#fff',
                color: msg.sender === 'user' ? '#fff' : '#222',
                borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '18px 28px',
                maxWidth: 700,
                fontSize: 18,
                boxShadow: msg.sender === 'user' ? '0 2px 8px #1976d222' : '0 2px 8px #0001',
                marginLeft: msg.sender === 'user' ? 120 : 0,
                marginRight: msg.sender === 'user' ? 0 : 120,
                wordBreak: 'break-word',
                border: msg.sender === 'user' ? 'none' : '1px solid #ececec',
                transition: 'background 0.2s',
                textAlign: msg.sender === 'bot' ? 'left' : undefined,
              }}
            >
              {msg.sender === 'bot' ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ color: '#888', fontSize: 18, marginTop: 16, textAlign: 'left' }}><i>Thinking...</i></div>
        )}
      </div>
      <form
        onSubmit={sendMessage}
        style={{
          display: 'flex',
          gap: 16,
          padding: '24px 64px',
          background: '#fff',
          borderTop: '1px solid #ececec',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '16px 18px',
            borderRadius: 24,
            border: '1px solid #ddd',
            background: '#f7f7f8',
            color: '#222',
            fontSize: 18,
            outline: 'none',
            boxShadow: '0 1px 4px #0001',
          }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '0 32px',
            fontSize: 18,
            borderRadius: 24,
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 4px #1976d222',
            height: 48,
            transition: 'background 0.2s',
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default App

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'model'
  content: string
}

const BRIEF_REGEX = /---BRIEF_START---([\s\S]*?)---BRIEF_END---/

export default function WorkspacePage() {
  const router = useRouter()
  const [member, setMember] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [brief, setBrief] = useState<string | null>(null)
  const [pushing, setPushing] = useState(false)
  const [pushed, setPushed] = useState(false)
  const [pushedUrl, setPushedUrl] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 온보딩 확인
  useEffect(() => {
    const m = localStorage.getItem('sc_member')
    const k = localStorage.getItem('sc_api_key')
    if (!m || !k) { router.push('/'); return }
    setMember(m)
    setApiKey(k)

    // 첫 인사
    setMessages([{
      role: 'model',
      content: `안녕하세요 ${m}님! 저는 Survey Corps 기획서 봇이에요 ✦\n\n오늘 만들어보고 싶은 게 있으신가요? 어떤 아이디어든 편하게 말씀해 주세요 😊`,
    }])
  }, [router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const extractBrief = (text: string) => {
    const match = BRIEF_REGEX.exec(text)
    return match ? match[1].trim() : null
  }

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }],
          })),
          apiKey,
          memberName: member,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const replyText: string = data.text
      setMessages(prev => [...prev, { role: 'model', content: replyText }])

      // 기획서 추출
      const extracted = extractBrief(replyText)
      if (extracted) setBrief(extracted)

    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'model',
        content: `⚠️ 오류가 발생했어요: ${e instanceof Error ? e.message : '다시 시도해주세요.'}`
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [input, messages, apiKey, member, loading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handlePush = async () => {
    if (!brief) return
    setPushing(true)
    try {
      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberName: member, briefContent: brief }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPushed(true)
      setPushedUrl(data.url || '')
    } catch (e) {
      alert(`저장 실패: ${e instanceof Error ? e.message : '다시 시도해주세요.'}`)
    } finally {
      setPushing(false)
    }
  }

  const handleNewSession = () => {
    setBrief(null)
    setPushed(false)
    setPushedUrl('')
    const m = member
    setMessages([{
      role: 'model',
      content: `새 기획서를 시작할게요, ${m}님! 어떤 아이디어를 기획해볼까요? 😊`,
    }])
  }

  // 기획서 화면에서 원문 제외한 정제 텍스트 렌더
  const renderBriefLine = (line: string, i: number) => {
    if (line.startsWith('# ')) return <h2 key={i} className="text-corps-400 font-bold text-base mb-3">{line.slice(2)}</h2>
    if (line.startsWith('## ')) return <h3 key={i} className="text-zinc-300 font-semibold text-xs tracking-widest uppercase mt-4 mb-2 pt-3 border-t border-zinc-800">{line.slice(3)}</h3>
    if (line.startsWith('**') && line.endsWith('**')) return null
    if (line.startsWith('- ')) return <li key={i} className="text-zinc-400 text-xs ml-3 list-disc">{line.slice(2)}</li>
    if (line.trim() === '') return <div key={i} className="h-1" />
    // bold 파싱
    const parts = line.split(/\*\*(.+?)\*\*/g)
    return (
      <p key={i} className="text-zinc-400 text-xs">
        {parts.map((part, j) =>
          j % 2 === 1 ? <span key={j} className="text-zinc-200 font-medium">{part}</span> : part
        )}
      </p>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden">

      {/* ── 사이드바 ── */}
      <aside className="w-56 border-r border-zinc-900 flex flex-col shrink-0">
        {/* 로고 */}
        <div className="p-4 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
              <path d="M14 8v12M4 8l10 6 10-6" stroke="#f59e0b" strokeWidth="1.5"/>
            </svg>
            <span className="text-zinc-200 font-semibold text-sm">Survey Corps</span>
          </div>
        </div>

        {/* 멤버 정보 */}
        <div className="p-4 border-b border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-corps-500/20 border border-corps-500/30 flex items-center justify-center text-corps-400 text-xs font-bold">
              {member[0]}
            </div>
            <div>
              <p className="text-zinc-200 text-xs font-medium">{member}</p>
              <p className="text-zinc-600 text-[10px]">조사병단 멤버</p>
            </div>
          </div>
        </div>

        {/* 새 기획서 버튼 */}
        <div className="p-3">
          <button
            onClick={handleNewSession}
            className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
          >
            + 새 기획서
          </button>
        </div>

        {/* 세션 상태 */}
        <div className="flex-1 px-3 py-2">
          <p className="text-[10px] text-zinc-700 tracking-widest uppercase mb-2">현재 세션</p>
          <div className={`px-2.5 py-2 rounded-lg text-[11px] ${brief ? 'bg-corps-500/10 border border-corps-500/20 text-corps-400' : 'bg-zinc-900 border border-zinc-800 text-zinc-500'}`}>
            {brief ? '기획서 완성됨 ✓' : `대화 중 (${messages.filter(m => m.role === 'user').length}개 답변)`}
          </div>
        </div>

        {/* 로그아웃 */}
        <div className="p-3 border-t border-zinc-900">
          <button
            onClick={() => { localStorage.clear(); router.push('/') }}
            className="text-[11px] text-zinc-700 hover:text-zinc-500 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* ── 채팅 패널 ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* 헤더 */}
        <header className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between shrink-0">
          <div>
            <p className="text-zinc-100 font-medium text-sm">기획서 작성</p>
            <p className="text-zinc-600 text-xs mt-0.5">AI와 대화하며 기획서를 완성해보세요</p>
          </div>
          {brief && !pushed && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-corps-400 animate-pulse" />
              <span className="text-corps-400 text-xs">기획서 완성</span>
            </div>
          )}
        </header>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`msg-enter flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-6 h-6 rounded-full bg-corps-500/20 border border-corps-500/30 flex items-center justify-center text-corps-400 text-[10px] font-bold mr-2.5 mt-0.5 shrink-0">
                  AI
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-corps-500/15 border border-corps-500/25 text-zinc-200 rounded-tr-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm'
              }`}>
                {/* 기획서 마커 숨기기 */}
                {msg.content.replace(/---BRIEF_START---[\s\S]*?---BRIEF_END---/, '기획서를 작성했어요! 오른쪽에서 확인하고 제출해주세요 ✦').trim()}
              </div>
            </div>
          ))}

          {/* 타이핑 인디케이터 */}
          {loading && (
            <div className="msg-enter flex justify-start">
              <div className="w-6 h-6 rounded-full bg-corps-500/20 border border-corps-500/30 flex items-center justify-center text-corps-400 text-[10px] font-bold mr-2.5 shrink-0">
                AI
              </div>
              <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                <span className="dot w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" />
                <span className="dot w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" />
                <span className="dot w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* 입력창 */}
        <div className="px-6 py-4 border-t border-zinc-900 shrink-0">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요... (Enter로 전송)"
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm placeholder-zinc-700 outline-none focus:border-zinc-600 transition-colors resize-none leading-relaxed"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                input.trim() && !loading
                  ? 'bg-corps-500 hover:bg-corps-600 text-zinc-950'
                  : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
              }`}
            >
              전송
            </button>
          </div>
          <p className="text-zinc-800 text-[10px] mt-2">Shift+Enter로 줄바꿈</p>
        </div>
      </main>

      {/* ── 기획서 프리뷰 패널 ── */}
      <aside className="w-72 border-l border-zinc-900 flex flex-col shrink-0">
        <div className="p-4 border-b border-zinc-900">
          <p className="text-xs font-medium text-zinc-300">기획서 프리뷰</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">대화가 완료되면 자동으로 생성됩니다</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {brief ? (
            <div className="space-y-0.5">
              {brief.split('\n').map((line, i) => renderBriefLine(line, i))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <p className="text-zinc-600 text-xs">아직 기획서가 없습니다</p>
              <p className="text-zinc-700 text-[11px] mt-1">AI와 대화를 완료하면<br/>여기에 기획서가 나타나요</p>
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        {brief && (
          <div className="p-4 border-t border-zinc-900 space-y-2">
            {pushed ? (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                <p className="text-emerald-400 text-xs font-medium">✓ 사령관에게 전달 완료</p>
                {pushedUrl && (
                  <a href={pushedUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors mt-1 block">
                    GitHub에서 보기 →
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={handlePush}
                disabled={pushing}
                className="w-full py-3 rounded-xl bg-corps-500 hover:bg-corps-600 text-zinc-950 font-semibold text-sm transition-all disabled:opacity-50"
              >
                {pushing ? '저장 중...' : '📤 사령관에게 제출하기'}
              </button>
            )}
          </div>
        )}
      </aside>

    </div>
  )
}

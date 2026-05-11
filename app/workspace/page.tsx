'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'model'
  content: string
}

const BRIEF_REGEX  = /---BRIEF_START---([\s\S]*?)---BRIEF_END---/
const CONFIG_REGEX = /---CONFIG_START---([\s\S]*?)---CONFIG_END---/

const COMMANDS = [
  { cmd: '/set',    desc: 'tomob-seed 브리프 템플릿 로드',      icon: '⚙️' },
  { cmd: '/start',  desc: '새 기획서 세션 시작',                icon: '✦' },
  { cmd: '/brief',  desc: '지금 대화로 기획서 즉시 생성',       icon: '📄' },
  { cmd: '/submit', desc: 'GitHub에 기획서 제출',               icon: '📤' },
  { cmd: '/help',   desc: '명령어 목록 보기',                   icon: '?' },
]

export default function WorkspacePage() {
  const router = useRouter()
  const [member, setMember]               = useState('')
  const [apiKey, setApiKey]               = useState('')
  const [messages, setMessages]           = useState<Message[]>([])
  const [input, setInput]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [brief, setBrief]                 = useState<string | null>(null)
  const [config, setConfig]               = useState<string | null>(null)
  const [pushing, setPushing]             = useState(false)
  const [pushed, setPushed]               = useState(false)
  const [pushedUrl, setPushedUrl]         = useState('')
  const [systemContext, setSystemContext] = useState<string | null>(null)
  const [templateLoaded, setTemplateLoaded] = useState(false)
  const [showPalette, setShowPalette]     = useState(false)
  const [paletteIdx, setPaletteIdx]       = useState(0)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const m = localStorage.getItem('sc_member')
    const k = localStorage.getItem('sc_api_key')
    if (!m || !k) { router.push('/'); return }
    setMember(m)
    setApiKey(k)
    setMessages([{
      role: 'model',
      content: `안녕하세요 ${m}님! Survey Corps 기획서 봇입니다 ✦\n\n먼저 \`/set\`을 입력해서 브리프 템플릿을 로드해보세요.\n아니면 바로 아이디어를 말씀해주셔도 됩니다 😊`,
    }])
  }, [router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // 명령어 팔레트 필터
  const filteredCmds = input.startsWith('/')
    ? COMMANDS.filter(c => c.cmd.startsWith(input.split(' ')[0]))
    : []

  useEffect(() => {
    setShowPalette(filteredCmds.length > 0 && input.startsWith('/'))
    setPaletteIdx(0)
  }, [input])

  // 시스템 파일 fetch
  const fetchSystemFile = async (filename: string) => {
    const res = await fetch(`/api/system?file=${encodeURIComponent(filename)}`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data.content as string
  }

  // 명령어 처리
  const handleCommand = useCallback(async (cmd: string) => {
    setInput('')
    setShowPalette(false)

    switch (cmd.trim()) {

      case '/set': {
        setMessages(prev => [...prev, { role: 'user', content: '/set' }])
        setLoading(true)
        try {
          const tmpl = await fetchSystemFile('brief-template.md')
          setSystemContext(tmpl)
          setTemplateLoaded(true)
          setMessages(prev => [...prev, {
            role: 'model',
            content: `✅ **브리프 템플릿 로드 완료**\n\ntomob-seed 형식으로 기획서를 작성할 준비가 됐어요!\n\n이제 만들고 싶은 아이디어를 말씀해 주세요. 필요한 정보를 하나씩 여쭤볼게요 😊`,
          }])
        } catch {
          setMessages(prev => [...prev, { role: 'model', content: '⚠️ 템플릿 로드 실패. 잠시 후 다시 시도해주세요.' }])
        } finally {
          setLoading(false)
        }
        break
      }

      case '/start': {
        setBrief(null)
        setConfig(null)
        setPushed(false)
        setPushedUrl('')
        setMessages([{
          role: 'model',
          content: `새 기획서를 시작할게요, ${member}님! ✦\n${templateLoaded ? '브리프 템플릿이 로드된 상태입니다.' : '`/set`으로 템플릿을 먼저 로드하면 tomob-seed 형식으로 작성됩니다.'}\n\n어떤 아이디어를 기획해볼까요?`,
        }])
        break
      }

      case '/brief': {
        if (messages.filter(m => m.role === 'user').length === 0) {
          setMessages(prev => [...prev, { role: 'model', content: '⚠️ 먼저 아이디어에 대해 이야기해주세요!' }])
          return
        }
        setMessages(prev => [...prev, { role: 'user', content: '/brief' }])
        await sendToGemini([...messages, { role: 'user', content: '지금까지 대화한 내용을 바탕으로 기획서를 완성해줘. 템플릿 포맷 그대로 출력해.' }])
        break
      }

      case '/submit': {
        if (!brief) {
          setMessages(prev => [...prev, { role: 'model', content: '⚠️ 먼저 기획서를 완성해주세요. `/brief`를 사용하거나 AI와 대화를 완료하세요.' }])
          return
        }
        await handlePush()
        break
      }

      case '/help': {
        setMessages(prev => [...prev,
          { role: 'user', content: '/help' },
          { role: 'model', content: `**사용 가능한 명령어:**\n\n${COMMANDS.map(c => `\`${c.cmd}\` — ${c.desc}`).join('\n')}` },
        ])
        break
      }
    }
  }, [member, messages, brief, templateLoaded])

  // Gemini 호출
  const sendToGemini = useCallback(async (msgs: Message[]) => {
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgs.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
          apiKey,
          memberName: member,
          systemContext,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const replyText: string = data.text
      setMessages(prev => [...prev, { role: 'model', content: replyText }])

      const briefMatch  = BRIEF_REGEX.exec(replyText)
      const configMatch = CONFIG_REGEX.exec(replyText)
      if (briefMatch)  setBrief(briefMatch[1].trim())
      if (configMatch) setConfig(configMatch[1].trim())
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'model',
        content: `⚠️ 오류가 발생했어요: ${e instanceof Error ? e.message : '다시 시도해주세요.'}`
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [apiKey, member, systemContext])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    // 명령어 처리
    if (text.startsWith('/')) {
      const cmd = text.split(' ')[0]
      if (COMMANDS.some(c => c.cmd === cmd)) {
        await handleCommand(cmd)
        return
      }
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    await sendToGemini(newMessages)
  }, [input, messages, loading, handleCommand, sendToGemini])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPalette) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setPaletteIdx(i => Math.min(i+1, filteredCmds.length-1)); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setPaletteIdx(i => Math.max(i-1, 0)); return }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault()
        handleCommand(filteredCmds[paletteIdx]?.cmd)
        return
      }
      if (e.key === 'Escape') { setShowPalette(false); return }
    }
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
        body: JSON.stringify({ memberName: member, briefContent: brief, configContent: config }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPushed(true)
      setPushedUrl(data.briefUrl || '')
      setMessages(prev => [...prev, {
        role: 'model',
        content: `✅ **제출 완료!**\n\n기획서가 사령관에게 전달됐어요.\n\`members/${member}/\` 폴더에 \`_brief.md\`${config ? ' + `_config.json`' : ''} 저장됨.`,
      }])
    } catch (e) {
      alert(`저장 실패: ${e instanceof Error ? e.message : '다시 시도해주세요.'}`)
    } finally {
      setPushing(false)
    }
  }

  const renderMsgContent = (content: string) => {
    // 마커 블록 숨기기, 완성 안내로 교체
    let display = content
      .replace(/---BRIEF_START---[\s\S]*?---BRIEF_END---/, '')
      .replace(/---CONFIG_START---[\s\S]*?---CONFIG_END---/, '')
      .trim()
    if (!display && (BRIEF_REGEX.test(content) || CONFIG_REGEX.test(content))) {
      display = '기획서를 작성했어요! 오른쪽에서 확인하고 제출해주세요 ✦'
    }
    // 마크다운 bold
    return display.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.+?)\*\*/g)
      return (
        <span key={i} className="block">
          {parts.map((p, j) =>
            j % 2 === 1
              ? <strong key={j} className="text-zinc-200 font-semibold">{p}</strong>
              : p.replace(/`([^`]+)`/g, (_, c) => c) // 인라인 코드 간단 처리
          )}
        </span>
      )
    })
  }

  const renderBriefLine = (line: string, i: number) => {
    if (line.startsWith('# '))  return <h2 key={i} className="text-corps-400 font-bold text-sm mb-2">{line.slice(2)}</h2>
    if (line.startsWith('## ')) return <h3 key={i} className="text-zinc-400 font-semibold text-[10px] tracking-widest uppercase mt-4 mb-1.5 pt-3 border-t border-zinc-800">{line.slice(3)}</h3>
    if (line.startsWith('- '))  return <li key={i} className="text-zinc-500 text-xs ml-3 list-disc">{line.slice(2)}</li>
    if (line.startsWith('|'))   return <p key={i} className="text-zinc-600 text-[10px] font-mono">{line}</p>
    if (line.trim() === '')     return <div key={i} className="h-1" />
    const parts = line.split(/\*\*(.+?)\*\*/g)
    return (
      <p key={i} className="text-zinc-500 text-xs">
        {parts.map((p, j) => j % 2 === 1 ? <span key={j} className="text-zinc-300 font-medium">{p}</span> : p)}
      </p>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden">

      {/* ── 사이드바 ── */}
      <aside className="w-52 border-r border-zinc-900 flex flex-col shrink-0">
        <div className="p-4 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
              <path d="M14 8v12M4 8l10 6 10-6" stroke="#f59e0b" strokeWidth="1.5"/>
            </svg>
            <span className="text-zinc-200 font-semibold text-sm">Survey Corps</span>
          </div>
        </div>

        <div className="p-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-corps-500/20 border border-corps-500/30 flex items-center justify-center text-corps-400 text-[10px] font-bold">
              {member[0]}
            </div>
            <div>
              <p className="text-zinc-200 text-xs font-medium">{member}</p>
              <p className="text-zinc-600 text-[10px]">조사병단 멤버</p>
            </div>
          </div>
        </div>

        {/* 상태 */}
        <div className="p-3 space-y-2">
          <div className={`px-2.5 py-2 rounded-lg text-[11px] flex items-center gap-1.5 ${templateLoaded ? 'bg-corps-500/10 border border-corps-500/20 text-corps-400' : 'bg-zinc-900 border border-zinc-800 text-zinc-600'}`}>
            <span>{templateLoaded ? '✓' : '○'}</span>
            <span>{templateLoaded ? '템플릿 로드됨' : '/set 미실행'}</span>
          </div>
          {brief && (
            <div className="px-2.5 py-2 rounded-lg text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
              <span>✓</span><span>기획서 완성</span>
            </div>
          )}
        </div>

        {/* 명령어 목록 */}
        <div className="px-3 py-2 flex-1">
          <p className="text-[10px] text-zinc-700 tracking-widest uppercase mb-2">명령어</p>
          <div className="space-y-1">
            {COMMANDS.map(c => (
              <button
                key={c.cmd}
                onClick={() => handleCommand(c.cmd)}
                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-zinc-900 group transition-colors"
              >
                <span className="text-[11px] font-mono text-zinc-500 group-hover:text-corps-400 transition-colors">{c.cmd}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-zinc-900">
          <button onClick={() => { localStorage.clear(); router.push('/') }} className="text-[11px] text-zinc-700 hover:text-zinc-500 transition-colors">
            로그아웃
          </button>
        </div>
      </aside>

      {/* ── 채팅 패널 ── */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-5 py-3.5 border-b border-zinc-900 flex items-center justify-between shrink-0">
          <div>
            <p className="text-zinc-200 font-medium text-sm">기획서 작성</p>
            <p className="text-zinc-600 text-xs mt-0.5">/set → 대화 → /submit</p>
          </div>
          {templateLoaded && (
            <span className="text-[10px] text-corps-400 bg-corps-500/10 border border-corps-500/20 px-2 py-1 rounded-full">
              tomob-seed 모드
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`msg-enter flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-5 h-5 rounded-full bg-corps-500/20 border border-corps-500/30 flex items-center justify-center text-corps-400 text-[9px] font-bold mr-2 mt-0.5 shrink-0">AI</div>
              )}
              <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-corps-500/15 border border-corps-500/25 text-zinc-200 rounded-tr-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm'
              }`}>
                {renderMsgContent(msg.content)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg-enter flex justify-start">
              <div className="w-5 h-5 rounded-full bg-corps-500/20 border border-corps-500/30 flex items-center justify-center text-corps-400 text-[9px] font-bold mr-2 shrink-0">AI</div>
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
        <div className="px-5 py-4 border-t border-zinc-900 shrink-0 relative">
          {/* 명령어 팔레트 */}
          {showPalette && filteredCmds.length > 0 && (
            <div className="absolute bottom-full left-5 right-5 mb-2 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
              {filteredCmds.map((c, i) => (
                <button
                  key={c.cmd}
                  onClick={() => handleCommand(c.cmd)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === paletteIdx ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
                >
                  <span className="text-sm">{c.icon}</span>
                  <span className="font-mono text-xs text-corps-400 w-16 shrink-0">{c.cmd}</span>
                  <span className="text-xs text-zinc-500">{c.desc}</span>
                </button>
              ))}
              <div className="px-4 py-1.5 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-700">Tab / Enter 선택 · Esc 닫기</span>
              </div>
            </div>
          )}

          <div className="flex gap-2.5 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지 입력 또는 / 로 명령어..."
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm placeholder-zinc-700 outline-none focus:border-zinc-600 transition-colors resize-none leading-relaxed"
              style={{ maxHeight: '100px', overflowY: 'auto' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all shrink-0 ${
                input.trim() && !loading
                  ? 'bg-corps-500 hover:bg-corps-600 text-zinc-950'
                  : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
              }`}
            >
              전송
            </button>
          </div>
        </div>
      </main>

      {/* ── 기획서 프리뷰 ── */}
      <aside className="w-68 border-l border-zinc-900 flex flex-col shrink-0" style={{width:'272px'}}>
        <div className="p-4 border-b border-zinc-900">
          <p className="text-xs font-medium text-zinc-300">기획서 프리뷰</p>
          {config && <p className="text-[10px] text-emerald-500 mt-0.5">_config.json 포함</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {brief ? (
            <div className="space-y-0.5">
              {brief.split('\n').map((line, i) => renderBriefLine(line, i))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <p className="text-zinc-700 text-xs">기획서 대기 중</p>
              <p className="text-zinc-800 text-[10px] mt-1">/set 후 대화 완료시<br/>자동 생성</p>
            </div>
          )}
        </div>

        {brief && (
          <div className="p-3 border-t border-zinc-900 space-y-2">
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
                className="w-full py-2.5 rounded-xl bg-corps-500 hover:bg-corps-600 text-zinc-950 font-semibold text-sm transition-all disabled:opacity-50"
              >
                {pushing ? '저장 중...' : '📤 제출하기'}
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}

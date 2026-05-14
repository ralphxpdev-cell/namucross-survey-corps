/**
 * Survey Corps × Pi 연동 스크립트
 *
 * 사용법:
 *   node sync.mjs load [멤버이름]   세션 시작 전 — 최신 기획서 받아서 _context.md 생성
 *   node sync.mjs save [멤버이름]   세션 종료 후 — Pi 세션 로그 대시보드에 저장
 *
 * 환경변수:
 *   SC_URL   웹앱 URL (기본값: https://brief-maker.vercel.app)
 */

import fs from 'fs'
import path from 'path'
import os from 'os'

const [,, cmd, member] = process.argv
const SC_URL = (process.env.SC_URL || 'https://brief-maker.vercel.app').replace(/\/$/, '')

if (!cmd || !member) {
  console.error('사용법: node sync.mjs [load|save] [멤버이름]')
  process.exit(1)
}

// ── load: 최신 기획서 → _context.md ──────────────────────────────────────
if (cmd === 'load') {
  console.log(`📡 ${member}님의 최신 기획서 불러오는 중...`)

  const res = await fetch(`${SC_URL}/api/sessions/${encodeURIComponent(member)}`)
  if (!res.ok) {
    console.log('ℹ️ 서버 응답 오류. Pi를 컨텍스트 없이 시작합니다.')
    process.exit(0)
  }

  const data = await res.json()

  if (!data.context) {
    console.log('ℹ️ 제출된 기획서 없음. Pi를 새로 시작합니다.')
    process.exit(0)
  }

  const contextContent = [
    '# Survey Corps 기획서 컨텍스트',
    `멤버: ${member} | 폴더: ${data.folder}`,
    '',
    '> 이 파일은 Survey Corps 웹앱에서 자동으로 불러온 기획서입니다.',
    '> 작업 시 이 기획서 내용을 기반으로 진행해주세요.',
    '',
    '---',
    '',
    data.context,
  ].join('\n')

  fs.writeFileSync('_context.md', contextContent, 'utf-8')
  console.log(`✅ 기획서 로드 완료 → _context.md (${data.folder})`)
  console.log('Pi 시작 후 "기획서 내용 확인해줘"라고 입력하세요.\n')
}

// ── save: Pi 세션 → 대시보드 저장 ────────────────────────────────────────
else if (cmd === 'save') {
  const sessionsDir = path.join(os.homedir(), '.pi', 'agent', 'sessions')

  if (!fs.existsSync(sessionsDir)) {
    console.error('❌ Pi 세션 폴더를 찾을 수 없습니다:', sessionsDir)
    console.error('   Pi를 한 번 실행한 후 다시 시도해주세요.')
    process.exit(1)
  }

  // 현재 디렉토리 기반으로 최신 세션 파일 탐색
  const allFiles = fs.readdirSync(sessionsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const fullPath = path.join(sessionsDir, f)
      return { name: f, path: fullPath, mtime: fs.statSync(fullPath).mtimeMs }
    })
    .sort((a, b) => b.mtime - a.mtime)

  if (!allFiles.length) {
    console.error('❌ 저장된 Pi 세션이 없습니다.')
    process.exit(1)
  }

  const sessionFile = allFiles[0]
  const raw = JSON.parse(fs.readFileSync(sessionFile.path, 'utf-8'))

  // Pi 세션 포맷에서 메시지 추출 (Pi 버전에 따라 구조가 다를 수 있음)
  const messages = (
    raw.messages ||
    raw.turns ||
    raw.history ||
    []
  ).map((m: any) => ({
    role: m.role || (m.type === 'assistant' ? 'assistant' : 'user'),
    content: typeof m.content === 'string'
      ? m.content
      : m.content?.map((c: any) => c.text || '').join('') || '',
  })).filter((m: any) => m.content)

  if (!messages.length) {
    console.log('ℹ️ 저장할 대화 내용이 없습니다.')
    process.exit(0)
  }

  console.log(`📤 세션 저장 중... (${messages.length}개 메시지)`)

  const res = await fetch(`${SC_URL}/api/sessions/${encodeURIComponent(member)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  if (res.ok) {
    const data = await res.json()
    console.log(`✅ 저장 완료! → ${data.path}`)
    console.log(`   대시보드에서 확인: ${SC_URL}/dashboard`)
  } else {
    const err = await res.json().catch(() => ({}))
    console.error('❌ 저장 실패:', err.error || res.statusText)
    process.exit(1)
  }
}

else {
  console.error('명령어는 load 또는 save 만 가능합니다.')
  process.exit(1)
}

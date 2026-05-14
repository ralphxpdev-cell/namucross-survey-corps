/**
 * Survey Corps × Pi 연동 스크립트
 *
 * 처음 한 번만:
 *   node sync.mjs setup [멤버이름]   내 이름 저장 (이후 자동 인식)
 *
 * 매 세션:
 *   node sync.mjs load              시작 전 — 최신 기획서 받아서 _context.md 생성
 *   node sync.mjs save              종료 후 — Pi 세션 대시보드에 저장
 */

import fs from 'fs'
import path from 'path'
import os from 'os'

const SC_URL    = 'https://brief-maker.vercel.app'
const CONFIG_PATH = path.join(os.homedir(), '.sc-config.json')

const [,, cmd, arg] = process.argv

// ── 저장된 멤버 이름 읽기 ────────────────────────────────────────────────
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return null
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) } catch { return null }
}

function getMember() {
  const cfg = loadConfig()
  if (!cfg?.member) {
    console.error('❌ 멤버 설정이 없습니다. 먼저 실행하세요:')
    console.error('   node sync.mjs setup [내 이름]')
    process.exit(1)
  }
  return cfg.member
}

// ── setup: 이름 저장 ─────────────────────────────────────────────────────
if (cmd === 'setup') {
  if (!arg) {
    console.error('사용법: node sync.mjs setup [이름]')
    process.exit(1)
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ member: arg }, null, 2), 'utf-8')
  console.log(`✅ 설정 완료! 이제부터 ${arg}님으로 자동 인식됩니다.`)
  console.log(`   저장 위치: ${CONFIG_PATH}`)
}

// ── load: 최신 기획서 → _context.md ─────────────────────────────────────
else if (cmd === 'load') {
  const member = getMember()
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

  const content = [
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

  fs.writeFileSync('_context.md', content, 'utf-8')
  console.log(`✅ 기획서 로드 완료 (${data.folder})`)
  console.log('Pi 시작 후 "기획서 내용 확인해줘"라고 입력하세요.\n')
}

// ── save: Pi 세션 → 대시보드 ─────────────────────────────────────────────
else if (cmd === 'save') {
  const member = getMember()
  const sessionsDir = path.join(os.homedir(), '.pi', 'agent', 'sessions')

  if (!fs.existsSync(sessionsDir)) {
    console.error('❌ Pi 세션 폴더를 찾을 수 없습니다:', sessionsDir)
    console.error('   Pi를 한 번 실행한 후 다시 시도해주세요.')
    process.exit(1)
  }

  const allFiles = fs.readdirSync(sessionsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const p = path.join(sessionsDir, f)
      return { path: p, mtime: fs.statSync(p).mtimeMs }
    })
    .sort((a, b) => b.mtime - a.mtime)

  if (!allFiles.length) {
    console.error('❌ 저장된 Pi 세션이 없습니다.')
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(allFiles[0].path, 'utf-8'))
  const messages = (raw.messages || raw.turns || raw.history || [])
    .map((m) => ({
      role: m.role || (m.type === 'assistant' ? 'assistant' : 'user'),
      content: typeof m.content === 'string'
        ? m.content
        : (m.content || []).map((c) => c.text || '').join(''),
    }))
    .filter((m) => m.content)

  if (!messages.length) {
    console.log('ℹ️ 저장할 대화 내용이 없습니다.')
    process.exit(0)
  }

  console.log(`📤 ${member}님의 세션 저장 중... (${messages.length}개 메시지)`)

  const res = await fetch(`${SC_URL}/api/sessions/${encodeURIComponent(member)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  if (res.ok) {
    const data = await res.json()
    console.log(`✅ 저장 완료!`)
    console.log(`   대시보드: ${SC_URL}/dashboard`)
    console.log(`   파일: ${data.path}`)
  } else {
    const err = await res.json().catch(() => ({}))
    console.error('❌ 저장 실패:', err.error || res.statusText)
    process.exit(1)
  }
}

else {
  console.log('사용법:')
  console.log('  node sync.mjs setup [이름]   처음 한 번만 — 내 이름 저장')
  console.log('  node sync.mjs load           세션 시작 전 — 기획서 로드')
  console.log('  node sync.mjs save           세션 종료 후 — 세션 저장')
}

import { NextRequest, NextResponse } from 'next/server'

const SB_URL = 'https://qitxwciaphfftuisyjrg.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdHh3Y2lhcGhmZnR1aXN5anJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjMwMTcsImV4cCI6MjA4OTEzOTAxN30.dkgdVwG_8W1CzKQhFe5REr-5n27sBzsMvxDxwzeCni0'
const SC_URL = 'https://brief-maker.vercel.app'

// GET /api/launcher-script/[member] → .mjs 스크립트 (bat에서 호출)
export async function GET(
  _req: NextRequest,
  { params }: { params: { member: string } }
) {
  const member = decodeURIComponent(params.member)

  const script = `import { execSync, spawn } from 'child_process'
import { existsSync, writeFileSync, mkdirSync, readdirSync, statSync, readFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const MEMBER = '${member}'
const SC_URL  = '${SC_URL}'
const SB_URL  = '${SB_URL}'
const SB_KEY  = '${SB_KEY}'

// 1. API 키 조회
console.log('🔑 API 키 확인 중...')
const keyRes  = await fetch(
  \`\${SB_URL}/rest/v1/sc_members?name=eq.\${encodeURIComponent(MEMBER)}&select=api_key\`,
  { headers: { apikey: SB_KEY, Authorization: \`Bearer \${SB_KEY}\` } }
)
const keyData = await keyRes.json()
const apiKey  = keyData[0]?.api_key
if (!apiKey) {
  console.error('❌ API 키 없음. ' + SC_URL + ' 에서 먼저 설정하세요.')
  process.exit(1)
}

// 2. Pi 설치 확인 (처음 한 번만)
let piOk = false
try { execSync('pi --version', { stdio: 'ignore' }); piOk = true } catch {}
if (!piOk) {
  console.log('📦 Pi 설치 중... (처음 한 번만 실행됩니다)')
  execSync('npm install -g @earendil-works/pi-coding-agent', { stdio: 'inherit' })
}

// 3. 워크스페이스 준비
const workDir = join(homedir(), 'survey-corps', MEMBER)
mkdirSync(workDir, { recursive: true })
process.chdir(workDir)
console.log(\`📁 \${workDir}\`)

// 4. 브리프 로드 → AGENTS.md
console.log('📡 최신 브리프 로드 중...')
try {
  const ctxRes = await fetch(\`\${SC_URL}/api/sessions/\${encodeURIComponent(MEMBER)}\`)
  const ctx    = await ctxRes.json()
  if (ctx.context) {
    writeFileSync('AGENTS.md', [
      '# Survey Corps 브리프',
      \`멤버: \${MEMBER} | 폴더: \${ctx.folder}\`,
      '',
      ctx.context,
    ].join('\\n'), 'utf-8')
    console.log(\`✅ 브리프 로드 완료 (\${ctx.folder})\`)
  } else {
    console.log('ℹ️  브리프 없음. 새 세션으로 시작합니다.')
  }
} catch {
  console.log('ℹ️  브리프 로드 실패. 계속 진행합니다.')
}

// 5. Pi 실행
console.log('\\n🚀 Pi 시작!\\n')
const pi = spawn('pi', [], {
  stdio: 'inherit',
  env: { ...process.env, GEMINI_API_KEY: apiKey },
})

// 6. 종료 시 세션 자동 저장
pi.on('exit', async () => {
  console.log('\\n💾 세션 저장 중...')
  try {
    const sessDir = join(homedir(), '.pi', 'agent', 'sessions')
    if (!existsSync(sessDir)) { console.log('ℹ️  세션 없음'); return }

    const allFiles = readdirSync(sessDir, { recursive: true })
      .map(f => join(sessDir, String(f)))
      .filter(f => f.endsWith('.json'))
      .filter(f => { try { return !statSync(f).isDirectory() } catch { return false } })
      .map(f => ({ path: f, mtime: statSync(f).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)

    if (!allFiles.length) { console.log('ℹ️  세션 파일 없음'); return }

    const raw      = JSON.parse(readFileSync(allFiles[0].path, 'utf-8'))
    const messages = (raw.messages || raw.turns || raw.history || [])
      .map(m => ({
        role: m.role || (m.type === 'assistant' ? 'assistant' : 'user'),
        content: typeof m.content === 'string'
          ? m.content
          : (m.content || []).map(c => c.text || '').join(''),
      }))
      .filter(m => m.content)

    if (!messages.length) { console.log('ℹ️  저장할 내용 없음'); return }

    const saveRes = await fetch(
      \`\${SC_URL}/api/sessions/\${encodeURIComponent(MEMBER)}\`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      }
    )
    console.log(saveRes.ok
      ? \`✅ 세션 저장 완료! 대시보드: \${SC_URL}/dashboard\`
      : \`⚠️  저장 실패 (\${saveRes.status})\`
    )
  } catch (e) {
    console.log('⚠️  저장 오류:', e.message)
  }
})
`

  return new NextResponse(script, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

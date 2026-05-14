export default function GuidePage() {
  return (
    <div className="min-h-screen px-6 py-16 max-w-2xl mx-auto">

      {/* 헤더 */}
      <div className="mb-12">
        <a href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-6 block">← 돌아가기</a>
        <div className="flex items-center gap-2.5 mb-3">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
            <path d="M14 8v12M4 8l10 6 10-6" stroke="#f59e0b" strokeWidth="1.5"/>
          </svg>
          <span className="text-zinc-100 font-semibold text-lg">Survey Corps 사용 가이드</span>
        </div>
        <p className="text-zinc-500 text-sm">기획서 작성부터 실제 프로덕트 빌딩까지</p>
      </div>

      <div className="space-y-10">

        {/* 전체 흐름 */}
        <section>
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">전체 흐름</h2>
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
            <div className="space-y-2 text-sm text-zinc-400 font-mono">
              <div className="flex items-center gap-3">
                <span className="text-corps-400 w-5 text-center">1</span>
                <span>이 페이지에서 API 키 등록</span>
              </div>
              <div className="flex items-center gap-3 pl-8 text-zinc-600 text-xs">↓</div>
              <div className="flex items-center gap-3">
                <span className="text-corps-400 w-5 text-center">2</span>
                <span>터미널에서 <code className="text-corps-400">scpi</code> 실행</span>
              </div>
              <div className="flex items-center gap-3 pl-8 text-zinc-600 text-xs">↓</div>
              <div className="flex items-center gap-3">
                <span className="text-corps-400 w-5 text-center">3</span>
                <span>멤버 선택 → 모델 선택 → Pi 시작</span>
              </div>
              <div className="flex items-center gap-3 pl-8 text-zinc-600 text-xs">↓</div>
              <div className="flex items-center gap-3">
                <span className="text-corps-400 w-5 text-center">4</span>
                <span>브리프 자동 로드 → 기획 or 코딩</span>
              </div>
              <div className="flex items-center gap-3 pl-8 text-zinc-600 text-xs">↓</div>
              <div className="flex items-center gap-3">
                <span className="text-corps-400 w-5 text-center">5</span>
                <span>종료 시 세션 자동 저장 → 다음에 이어서</span>
              </div>
            </div>
          </div>
        </section>

        {/* 설치 */}
        <section>
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">설치</h2>
          <div className="space-y-3">
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
              <p className="text-xs text-zinc-600">Node.js v18 이상 필요 — <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-corps-400 hover:underline">nodejs.org</a></p>
              <div>
                <p className="text-xs text-zinc-600 mb-1.5">처음 한 번만 설치</p>
                <code className="block text-sm text-zinc-300 bg-zinc-950 px-4 py-3 rounded-lg">
                  npm install -g github:ralphxpdev-cell/sc-launcher
                </code>
              </div>
              <div>
                <p className="text-xs text-zinc-600 mb-1.5">업데이트도 같은 명령어</p>
                <code className="block text-sm text-zinc-300 bg-zinc-950 px-4 py-3 rounded-lg">
                  npm install -g github:ralphxpdev-cell/sc-launcher
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* API 키 */}
        <section>
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">API 키 발급</h2>
          <p className="text-xs text-zinc-600 mb-4">하나만 있어도 시작할 수 있습니다. Gemini 또는 Groq 추천.</p>

          <div className="space-y-3">

            {/* Gemini */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-200">Gemini 2.5 Flash</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">무료</span>
                </div>
                <span className="text-xs text-zinc-600 font-mono">AIzaSy...</span>
              </div>
              <div className="px-4 py-3 space-y-2 text-xs text-zinc-500">
                <p>빠르고 무료. 일반 코딩, 기획서 작성, 긴 파일 분석에 적합.</p>
                <ol className="space-y-1 list-decimal list-inside text-zinc-600">
                  <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-corps-400 hover:underline">aistudio.google.com/app/apikey</a> 접속</li>
                  <li>Google 계정 로그인</li>
                  <li>&quot;API 키 만들기&quot; 클릭</li>
                  <li><code className="text-zinc-400">AIzaSy...</code> 로 시작하는 키 복사</li>
                </ol>
              </div>
            </div>

            {/* Groq */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-200">LLaMA 3.3 (Groq)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">무료</span>
                </div>
                <span className="text-xs text-zinc-600 font-mono">gsk_...</span>
              </div>
              <div className="px-4 py-3 space-y-2 text-xs text-zinc-500">
                <p>Groq 전용 칩 덕분에 응답 속도가 가장 빠름. 대화형 작업, 빠른 초안에 적합.</p>
                <ol className="space-y-1 list-decimal list-inside text-zinc-600">
                  <li><a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-corps-400 hover:underline">console.groq.com/keys</a> 접속</li>
                  <li>Google 로그인으로 회원가입</li>
                  <li>API Keys → &quot;Create API Key&quot;</li>
                  <li><code className="text-zinc-400">gsk_...</code> 로 시작하는 키 복사</li>
                </ol>
              </div>
            </div>

            {/* Claude */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-200">Claude Sonnet (Anthropic)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-400 border border-zinc-700">유료</span>
                </div>
                <span className="text-xs text-zinc-600 font-mono">sk-ant-...</span>
              </div>
              <div className="px-4 py-3 space-y-2 text-xs text-zinc-500">
                <p>코드 작성 품질 최상. 복잡한 리팩토링, 버그 수정, 정밀한 지시 수행에 적합.</p>
                <ol className="space-y-1 list-decimal list-inside text-zinc-600">
                  <li><a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-corps-400 hover:underline">console.anthropic.com/settings/keys</a> 접속</li>
                  <li>회원가입 후 결제 수단 등록 (최소 $5)</li>
                  <li>Settings → API Keys → &quot;Create Key&quot;</li>
                  <li><code className="text-zinc-400">sk-ant-...</code> 로 시작하는 키 복사</li>
                </ol>
              </div>
            </div>

            {/* OpenAI */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-200">GPT-4o (OpenAI)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-400 border border-zinc-700">유료</span>
                </div>
                <span className="text-xs text-zinc-600 font-mono">sk-...</span>
              </div>
              <div className="px-4 py-3 space-y-2 text-xs text-zinc-500">
                <p>범용. 이미지 이해, 함수 호출, OpenAI 생태계 연동이 필요할 때.</p>
                <ol className="space-y-1 list-decimal list-inside text-zinc-600">
                  <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-corps-400 hover:underline">platform.openai.com/api-keys</a> 접속</li>
                  <li>회원가입 후 결제 수단 등록</li>
                  <li>&quot;Create new secret key&quot;</li>
                  <li><code className="text-zinc-400">sk-...</code> 로 시작하는 키 복사 (한 번만 표시됨)</li>
                </ol>
              </div>
            </div>

            {/* Ollama */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-200">Ollama (로컬)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">완전 무료</span>
                </div>
                <span className="text-xs text-zinc-600">키 불필요</span>
              </div>
              <div className="px-4 py-3 space-y-2 text-xs text-zinc-500">
                <p>내 PC에서 직접 실행. 인터넷 없이 동작, 민감한 코드에 적합. GPU 있으면 빠름.</p>
                <div className="space-y-1.5 text-zinc-600">
                  <p>1. <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-corps-400 hover:underline">ollama.ai</a> 에서 설치</p>
                  <code className="block bg-zinc-950 px-3 py-2 rounded-lg text-zinc-400 mt-1">
                    ollama pull llama3.2<br/>
                    ollama serve
                  </code>
                  <p className="mt-1">2. 별도 터미널에서 서버 켜둔 채로 scpi 실행</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 실행 */}
        <section>
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">scpi 실행</h2>
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-4">
            <div>
              <code className="text-xl text-corps-400 font-bold tracking-wide">scpi</code>
            </div>
            <div className="text-xs text-zinc-600 space-y-1.5">
              <p>처음 실행 시 멤버 선택 → 다음부터는 저장된 멤버로 바로 시작.</p>
              <p>모델이 여러 개 있으면 선택 화면이 뜸. 번호 입력하면 다음부터 자동 선택.</p>
            </div>
            <div className="border-t border-zinc-800 pt-3">
              <p className="text-xs text-zinc-600 mb-1.5">멤버·모델 초기화</p>
              <code className="block text-sm text-zinc-400 bg-zinc-950 px-3 py-2 rounded-lg">scpi --reset</code>
            </div>
          </div>
        </section>

        {/* 활용 */}
        <section>
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Pi로 할 수 있는 것</h2>

          <div className="space-y-3">

            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800">
                <span className="text-sm font-medium text-zinc-200">기획서 작성</span>
              </div>
              <div className="px-4 py-3 text-xs text-zinc-500 space-y-2">
                <p>scpi 실행 시 최신 브리프가 자동으로 로드됩니다. Pi가 프로젝트 맥락을 이미 알고 있습니다.</p>
                <div className="bg-zinc-950 rounded-lg p-3 space-y-1 font-mono text-zinc-400">
                  <p>&gt; 브리프 읽고 핵심 기능 목록 만들어줘</p>
                  <p>&gt; 경쟁사 분석 초안 작성해줘</p>
                  <p>&gt; 사용자 시나리오 3개 작성해줘</p>
                  <p>&gt; 이 아이디어의 리스크 분석해줘</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800">
                <span className="text-sm font-medium text-zinc-200">프로덕트 빌딩</span>
              </div>
              <div className="px-4 py-3 text-xs text-zinc-500 space-y-2">
                <p>Pi는 파일을 직접 읽고, 쓰고, 터미널 명령어도 실행합니다. 실제 코드 작업이 가능합니다.</p>
                <div className="bg-zinc-950 rounded-lg p-3 space-y-1 font-mono text-zinc-400">
                  <p>&gt; Next.js + Supabase 앱 초기 세팅해줘</p>
                  <p>&gt; 로그인 페이지 만들어줘</p>
                  <p>&gt; 이 컴포넌트에 로딩 상태 추가해줘</p>
                  <p>&gt; TypeScript 오류 전부 수정해줘</p>
                  <p>&gt; 모바일 반응형으로 바꿔줘</p>
                </div>
                <p className="text-zinc-600">작업 파일은 <code className="text-zinc-500">~/survey-corps/[이름]/</code> 폴더에 저장됩니다.</p>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800">
                <span className="text-sm font-medium text-zinc-200">기존 프로젝트 이어하기</span>
              </div>
              <div className="px-4 py-3 text-xs text-zinc-500 space-y-2">
                <div className="bg-zinc-950 rounded-lg p-3 space-y-1 font-mono text-zinc-400">
                  <p>&gt; 이 코드베이스 구조 설명해줘</p>
                  <p>&gt; [파일명] 읽고 검색 기능 추가해줘</p>
                  <p>&gt; 버그 찾아서 수정해줘</p>
                  <p>&gt; 테스트 코드 작성해줘</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 세션 저장 */}
        <section>
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">세션 저장 & 이어하기</h2>
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-xs text-zinc-500 space-y-3">
            <p>Pi를 종료하면 대화 내용이 자동으로 저장됩니다.</p>
            <div className="bg-zinc-950 rounded-lg p-3 font-mono text-zinc-400 space-y-1">
              <p className="text-zinc-600"># /exit 또는 Ctrl+C로 종료 시</p>
              <p>💾 세션 저장 중...</p>
              <p>✅ 저장 완료!</p>
            </div>
            <p>다음에 <code className="text-zinc-400">scpi</code> 실행하면 저장된 맥락이 자동 로드됩니다.</p>
          </div>
        </section>

        {/* 모델 비교 */}
        <section>
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">모델 추천</h2>
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-2.5 text-left text-zinc-600 font-normal">모델</th>
                  <th className="px-4 py-2.5 text-left text-zinc-600 font-normal">추천 상황</th>
                  <th className="px-4 py-2.5 text-left text-zinc-600 font-normal">비용</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                <tr>
                  <td className="px-4 py-2.5 text-zinc-300">Gemini</td>
                  <td className="px-4 py-2.5 text-zinc-500">일반 코딩, 기획서, 긴 파일</td>
                  <td className="px-4 py-2.5 text-emerald-400">무료</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-zinc-300">Groq</td>
                  <td className="px-4 py-2.5 text-zinc-500">빠른 반복, 짧은 작업</td>
                  <td className="px-4 py-2.5 text-emerald-400">무료</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-zinc-300">Claude</td>
                  <td className="px-4 py-2.5 text-zinc-500">복잡한 코딩, 리팩토링</td>
                  <td className="px-4 py-2.5 text-zinc-500">유료</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-zinc-300">GPT-4o</td>
                  <td className="px-4 py-2.5 text-zinc-500">이미지 포함 작업, 범용</td>
                  <td className="px-4 py-2.5 text-zinc-500">유료</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-zinc-300">Ollama</td>
                  <td className="px-4 py-2.5 text-zinc-500">오프라인, 민감한 코드</td>
                  <td className="px-4 py-2.5 text-emerald-400">완전 무료</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 하단 링크 */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <a href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">← 계정 설정</a>
          <a href="/dashboard" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">사령관 대시보드 →</a>
        </div>

      </div>
    </div>
  )
}

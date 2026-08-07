/**
 * Vibe Coding AI Agent 雙語學習平台核心引擎
 * - 智慧全域視聽同步語音導覽 (Smart Auto-Scroll Voice Tour)
 * - 全點字即讀 (Click-to-Speak Anything)
 * - 全介面 100% 雙語切換
 */

let currentLang = 'zh';
let currentModule = 'm1';
let speechSynth = window.speechSynthesis;
let currentUtterance = null;
let isSpeaking = false;
let isTourActive = false;
let availableVoices = [];
let activeSpeakingElement = null;

let isProgrammaticScrolling = false;
let userScrollTimeout = null;
let currentTourSectionIndex = 0;

const tourSections = ['summary', 'modules', 'lab', 'resources', 'tracker'];

function initSpeechVoices() {
  if (!speechSynth) return;
  availableVoices = speechSynth.getVoices();
  if (speechSynth.onvoiceschanged !== undefined) {
    speechSynth.onvoiceschanged = () => {
      availableVoices = speechSynth.getVoices();
    };
  }
}

let trackerData = JSON.parse(localStorage.getItem('vibe_agent_tracker_v3')) || {
  totalTime: 0,
  moduleTimes: { m1:0, m2:0, m3:0, m4:0, lab:0 },
  totalClicks: 0,
  moduleClicks: { m1:0, m2:0, m3:0, m4:0, lab:0 },
  modulesCompleted: [],
  quizScores: { m1:0, m2:0, m3:0, m4:0 },
  cardsRead: { m1:0, m2:0, m3:0, m4:0 },
  labRuns: 0
};

// 友善版權宣告 Toast
(function initFriendlyProtection() {
  const showToast = () => {
    let toast = document.getElementById('friendly-cp-toast');
    if (toast) toast.remove();
    toast = document.createElement('div');
    toast.id = 'friendly-cp-toast';
    toast.textContent = 'Intellectual Property of Architect: Prof. Shihmin Lo, NCNU';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#0f2942;color:#e0f2fe;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:700;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.25);transition:opacity 0.3s;opacity:0;';
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = '1');
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  document.addEventListener('contextmenu', (e) => {
    let sel = '';
    try { sel = window.getSelection().toString().trim(); } catch (err) {}
    if (sel.length > 0) return true;
    e.preventDefault();
    showToast();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.key.toLowerCase() === 'u')) {
      e.preventDefault();
      showToast();
    }
  });
})();

const i18n = {
  zh: {
    siteTitle: 'Vibe Coding AI Agent 雙語學習平台',
    navSummary: '執行摘要', navModules: '核心模組', navLab: '互動實驗室', navResources: '系統藍圖', navTracker: '學習歷程',
    heroPill: 'AI Agent 現代導航哲學',
    heroTitle: '告別「寫行行語法」，邁向「意圖與架構導航」的 Vibe Coding 時代',
    heroDesc: '專為程式零基礎的商管學生設計。將 AI Agent 視為【馬車到汽車】的典範轉移，學會運用三大角色（管家、教練、工程師團隊）與四大工程要素，輕鬆掌控自動化系統開發與維護。',
    btnStartLearn: '開始學習課程', btnListenSummary: '🔊 朗讀全站總導覽',
    btnListenModule: '🔊 朗讀本單元內容', btnListenLab: '🔊 朗讀實驗室指南', btnListenTracker: '🔊 朗讀歷程統計',
    modSectionTitle: '核心主題學習模組', modSectionSubtitle: '點擊切換各模組，包含關鍵字摘要、說明、翻轉記憶卡與測驗。點擊畫面上任何文字即可朗讀！',
    tabM1: '模組一：典範轉移比喻', tabM2: '模組二：四大工程要素', tabM3: '模組三：AI 三重角色', tabM4: '模組四：晨報 Agent 實戰',
    cardsHeader: '觀念翻轉記憶卡 (點擊卡片翻面)',
    quizHeader: '隨堂觀念測驗', btnRetry: '重新測驗 (Retry)',
    labTitle: '互動實驗室：無程式碼主題晨報模擬器', labSubtitle: '體驗如何「修改 KB 檔案」即可改變 AI Agent 抓取與整理新聞的行為。',
    labConfigHeader: '設定檔：KB/theme_config.md', labTopicLabel: '選擇或輸入您今日關注的新聞主題：',
    presetTopic1: '半導體 + 實習', presetTopic2: 'ESG 永續', presetTopic3: 'AI 行銷競賽',
    placeholderTheme: '在此自訂當日主題...',
    labHarnessGuard: '開啟 Harness 防禦網 (Input Sanitization 與資安遮蔽)', labCopyrightDef: '開啟著作權防衛 (衍生摘要與強制附原文連結)',
    btnRunSim: '啟動 Agent 運算流程 (ReAct Loop)', labOutputHeader: 'Agent 執行日誌與晨報交付物',
    simPlaceholder: '點擊「啟動 Agent」觀察自動化運算流程...',
    resTitle: '系統藍圖與外部資源', resSubtitle: '檢閱高解析度系統工程藍圖 (Blueprint SVG) 與教學手冊文件。',
    trackTitle: '學習歷程記錄與成果匯出', trackSubtitle: '記錄您完成的學習時間、點擊數、記憶卡與測驗分數。',
    trackModulesRead: '模組完成進度', trackQuizTotal: '測驗總得分', trackLabRuns: '實驗室模擬次數',
    thSection: '單元/分區 (Section)', thTime: '累積學習時間 (Time)', thClicks: '點擊互動次數 (Clicks)', thScore: '測驗得分 (Quiz Score)',
    lblTotal: '總計 (Total)', lblM1: '模組一 (M1)', lblM2: '模組二 (M2)', lblM3: '模組三 (M3)', lblM4: '模組四 (M4)', lblLab: '實驗室 (Lab)',
    btnExportJSON: '匯出學習報告 (JSON)', btnPrintPDF: '列印 / 儲存 PDF', btnResetTrack: '重置歷程', btnBackTop: '回到頁首'
  },
  en: {
    siteTitle: 'Vibe Coding AI Agent Learning Platform',
    navSummary: 'Summary', navModules: 'Modules', navLab: 'Lab', navResources: 'Blueprint', navTracker: 'Tracker',
    heroPill: 'Modern Navigation Philosophy',
    heroTitle: 'Shift to Intent & Architecture Navigation (Vibe Coding)',
    heroDesc: 'Designed for business students with zero coding background. View AI Agents as a shift from carriages to automobiles. Master 3 roles and 4 pillars for sustainable automation.',
    btnStartLearn: 'Start Learning', btnListenSummary: '🔊 Read Full Course Tour',
    btnListenModule: '🔊 Read This Module', btnListenLab: '🔊 Read Lab Guide', btnListenTracker: '🔊 Read Progress Report',
    modSectionTitle: 'Core Learning Modules', modSectionSubtitle: 'Explore keywords, detailed explanations, flashcards, and quizzes. Click any text to hear it read aloud!',
    tabM1: 'Module 1: Metaphor Shift', tabM2: 'Module 2: 4 Pillars', tabM3: 'Module 3: 3 AI Roles', tabM4: 'Module 4: Morning Digest Agent',
    cardsHeader: 'Concept Flashcards (Click to flip)',
    quizHeader: 'Knowledge Assessment', btnRetry: 'Retry Quiz',
    labTitle: 'Interactive Lab: No-Code Theme Digest Simulator', labSubtitle: 'Experience how editing KB files changes AI Agent behavior without code.',
    labConfigHeader: 'Config File: KB/theme_config.md', labTopicLabel: 'Select or input your topic:',
    presetTopic1: 'Semiconductor + Internship', presetTopic2: 'ESG Sustainability', presetTopic3: 'AI Marketing Competition',
    placeholderTheme: 'Customize daily topic here...',
    labHarnessGuard: 'Enable Harness Guardrails (Input Sanitization)', labCopyrightDef: 'Enable Copyright Defense (Derived Summaries & Links)',
    btnRunSim: 'Run Agent ReAct Loop', labOutputHeader: 'Execution Logs & Deliverable',
    simPlaceholder: 'Click "Run Agent ReAct Loop" to watch execution...',
    resTitle: 'System Blueprint & Resources', resSubtitle: 'Inspect the architecture blueprint SVG and handbook docs.',
    trackTitle: 'Learning Progress Tracker', trackSubtitle: 'Track completed modules, flashcards reviewed, and quiz scores.',
    trackModulesRead: 'Modules Progress', trackQuizTotal: 'Quiz Total Score', trackLabRuns: 'Lab Simulations',
    thSection: 'Section', thTime: 'Total Time', thClicks: 'Interaction Clicks', thScore: 'Quiz Score',
    lblTotal: 'Total', lblM1: 'Module 1 (M1)', lblM2: 'Module 2 (M2)', lblM3: 'Module 3 (M3)', lblM4: 'Module 4 (M4)', lblLab: 'Lab',
    btnExportJSON: 'Export JSON Report', btnPrintPDF: 'Print PDF', btnResetTrack: 'Reset Tracker', btnBackTop: 'Top'
  }
};

const modulesData = {
  m1: {
    title: { zh: '模組一：典範轉移比喻 (Horse vs Car Metaphor)', en: 'Module 1: Metaphor Shift (Horse vs Car)' },
    keywords: ['ParadigmShift', 'HorseVsCar', 'IntentSteering', 'Governance'],
    summary: {
      zh: '將 AI Agent 比喻為汽車，傳統程式比喻為馬車。你不是在修馬鞍，而是在掌舵目的地。',
      en: 'AI Agent is your car, traditional code is a carriage. You steer destination instead of fixing horseshoes.'
    },
    description: {
      zh: '<p>在馬車時代，規則圍繞著馬匹的體力與習性。汽車誕生後，舊有規則被顛覆，誕生了高速公路與防範護欄。Vibe Coding 讓學生不再死記程式語法，而是擔任駕駛員與 PM，透過高層次意圖驅動系統。</p>',
      en: '<p>In the carriage era, rules revolved around horses. When cars arrived, roads and safety rules transformed. Vibe Coding shifts your focus to architecture and intent.</p>'
    },
    cards: [
      { front: { zh: '馬車時代 (Traditional Code)', en: 'Carriage Era (Traditional Code)' }, back: { zh: '手寫每行指令，邊寫邊修錯誤，維護成本高。', en: 'Writing lines of code manually, high maintenance cost.' } },
      { front: { zh: '汽車時代 (Vibe Coding)', en: 'Car Era (Vibe Coding)' }, back: { zh: '自然語言導航，專注於架構設計與品質驗收。', en: 'Natural language steering, focusing on architecture and QC.' } },
      { front: { zh: '駕駛執照 (AI Governance)', en: 'Driver License (AI Governance)' }, back: { zh: '控制權限與預算上限，避免 Agent 暴走衝出跑道。', en: 'Control permissions and budget caps to avoid Agent runaway.' } },
      { front: { zh: '儀表板 (Context Navigation)', en: 'Dashboard (Context Navigation)' }, back: { zh: '隨時掌握目前地圖、油量與周遭環境資訊。', en: 'Monitor real-time map, fuel, and environment status.' } }
    ],
    quizzes: [
      {
        q: { zh: '在汽車比喻中，「設定目的地與駕駛風格指示」對應到哪一個元素？', en: 'In the car metaphor, setting destination corresponds to which element?' },
        options: {
          zh: ['A. #Context (儀表板與地圖)', 'B. #Prompt (角色與意圖)', 'C. #Harness (煞車與防爆牆)', 'D. #Loop (引擎心跳)'],
          en: ['A. #Context (Dashboard)', 'B. #Prompt (Persona & Intent)', 'C. #Harness (Guardrails)', 'D. #Loop (Engine Heartbeat)']
        },
        ans: 1, exp: { zh: 'Prompt 負責定義角色風格與目的地意圖。', en: 'Prompt defines persona and destination intent.' }
      },
      {
        q: { zh: 'Vibe Coding 帶給商管學生的核心轉變是？', en: 'What is the key transformation Vibe Coding brings to business students?' },
        options: {
          zh: ['A. 變得更會手寫行行 C++ 語法', 'B. 轉變為產品經理與駕駛員，透過高層次 Intent 驅動 AI', 'C. 完全不需要了解商業邏輯', 'D. 只需使用傳統試算表'],
          en: ['A. Writing C++ syntax manually', 'B. Becoming PM/Driver driving AI via high-level Intent', 'C. Ignoring business logic', 'D. Using spreadsheets only']
        },
        ans: 1, exp: { zh: '商管學生應著重在產品規格、意圖與架構領導。', en: 'Focus on PM spec, intent, and architecture leadership.' }
      }
    ]
  },
  m2: {
    title: { zh: '模組二：Agentic 四大工程要素 (4 Engineering Pillars)', en: 'Module 2: 4 Agentic Engineering Pillars' },
    keywords: ['#Prompt', '#Context', '#Harness', '#Loop'],
    summary: {
      zh: '掌控 Prompt 導引意圖、Context 提供背景記憶、Harness 設立工具護欄、Loop 驅動心跳與自檢。',
      en: 'Prompt defines intent, Context provides memory, Harness sets guardrails, Loop drives heartbeat & self-QC.'
    },
    description: {
      zh: '<ul><li><strong>#Prompt:</strong> 定義 Persona 與交付格式。</li><li><strong>#Context:</strong> 管理 Working Memory 與 Long-term KB 知識庫。</li><li><strong>#Harness:</strong> 綁定 API 工具與資安防禦網。</li><li><strong>#Loop:</strong> Cron 排程 + Self-Correction QC 迴圈。</li></ul>',
      en: '<ul><li><strong>#Prompt:</strong> Defines Persona & Output Schema.</li><li><strong>#Context:</strong> Manages Memory & KB docs.</li><li><strong>#Harness:</strong> API binding & Security Guardrails.</li><li><strong>#Loop:</strong> Cron schedules & Self-Correction QC.</li></ul>'
    },
    cards: [
      { front: { zh: '#Prompt', en: '#Prompt' }, back: { zh: '方向盤：定義角色 Persona 與交付格式。', en: 'Steering Wheel: Defines Persona & Output Schema.' } },
      { front: { zh: '#Context', en: '#Context' }, back: { zh: '儀表板：提供動態時間、使用者偏好與 KB 文件。', en: 'Dashboard: Provides time, preferences, & KB docs.' } },
      { front: { zh: '#Harness', en: '#Harness' }, back: { zh: '煞車護欄：提供 API 工具並設定資安過濾網。', en: 'Brakes & Guardrails: Provides tools & security filters.' } },
      { front: { zh: '#Loop', en: '#Loop' }, back: { zh: '引擎心跳：定時觸發與品質自檢退回機制。', en: 'Engine Heartbeat: Scheduled triggers & QC checks.' } }
    ],
    quizzes: [
      {
        q: { zh: '當 Agent 抓取外部新聞時進行 Prompt Injection 過濾與資安防護，屬於哪項工程？', en: 'Filtering Prompt Injection when fetching news belongs to which pillar?' },
        options: {
          zh: ['A. #Prompt Engineering', 'B. #Context Engineering', 'C. #Harness Engineering (護欄與工具)', 'D. #Loop Engineering'],
          en: ['A. #Prompt Engineering', 'B. #Context Engineering', 'C. #Harness Engineering (Guardrails)', 'D. #Loop Engineering']
        },
        ans: 2, exp: { zh: 'Harness 工程負責建立邊界護欄與資安過濾。', en: 'Harness handles boundary guardrails and security sanitization.' }
      },
      {
        q: { zh: '每日 07:00 排程定時發送晨報，屬於哪一項工程？', en: 'Scheduled 07:00 daily digest triggering belongs to which pillar?' },
        options: {
          zh: ['A. #Prompt', 'B. #Context', 'C. #Harness', 'D. #Loop Engineering (心跳與排程)'],
          en: ['A. #Prompt', 'B. #Context', 'C. #Harness', 'D. #Loop Engineering (Heartbeat & Schedule)']
        },
        ans: 3, exp: { zh: 'Loop 負責心跳觸發與 ReAct 循環運算。', en: 'Loop handles heartbeat triggers and execution cycles.' }
      }
    ]
  },
  m3: {
    title: { zh: '模組三：AI 協作三重角色模型 (3 Collaborative Roles)', en: 'Module 3: 3 Collaborative AI Roles' },
    keywords: ['Butler(管家)', 'Coach(教練)', 'Engineer Subagents'],
    summary: {
      zh: '管家負責基建與 KB 檔案、教練解說觀念與給予心理鼓勵、工程師 Subagents 分工實作。',
      en: 'Butler handles workspace & KB docs, Coach explains concepts, Engineer Subagents implement & test.'
    },
    description: {
      zh: '<p><strong>管家 (Butler):</strong> 建立專案目錄、寫 .gitignore、維護 KB/ 文件。</p><p><strong>教練 (Coach):</strong> 說明 Context Window、資安與版權觀念，並鼓勵學生。</p><p><strong>工程師團隊 (Subagents):</strong> Data Fetcher, AI Summarizer, QA & DevOps 平行分工。</p>',
      en: '<p><strong>Butler:</strong> Sets up workspace & maintains KB docs.</p><p><strong>Coach:</strong> Explains Context Window & Security with encouragement.</p><p><strong>Engineer Subagents:</strong> Parallel subagents for fetching, summarizing, QA, and DevOps.</p>'
    },
    cards: [
      { front: { zh: '管家 Butler', en: 'Butler' }, back: { zh: '負責基礎建設、Git 託管與專案目錄結構。', en: 'Handles infrastructure, Git, and directory structure.' } },
      { front: { zh: '教練 Coach', en: 'Coach' }, back: { zh: '觀念輔導、解說資安風險與給予情緒支持。', en: 'Offers conceptual guidance, security tips, and support.' } },
      { front: { zh: '工程師 Subagents', en: 'Engineer Subagents' }, back: { zh: '多 Agent 團隊分工：爬蟲、摘要、QA 測試與部署。', en: 'Multi-agent teamwork: Fetching, summarizing, QA, DevOps.' } }
    ],
    quizzes: [
      {
        q: { zh: '幫你維護 `.gitignore` 並將共識寫成 `KB/theme_config.md` 的是哪位角色？', en: 'Which role helps maintain `.gitignore` and writes consensus into `KB/theme_config.md`?' },
        options: {
          zh: ['A. 管家 Butler', 'B. 教練 Coach', 'C. DevOps Subagent', 'D. 汽車駕駛'],
          en: ['A. Butler', 'B. Coach', 'C. DevOps Subagent', 'D. Car Driver']
        },
        ans: 0, exp: { zh: '管家負責基建與檔案結構維護。', en: 'Butler handles workspace infrastructure & KB files.' }
      },
      {
        q: { zh: '當你在學習中感到困惑時，為你解說資安與 Prompt Injection 觀念並給予鼓勵的是？', en: 'Who explains security concepts with encouragement when you feel confused?' },
        options: {
          zh: ['A. 爬蟲 Subagent', 'B. 教練 Coach', 'C. 專案經理', 'D. 測試員'],
          en: ['A. Fetcher Subagent', 'B. Coach', 'C. Project Manager', 'D. QA Tester']
        },
        ans: 1, exp: { zh: '教練 Coach 提供專業導引與學習信心支持。', en: 'Coach offers guidance and emotional support.' }
      }
    ]
  },
  m4: {
    title: { zh: '模組四：晨報 Agent 實戰與無程式碼維護 (Morning Digest Agent)', en: 'Module 4: Morning Digest Agent' },
    keywords: ['NoCodeMaintenance', 'IPOFlow', 'CopyrightDefense'],
    summary: {
      zh: '打造每日 07:00 排程晨報：達成「修改 KB 即無程式碼換主題」、衍生摘要與附連結防侵權。',
      en: 'Building a 07:00 scheduled digest agent: Achieve no-code theme editing by updating KB files.'
    },
    description: {
      zh: '<p><strong>I-P-O 流程：</strong>Input 讀取 KB 主題 ➔ Process 併發呼叫 Weather/Calendar/RSS ➔ Output 自檢合格後由 LINE 送達手機。</p>',
      en: '<p><strong>I-P-O Workflow:</strong> Input reads KB theme ➔ Process fetches APIs ➔ Output delivers via LINE after QC pass.</p>'
    },
    cards: [
      { front: { zh: '無程式碼維護', en: 'No-Code Maintenance' }, back: { zh: '只需修改 KB 文字檔，即可隨時改變新聞關注焦點。', en: 'Edit KB text files to change news topic without code.' } },
      { front: { zh: '著作權防衛 (Copyright Defense)', en: 'Copyright Defense' }, back: { zh: '不複製全文，強制衍生摘要與原網址連結。', en: 'Derived summaries with mandatory source links.' } },
      { front: { zh: 'ReAct 運算 Loop', en: 'ReAct Execution Loop' }, back: { zh: '思考 ➔ 呼叫 Tool ➔ 觀察結果 ➔ 修正輸出。', en: 'Think ➔ Call Tool ➔ Observe ➔ Refine Output.' } },
      { front: { zh: 'Self-Correction QC', en: 'Self-Correction QC' }, back: { zh: '格式與字數未通過自檢，自動退回重新修訂（上限3次）。', en: 'Auto-retry if format/length fails QC check (max 3).' } }
    ],
    quizzes: [
      {
        q: { zh: '當學生想改關注「ESG 永續」主題時，最可維護的做法是？', en: 'When students want to focus on "ESG Sustainability", what is the most maintainable approach?' },
        options: {
          zh: ['A. 重新編寫爬蟲程式', 'B. 打開 `KB/theme_config.md` 直接修改文字', 'C. 刪除專案資料夾', 'D. 重設密碼'],
          en: ['A. Rewrite crawler code', 'B. Edit `KB/theme_config.md` directly', 'C. Delete project directory', 'D. Reset password']
        },
        ans: 1, exp: { zh: '無程式碼修改 `.md` 是高可維護性的核心展現。', en: 'Updating `.md` without code represents maintainable architecture.' }
      },
      {
        q: { zh: '晨報 Agent 為了避免違反著作權條款，採取了什麼保護做法？', en: 'To avoid copyright issues, what protection does Morning Digest Agent use?' },
        options: {
          zh: ['A. 複製整篇新聞全文', 'B. 禁止抓取任何新聞', 'C. 只輸出衍生摘要並強制標註原文出處網址', 'D. 隱藏新聞標題'],
          en: ['A. Copy full news text', 'B. Ban fetching news', 'C. Output derived summaries with mandatory source links', 'D. Hide news title']
        },
        ans: 2, exp: { zh: '衍生摘要 + 出處網址是著作權合規的最佳做人道理。', en: 'Derived summaries with citation links respect copyright.' }
      }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initSpeechVoices();
  lucide.createIcons();
  updateUIStrings();
  renderModule(currentModule);
  updateTrackerUI();
  setupEventListeners();
  initClickToSpeak();
  initUserScrollInterceptor(); // 監聽使用者手動滾動以跳接語音導覽

  setInterval(() => {
    trackerData.totalTime += 1;
    if (trackerData.moduleTimes[currentModule] !== undefined) {
      trackerData.moduleTimes[currentModule] += 1;
    }
    saveTrackerData();
    updateTrackerUI();
  }, 1000);
});

// 全點字即讀
function initClickToSpeak() {
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('button, input, textarea, select, a, .flip-card, .brand')) return;
    
    const targetTextEl = e.target.closest('p, h1, h2, h3, h4, li, td, th, .quiz-feedback, .sim-steps, .t-val, .t-lbl, .kw-badge');
    if (targetTextEl && targetTextEl.innerText.trim().length > 0) {
      stopGlobalTour();
      speakTextWithElement(targetTextEl.innerText.trim(), targetTextEl);
    }
  });
}

// 手動滾動攔截器：若語音導覽啟用中，滑鼠手動滾動畫面自動跳接至當前分頁！
function initUserScrollInterceptor() {
  window.addEventListener('scroll', () => {
    if (isProgrammaticScrolling) return; // 自動平滑滾動中忽略

    if (isTourActive) {
      clearTimeout(userScrollTimeout);
      userScrollTimeout = setTimeout(() => {
        const visibleIdx = getCurrentVisibleSectionIndex();
        if (visibleIdx !== -1 && visibleIdx !== currentTourSectionIndex) {
          currentTourSectionIndex = visibleIdx;
          speakSectionTour(currentTourSectionIndex);
        }
      }, 250);
    }
  });
}

function getCurrentVisibleSectionIndex() {
  const windowCenter = window.innerHeight / 2;
  for (let i = 0; i < tourSections.length; i++) {
    const el = document.getElementById(tourSections[i]);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= windowCenter && rect.bottom >= windowCenter) {
        return i;
      }
    }
  }
  return 0;
}

function updateUIStrings() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[currentLang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = i18n[currentLang][key];
      } else {
        el.textContent = i18n[currentLang][key];
      }
    }
  });
  document.getElementById('langLabel').textContent = currentLang === 'zh' ? 'EN / 繁中' : '繁中 / EN';
}

function renderModule(modId) {
  currentModule = modId;
  const mod = modulesData[modId];
  const container = document.getElementById('moduleDisplay');

  if (!trackerData.modulesCompleted.includes(modId)) {
    trackerData.modulesCompleted.push(modId);
    saveTrackerData();
  }

  const keywordsHTML = mod.keywords.map(kw => `<span class="kw-badge">#${kw}</span>`).join('');
  
  const cardsHTML = mod.cards.map((c, idx) => `
    <div class="flip-card" onclick="handleFlipCard(this, '${modId}', ${idx})">
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <h4>${c.front[currentLang]}</h4>
          <p style="font-size: 11px; color: #64748b; margin-top: 6px;">(${currentLang === 'zh' ? '點擊翻面' : 'Click to flip'})</p>
        </div>
        <div class="flip-card-back">
          <p>${c.back[currentLang]}</p>
        </div>
      </div>
    </div>
  `).join('');

  const quizzesHTML = mod.quizzes.map((qObj, qIdx) => `
    <div class="quiz-item" style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-light);">
      <p style="font-size: 13.5px; font-weight: 600; color: var(--color-text-main);">${qIdx + 1}. ${qObj.q[currentLang]}</p>
      <div class="quiz-options">
        ${qObj.options[currentLang].map((opt, optIdx) => `
          <button class="quiz-opt-btn" onclick="checkQuizAnswer(this, '${modId}', ${qIdx}, ${optIdx}, ${qObj.ans})">${opt}</button>
        `).join('')}
      </div>
      <div class="quiz-feedback" style="margin-top: 6px; font-size: 12.5px; font-weight: 700;"></div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="module-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h3 style="font-size: 19px; font-weight: 800; color: var(--color-text-main);">${mod.title[currentLang]}</h3>
        <button onclick="speakText('${mod.title[currentLang]}. ${mod.summary[currentLang]}')" class="btn btn-secondary btn-sm" style="font-size: 12px; padding: 4px 10px;">${i18n[currentLang].btnListenModule}</button>
      </div>
      <div class="mod-keywords">${keywordsHTML}</div>
      <p style="font-size: 14px; font-weight: 600; color: var(--color-primary-dark); margin-bottom: 10px;">${mod.summary[currentLang]}</p>
      <div style="font-size: 13.5px; color: var(--color-text-muted); line-height: 1.7;">${mod.description[currentLang]}</div>

      <h4 style="font-size: 14.5px; font-weight: 800; margin-top: 20px; color: var(--color-text-main);">${i18n[currentLang].cardsHeader} (${mod.cards.length})</h4>
      <div class="flip-cards-grid">${cardsHTML}</div>

      <div class="quiz-box">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="font-size: 14.5px; font-weight: 800; color: var(--color-text-main);">${i18n[currentLang].quizHeader} (${mod.quizzes.length})</h4>
          <button onclick="renderModule('${modId}')" class="btn btn-secondary btn-sm" style="font-size: 11.5px; padding: 3px 8px;">${i18n[currentLang].btnRetry}</button>
        </div>
        ${quizzesHTML}
      </div>
    </div>
  `;
}

window.handleFlipCard = function(cardEl, modId, cardIdx) {
  cardEl.classList.toggle('flipped');
  trackerData.totalClicks += 1;
  if (trackerData.moduleClicks[modId] !== undefined) trackerData.moduleClicks[modId] += 1;
  if (trackerData.cardsRead[modId] !== undefined) trackerData.cardsRead[modId] += 1;
  saveTrackerData();
  updateTrackerUI();

  if (cardEl.classList.contains('flipped')) {
    const cardText = modulesData[modId].cards[cardIdx].back[currentLang];
    speakText(cardText);
  }
};

window.checkQuizAnswer = function(btnEl, modId, qIdx, chosenIdx, correctIdx) {
  const parent = btnEl.closest('.quiz-options');
  const feedback = parent.nextElementSibling;
  const qObj = modulesData[modId].quizzes[qIdx];
  
  parent.querySelectorAll('.quiz-opt-btn').forEach(btn => { btn.disabled = true; });
  trackerData.totalClicks += 1;

  if (chosenIdx === correctIdx) {
    btnEl.classList.add('correct');
    feedback.innerHTML = `<span style="color:#15803d;">✓ ${currentLang === 'zh' ? '正確答案！+25分' : 'Correct! +25 pts'}</span> <br><span style="color:#475569; font-weight:400;">💡 ${qObj.exp[currentLang]}</span>`;
    if (trackerData.quizScores[currentModule] !== undefined) {
      trackerData.quizScores[currentModule] += 25;
    }
  } else {
    btnEl.classList.add('wrong');
    const correctOptText = qObj.options[currentLang][correctIdx];
    feedback.innerHTML = `<span style="color:#b91c1c;">✗ ${currentLang === 'zh' ? '解答不正確！' : 'Incorrect!'}</span> <br><span style="color:#0369a1; font-weight:700;">${currentLang === 'zh' ? '正確解答為' : 'Correct answer is'}: ${correctOptText}</span><br><span style="color:#475569; font-weight:400;">💡 ${qObj.exp[currentLang]}</span>`;
  }
  saveTrackerData();
  updateTrackerUI();
  speakText(feedback.innerText);
};

function setupEventListeners() {
  const brandLogo = document.getElementById('brandLogo');
  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      stopGlobalTour();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.getElementById('btnGlobalSpeechToggle').addEventListener('click', toggleGlobalSpeechTour);

  document.getElementById('langToggleBtn').addEventListener('click', () => {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    updateUIStrings();
    renderModule(currentModule);
    updateTrackerUI();
    if (isTourActive) speakSectionTour(currentTourSectionIndex);
  });

  document.getElementById('moduleTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.mod-tab');
    if (btn) {
      document.querySelectorAll('.mod-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      renderModule(btn.getAttribute('data-mod'));
    }
  });

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      document.getElementById('labCustomTheme').value = e.target.getAttribute('data-topic');
    });
  });

  document.getElementById('btnRunAgentSim').addEventListener('click', runAgentSimulator);
  document.getElementById('btnListenSummary').addEventListener('click', () => {
    currentTourSectionIndex = 0;
    startGlobalTour();
  });
  document.getElementById('btnListenLab').addEventListener('click', () => {
    currentTourSectionIndex = 2;
    startGlobalTour();
  });
  document.getElementById('btnListenTracker').addEventListener('click', () => {
    currentTourSectionIndex = 4;
    startGlobalTour();
  });

  document.getElementById('btnExportProgress').addEventListener('click', exportProgressJSON);
  document.getElementById('btnPrintReport').addEventListener('click', () => window.print());
  document.getElementById('btnResetTrack').addEventListener('click', resetTracker);
  document.getElementById('btnBackTop').addEventListener('click', () => {
    stopGlobalTour();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ================= 智慧全域視聽同步導覽的核心 Logic ================= */

function toggleGlobalSpeechTour() {
  if (isTourActive) {
    stopGlobalTour();
  } else {
    currentTourSectionIndex = getCurrentVisibleSectionIndex();
    startGlobalTour();
  }
}

function startGlobalTour() {
  isTourActive = true;
  updateAudioToggleButtonState(true);
  speakSectionTour(currentTourSectionIndex);
}

function stopGlobalTour() {
  isTourActive = false;
  stopSpeech();
  updateAudioToggleButtonState(false);
}

function updateAudioToggleButtonState(playing) {
  const btn = document.getElementById('btnGlobalSpeechToggle');
  const icon = document.getElementById('audioToggleIcon');
  if (playing) {
    btn.classList.add('playing');
    icon.setAttribute('data-lucide', 'pause');
  } else {
    btn.classList.remove('playing');
    icon.setAttribute('data-lucide', 'play');
  }
  lucide.createIcons();
}

function speakSectionTour(sectionIdx) {
  if (!isTourActive) return;

  const secId = tourSections[sectionIdx];
  const targetEl = document.getElementById(secId);

  if (targetEl) {
    isProgrammaticScrolling = true;
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { isProgrammaticScrolling = false; }, 800);
  }

  let textToRead = '';
  const currentMod = modulesData[currentModule];

  switch (secId) {
    case 'summary':
      textToRead = currentLang === 'zh'
        ? `執行摘要。告別寫行行語法，邁向意圖與架構導航的 Vibe Coding 時代。將 AI Agent 視為從馬車到汽車的典範轉移，運用三大角色與四大工程要素。`
        : `Executive Summary. Shift to Intent and Architecture Navigation in Vibe Coding. View AI Agent as a shift from carriage to car.`;
      break;

    case 'modules':
      textToRead = currentLang === 'zh'
        ? `核心主題學習模組。當前為 ${currentMod.title.zh}。${currentMod.summary.zh}`
        : `Core Learning Modules. Currently viewing ${currentMod.title.en}. ${currentMod.summary.en}`;
      break;

    case 'lab':
      textToRead = currentLang === 'zh'
        ? `互動實驗室：無程式碼主題晨報模擬器。體驗修改設定檔文字即可改變 AI Agent 抓取與整理新聞的行為。`
        : `Interactive Lab: No-Code Theme Digest Simulator. Experience modifying config files to change AI Agent behaviors.`;
      break;

    case 'resources':
      textToRead = currentLang === 'zh'
        ? `系統藍圖與外部資源。檢閱高解析度系統工程藍圖。`
        : `System Blueprint & Resources. Inspect the high resolution architecture blueprint.`;
      break;

    case 'tracker':
      const totalScore = Object.values(trackerData.quizScores).reduce((a, b) => a + b, 0);
      textToRead = currentLang === 'zh'
        ? `學習歷程記錄與成果。您已完成 ${trackerData.modulesCompleted.length} 個模組，測驗得分為 ${totalScore} 分。`
        : `Learning Progress Tracker. You have completed ${trackerData.modulesCompleted.length} modules, with a quiz score of ${totalScore} points.`;
      break;
  }

  speakTextWithElement(textToRead, targetEl, () => {
    // 朗讀完畢後過渡到下一區塊
    if (isTourActive) {
      if (sectionIdx + 1 < tourSections.length) {
        currentTourSectionIndex = sectionIdx + 1;
        speakSectionTour(currentTourSectionIndex);
      } else {
        // 到達頁尾：平滑滾動回頁頂並完成導覽
        window.scrollTo({ top: 0, behavior: 'smooth' });
        stopGlobalTour();
      }
    }
  });
}

function runAgentSimulator() {
  const topic = document.getElementById('labCustomTheme').value.trim() || (currentLang === 'zh' ? '半導體產業趨勢 + 實習職缺' : 'Semiconductor Trends + Internships');
  const hasHarness = document.getElementById('chkHarnessGuard').checked;
  const hasCopyright = document.getElementById('chkCopyrightDef').checked;

  const logEl = document.getElementById('simStepsLog');
  const resultBox = document.getElementById('simFinalResult');
  const digestOut = document.getElementById('simDigestOutput');

  logEl.innerHTML = '';
  resultBox.classList.add('hidden');

  trackerData.labRuns += 1;
  if (trackerData.moduleClicks.lab !== undefined) trackerData.moduleClicks.lab += 1;
  saveTrackerData();
  updateTrackerUI();

  const steps = [
    `[07:00:00 Cron] ⏰ Engine Heartbeat Triggered...`,
    `[07:00:01 #Context] 📖 Reading KB/theme_config.md Topic: 『${topic}』`,
    `[07:00:02 #Harness] 🌐 Launching Subagents for API calls...`,
    hasHarness ? `[07:00:03 Guardrails] 🛡️ Harness Security Filter PASSED.` : `[07:00:03 Warning] ⚠️ Filter Disabled.`,
    `[07:00:04 #Process] 🤖 Generating Business Insights...`,
    `[07:00:05 #Loop QC] 🔍 Self-Correction QC PASSED...`,
    `[07:00:06 Delivery] 📱 Digest Pushed to LINE!`
  ];

  let stepIdx = 0;
  const timer = setInterval(() => {
    if (stepIdx < steps.length) {
      logEl.innerHTML += `<div>${steps[stepIdx]}</div>`;
      logEl.scrollTop = logEl.scrollHeight;
      stepIdx++;
    } else {
      clearInterval(timer);
      resultBox.classList.remove('hidden');
      digestOut.innerHTML = `
        <div style="font-size: 12.5px; line-height: 1.6; color: #1e293b;">
          <h4 style="font-size: 14px; color: #0284c7; margin-bottom: 4px;">🌅 ${currentLang === 'zh' ? '每日晨報' : 'Daily Morning Digest'}</h4>
          <p><strong>☀️ ${currentLang === 'zh' ? '【今日氣象】' : '【Weather】'}</strong> Taipei 26°C ~ 32°C, Rain 40%.</p>
          <p><strong>🗓️ ${currentLang === 'zh' ? '【行程】' : '【Schedule】'}</strong> 14:00 Status Meeting (Confirmed)</p>
          <p><strong>📰 ${currentLang === 'zh' ? '【焦點新聞】' : '【Focus News】'} : ${topic}</strong></p>
          <ul style="padding-left: 16px; margin: 4px 0;">
            <li>1. Semiconductor leader announces 2nm chip architecture.<br>💡 <em>Insight: Capital expenditure drives equipment suppliers.</em>
                ${hasCopyright ? `<br><a href="#" style="color:#0284c7;">[${currentLang === 'zh' ? '來源連結' : 'Source Link'}]</a>` : ''}
            </li>
          </ul>
        </div>
      `;
      speakText(digestOut.innerText);
    }
  }, 400);
}

function speakTextWithElement(text, domElement, callbackOnEnd) {
  if (activeSpeakingElement) {
    activeSpeakingElement.classList.remove('speaking-highlight');
  }
  if (domElement) {
    activeSpeakingElement = domElement;
    activeSpeakingElement.classList.add('speaking-highlight');
  }

  speakText(text, () => {
    if (activeSpeakingElement) {
      activeSpeakingElement.classList.remove('speaking-highlight');
      activeSpeakingElement = null;
    }
    if (typeof callbackOnEnd === 'function') callbackOnEnd();
  });
}

function speakText(text, callbackOnEnd) {
  if (!speechSynth) return;
  stopSpeech();
  speechSynth.resume();

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = currentLang === 'zh' ? 'zh-TW' : 'en-US';
  currentUtterance.rate = parseFloat(document.getElementById('speechSpeedSelect').value) || 1.0;

  if (availableVoices.length === 0) availableVoices = speechSynth.getVoices();
  if (availableVoices.length > 0) {
    if (currentLang === 'zh') {
      const zhVoice = availableVoices.find(v => v.lang === 'zh-TW' && (v.name.includes('Yating') || v.name.includes('雅婷'))) ||
                      availableVoices.find(v => v.lang === 'zh-TW') ||
                      availableVoices.find(v => v.lang.startsWith('zh'));
      if (zhVoice) currentUtterance.voice = zhVoice;
    } else {
      const enVoice = availableVoices.find(v => v.lang.startsWith('en') && (v.name.includes('British') || v.name.includes('Male') || v.name.includes('Daniel') || v.lang === 'en-GB')) ||
                      availableVoices.find(v => v.lang === 'en-US') ||
                      availableVoices.find(v => v.lang.startsWith('en'));
      if (enVoice) currentUtterance.voice = enVoice;
    }
  }

  currentUtterance.onstart = () => {
    isSpeaking = true;
  };

  currentUtterance.onend = () => {
    isSpeaking = false;
    if (activeSpeakingElement) {
      activeSpeakingElement.classList.remove('speaking-highlight');
      activeSpeakingElement = null;
    }
    if (typeof callbackOnEnd === 'function') callbackOnEnd();
  };

  speechSynth.speak(currentUtterance);
}

function stopSpeech() {
  if (speechSynth) {
    speechSynth.cancel();
    isSpeaking = false;
    if (activeSpeakingElement) {
      activeSpeakingElement.classList.remove('speaking-highlight');
      activeSpeakingElement = null;
    }
  }
}

function updateTrackerUI() {
  const totalScore = Object.values(trackerData.quizScores).reduce((a, b) => a + b, 0);
  
  document.getElementById('trackProgressVal').textContent = `${trackerData.modulesCompleted.length} / 4`;
  document.getElementById('trackQuizScoreVal').textContent = `${totalScore} pts`;
  document.getElementById('trackLabCountVal').textContent = `${trackerData.labRuns} 次`;

  const detailTable = document.getElementById('trackerDetailBody');
  if (detailTable) {
    detailTable.innerHTML = `
      <tr><td>${i18n[currentLang].lblTotal}</td><td>${trackerData.totalTime} sec</td><td>${trackerData.totalClicks}</td><td>${totalScore} pts</td></tr>
      <tr><td>${i18n[currentLang].lblM1}</td><td>${trackerData.moduleTimes.m1 || 0} sec</td><td>${trackerData.moduleClicks.m1 || 0}</td><td>${trackerData.quizScores.m1 || 0} pts</td></tr>
      <tr><td>${i18n[currentLang].lblM2}</td><td>${trackerData.moduleTimes.m2 || 0} sec</td><td>${trackerData.moduleClicks.m2 || 0}</td><td>${trackerData.quizScores.m2 || 0} pts</td></tr>
      <tr><td>${i18n[currentLang].lblM3}</td><td>${trackerData.moduleTimes.m3 || 0} sec</td><td>${trackerData.moduleClicks.m3 || 0}</td><td>${trackerData.quizScores.m3 || 0} pts</td></tr>
      <tr><td>${i18n[currentLang].lblM4}</td><td>${trackerData.moduleTimes.m4 || 0} sec</td><td>${trackerData.moduleClicks.m4 || 0}</td><td>${trackerData.quizScores.m4 || 0} pts</td></tr>
      <tr><td>${i18n[currentLang].lblLab}</td><td>${trackerData.moduleTimes.lab || 0} sec</td><td>${trackerData.moduleClicks.lab || 0}</td><td>-</td></tr>
    `;
  }
}

function saveTrackerData() {
  localStorage.setItem('vibe_agent_tracker_v3', JSON.stringify(trackerData));
}

function resetTracker() {
  if (confirm(currentLang === 'zh' ? '確定要重置所有歷程紀錄與測驗得分嗎？' : 'Reset all progress and quiz scores?')) {
    trackerData = {
      totalTime: 0, moduleTimes: { m1:0, m2:0, m3:0, m4:0, lab:0 },
      totalClicks: 0, moduleClicks: { m1:0, m2:0, m3:0, m4:0, lab:0 },
      modulesCompleted: [], quizScores: { m1:0, m2:0, m3:0, m4:0 },
      cardsRead: { m1:0, m2:0, m3:0, m4:0 }, labRuns: 0
    };
    saveTrackerData();
    updateTrackerUI();
  }
}

function exportProgressJSON() {
  const exportPayload = {
    studentReport: 'Vibe Coding AI Agent Learning Report',
    timestamp: new Date().toISOString(),
    tracker: trackerData
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `Vibe_Coding_Learning_Report_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

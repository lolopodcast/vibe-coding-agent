# Vibe Coding AI Agent 實戰避坑與錯誤修復知識庫 (Troubleshooting & Fixes KB)

本知識庫專門記錄《Vibe Coding AI Agent 雙語學習平台》在開發、雙語語音旁白合成、Playwright 自動化錄影、Whisper CUDA 字幕對齊與 FFmpeg GPU 影音合成過程中的**實戰工程經驗與關鍵 Bug 解決方案**。

---

## 一、 Playwright 全自動動畫錄影工程 (Web Automation)

### 1. DOM Element Detached 錯誤 (控制項失效)
- **問題現象**：在 Playwright 腳本中，先獲取了卡片物件控制項（如 `card0`），隨後執行切換語系（`zh` ➔ `en`）或重新渲染 DOM 後，再呼叫 `card0.click()` 導致報錯 `Element is not attached to the DOM`。
- **根因分析**：語系切換或動態渲染會銷毀原 DOM 節點並建立新節點，使先前的記憶體 ElementHandle 失效。
- **最佳實踐**：在每次畫面切換語系或標籤頁後，必須**動態重新執行 `page.query_selector()`** 獲取最新的 DOM 控制項。

### 2. 視聽時間對齊 (Timing Synchronization)
- **問題現象**：旁白已經講到單元三，但錄影畫面仍停留在單元一或滾動過慢。
- **根因分析**：採用粗粒度的固定 `sleep()` 累積誤差過大。
- **最佳實踐**：
  1. 使用 `ffprobe` 測量各分段音檔（`01_intro_en.mp3` ~ `10_tracker_zh.mp3`）的精確秒數。
  2. 在 Playwright 腳本中，以音檔秒數作為唯一的動作時間軸標準。

### 3. VP8 Variable Frame Rate (靜態幀變速縮短)
- **問題現象**：畫面錄影時長顯示僅 2 分多鐘，與 4 分 53 秒的廣播級總音訊無法匹配。
- **根因分析**：Chromium Playwright 錄製 WebM 時，當畫面無動作/靜止時會自動省略重複幀。
- **最佳實踐**：在 FFmpeg 合成指令中加入 `fps=25,tpad=stop_mode=clone:stop_duration=300` 濾鏡，將靜止幀平滑複製擴充至全場音訊時長。

---

## 二、 雙語 TTS 與 Whisper CUDA 字幕對齊工程

### 1. 雙語音訊混淆 (Multi-language Auto-Detection Trap)
- **問題現象**：Whisper 處理長音檔時，因前 30 秒自動偵測為 `English`，導致後半段繁體中文旁白被強制翻譯或輸出為英文字幕。
- **最佳實踐**：
  1. 將英文段（音檔 01~05）與中文段（音檔 06~10）拆開獨立處理。
  2. 英文段指定 `--language en` 生成 `subtitles_en.srt`；中文段指定 `--language zh` 生成 `subtitles_zh.srt`。
  3. 計算英文段精確時長，將中文字幕時間軸自動 offset (+149.62s) 後進行兩檔無縫拼接。

### 2. Windows Subprocess CLI Unicode 編碼崩潰 (CP950 Codec Error)
- **問題現象**：Whisper 執行時輸出中文文字至控制台，報錯 `UnicodeEncodeError: 'cp950' codec can't encode character...`。
- **根因分析**：Windows 預設 Cmd/PowerShell 主機編碼為 CP950/Big5，無法接收包含簡繁體的中文字元輸出。
- **最佳實踐**：在 Python `subprocess.run()` 呼叫中傳入 `env={"PYTHONIOENCODING": "utf-8"}` 強制統一為 UTF-8 輸出。

### 3. 台灣繁體中文標準校正 (OpenCC & Custom Glossary)
- **問題現象**：Whisper 辨識中文時可能輸出簡體字或同音異字（如「死計」、「城市碼」、「濟南」、「洛世明」）。
- **最佳實踐**：
  1. 使用 `OpenCC('s2twp')` 進行簡體轉台灣繁體詞彙轉換。
  2. 搭配專用專有名詞比對映射表修正（如 `國立暨南國際大學 駱世民教授`、`儀錶板`、`煞車護欄`、`逐行程式碼`）。

---

## 三、 FFmpeg GPU NVENC 壓製與檔案管理

### 1. Glob 字母排序陷阱 (舊 WebM 檔誤抓)
- **問題現象**：重新拍攝新畫面後，合成出來的 MP4 依然顯示舊畫面。
- **根因分析**：`glob.glob("*.webm")` 預設按檔案字母順序排序。當 Playwright 產生隨機 Hash 檔名時，舊檔名的字母可能排在後面。
- **最佳實踐**：使用 `max(webm_files, key=os.path.getmtime)`，根據**檔案實體修改時間**鎖定最新產出的畫面檔。

---

## 四、 劇院級視覺導引 (Kinetic Focus Overlay)

### 1. Headless 模式下高亮效果不符預期
- **問題現象**：僅套用 CSS `box-shadow` 在無頭瀏覽器錄影中不夠突顯。
- **最佳實踐**：
  1. 建立 `fixed` 蒙版遮罩 `#vibeGuideSpotlight`，將背景壓暗 65% (`rgba(15, 23, 42, 0.65)`)。
  2. 講述觀念時將目標元件的 `z-index` 提升並套用發光邊框，創造出戲劇張力極強的「劇院聚光燈」視覺聚焦效果。

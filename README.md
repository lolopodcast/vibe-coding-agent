# 🌅 每日晨報 AI Agent 專案 (Morning Digest Agent)

專為商管大學生設計的 **Vibe Coding 實戰專案**。利用 AI Agent 協作（管家 🎩 / 教練 🧢 / 工程師 🛠️），建構一個可動態無 Code 調整主題的自動化晨報系統。

---

## 📂 專案架構說明

- 📄 `KB/theme_config.md`：**【主題開關】** 隨時修改文字即可調整晨報關注的新聞領域（如半導體、ESG、實習職缺）。
- 📄 `KB/business_rules.md`：**【排版與規範】** 定義晨報格式、字數上限與資安合規要求。
- 📄 `skills/morning-digest/SKILL.md`：**【SOP 腳本】** 引導 Agent 進行「抓資料 ➡️ 摘要 ➡️ 自檢 (QC) ➡️ LINE 發送」的完整流程。
- 🔐 `.env.example`：API 金鑰設定範例檔。

---

## 🚀 快速上手 (Vibe Coding 指令)

開啟你的 AI Coding Agent (Claude Code / Antigravity)，對它說：

> 「請作為我的管家、教練與工程師團隊，讀取本專案下的 `KB/` 目錄與 `skills/morning-digest/SKILL.md`，協助我完善資料抓取邏輯與測試部署！」

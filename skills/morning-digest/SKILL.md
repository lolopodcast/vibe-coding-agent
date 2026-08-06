---
name: morning-digest-agent
description: 自動抓取當天線上氣象、Google 行事曆與指定主題新聞，合成符合規範的每日晨報並發送至 LINE Notify。
---

# 晨報 Agent 執行 SOP (Standard Operating Procedure)

當排程時鐘 (Cron Job) 於每日早上 07:00 觸發本 Skill 時，請嚴格按照以下步驟執行：

## Phase 1: Context & Configuration Loading
1. 讀取 `KB/theme_config.md` 獲取**當日重點關注主題與排除主題**。
2. 讀取 `KB/business_rules.md` 獲取**排版規範與安全邊界**。
3. 取得當前時間與地點資訊。

## Phase 2: Parallel Data Fetching (Subagents / Tools)
1. **Weather Tool**: 獲取目標地點（預設：台北市）之當日 Weather Summary。
2. **Calendar Tool**: 獲取用戶當天 Status=Confirmed 的 Google 行事曆行程。
3. **News Search Tool**: 根據 `theme_config.md` 的關鍵字，從 RSS / Google News 搜尋高信譽度新聞 Top 3。

## Phase 3: Digest Drafting & Quality Control (QC Loop)
1. 將抓取的 Raw Data 依照 `business_rules.md` 格式合成草稿。
2. **自我品質檢查 (Self-Correction)**：
   - 檢查字數是否介於 400 ~ 600 字？
   - 檢查是否有對每條新聞給出「💡 商業啟示」？
   - 檢查是否有附上原新聞連結？
   - 檢查是否無敏感資安/隱私資訊？
3. 若未通過 QC，自動重新微調草稿，上限 3 次。

## Phase 4: Delivery
呼叫 `send_line_notification` Tool，將最終確認的晨報發送給使用者。

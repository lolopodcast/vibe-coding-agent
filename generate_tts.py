import asyncio
import os
import sys
import edge_tts

# Storyboard scripts (4 min English + 6 min Traditional Chinese)
EN_SCRIPTS = [
    ("01_intro_en.mp3", "Welcome to the Vibe Coding AI Agent Learning Platform. In traditional computer science education, students spent months memorizing complex syntax line by line. This was akin to fixing horseshoes in the carriage era. Today, AI Agents represent a revolutionary paradigm shift—similar to the transition from horse-drawn carriages to automobiles. Business students no longer need to write every line of code manually. Instead, you act as the driver and product manager, steering system outcomes through high-level intent and architectural leadership."),
    ("02_pillars_en.mp3", "To effectively drive an AI Agent, business leaders master four core engineering pillars. First, Prompt is your steering wheel, defining persona and target deliverables. Second, Context is your interactive dashboard, providing working memory and long-term Knowledge Base documents. Third, Harness serves as your brakes and safety guardrails, setting API tool boundaries and input sanitization filters. Finally, Loop acts as the engine heartbeat, triggering scheduled execution cycles and self-correction quality checks."),
    ("03_roles_en.mp3", "In Vibe Coding, you work with a 3-role AI model. The Butler role manages workspace infrastructure, file structures, and version control. The Coach role provides guidance on prompt security, context windows, and offers encouragement. The Engineer Subagents perform parallel task execution such as data fetching and QA testing. In Module 4, editing simple text files inside KB theme config achieves true no-code maintenance without breaking backend logic."),
    ("04_lab_en.mp3", "Inside the Interactive Lab, students can witness real-time AI Agent execution. When we launch the simulator, the Agent reads KB theme config, invokes subagents, applies Harness security filters to prevent Prompt Injection, and enforces copyright defense. The output is a professional daily morning digest containing derived summaries and mandatory source links delivered seamlessly."),
    ("05_tracker_en.mp3", "Finally, the platform displays a high-resolution vector blueprint outlining the full system architecture. In the progress tracker section, students and instructors can monitor study duration, interactive click counts, flashcard reviews, and quiz scores. With a single click, you can export a bilingual CSV report. The footer features the official signature by Architect Professor Shihmin Lo, N C N U.")
]

ZH_SCRIPTS = [
    ("06_intro_zh.mp3", "歡迎來到 Vibe Coding AI Agent 雙語學習平台。在過去的資訊教育中，學生必須花費數月死記複雜的程式語法，這就像在馬車時代研究修馬鞍的細節；而今天，AI Agent 的出現帶來了汽車誕生一般的典範轉移。商管學生不再需要死記手寫逐行程式碼，而是擔任駕駛與產品經理的角色，透過高層次的商業意圖與架構導航，輕鬆掌控自動化系統的開發、品質驗收與維護。"),
    ("07_pillars_zh.mp3", "掌控 Agent 的關鍵在於四大工程要素。第一，Prompt 是您的方向盤，負責定義 AI 角色與交付格式；第二，Context 是您的儀錶板，隨時提供 Working Memory 與長期知識庫；第三，Harness 是煞車護欄，設定 API 工具邊界與 Prompt Injection 資安防禦網；第四，Loop 則是引擎心跳，負責定時排程觸發與品質自檢退回機制。"),
    ("08_roles_zh.mp3", "在專案協作中，您擁有三大 AI 角色：管家負責基礎架構與 KB 檔案維護、教練解說資安觀念並提供學習心理支持，工程師團隊則平行執行爬蟲與測試。在晨報實戰單元中，學生能深刻體會到，只要修改 KB theme config 文字檔，就能達到無程式碼更換新聞主題的高可維護性。"),
    ("09_lab_zh.mp3", "在互動實驗室中，學員可以親自體驗修改設定檔後，Agent 如何自動進行 ReAct 循環運算。當我們點擊啟動，系統會讀取 KB 主題、呼叫 Subagents 抓取 API，並透過 Harness 防禦網過濾資安風險。最終依據著作權防衛規範，產出附帶原文出處連結的專業晨報，並自動模擬交付至使用者手機。"),
    ("10_tracker_zh.mp3", "最後，系統提供了系統化、結構化與流程化的高解析度向量藍圖，讓學員掌握全系統大圖景。學習歷程模組則精確記錄了學習時間、點擊數與測驗得分，學員與老師可一鍵匯出雙語 CSV 認證報告。頁尾附有國立暨南國際大學駱世民教授的架構簽名與智慧財產權友善保護機制。這就是現代 Vibe Coding 完整的教學體驗。")
]

async def generate_tts():
    audio_dir = os.path.join(os.path.dirname(__file__), "audio_tracks")
    os.makedirs(audio_dir, exist_ok=True)
    
    for filename, text in EN_SCRIPTS:
        out_path = os.path.join(audio_dir, filename)
        communicate = edge_tts.Communicate(text, "en-US-BrianNeural", rate="+0%")
        await communicate.save(out_path)
        print(f"[TTS] Generated: {filename}")

    for filename, text in ZH_SCRIPTS:
        out_path = os.path.join(audio_dir, filename)
        communicate = edge_tts.Communicate(text, "zh-TW-HsiaoChenNeural", rate="+0%")
        await communicate.save(out_path)
        print(f"[TTS] Generated: {filename}")

if __name__ == "__main__":
    asyncio.run(generate_tts())

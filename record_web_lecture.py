import asyncio
import os
from playwright.async_api import async_playwright

# Exact audio durations:
# 01=34.92s, 02=33.22s, 03=30.70s, 04=24.48s, 05=26.30s (EN = 149.62s)
# 06=33.46s, 07=27.98s, 08=25.39s, 09=26.93s, 10=30.22s (ZH = 143.98s)

async def record_lecture_video():
    output_dir = os.path.join(os.path.dirname(__file__), "output_video")
    os.makedirs(output_dir, exist_ok=True)
    
    html_path = f"file:///{os.path.abspath('index.html').replace('\\', '/')}"

    async with async_playwright() as p:
        print("[Kinetic Playwright] Launching 1080p Full HD recording with VibeGuide focus API...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            device_scale_factor=1,
            record_video_dir=output_dir,
            record_video_size={'width': 1920, 'height': 1080}
        )
        page = await context.new_page()

        print(f"[Kinetic Playwright] Loading SPA: {html_path}")
        await page.goto(html_path, wait_until='networkidle')

        # ==================== PART 1: ENGLISH (01 - 05) ====================
        
        # 01 (34.92s): Summary Section
        print("[01_EN] Hero Summary & Paradigm Shift (34.92s)...")
        await page.evaluate("window.scrollTo({top: 0, behavior: 'smooth'})")
        await page.evaluate("window.VibeGuide.focusElement('#summary .hero-card', 12000)")
        await asyncio.sleep(34.92)

        # 02 (33.22s): 4 Engineering Pillars (Prompt, Context, Harness, Loop)
        print("[02_EN] Kinetic Focus on 4 Pillars (33.22s)...")
        await page.evaluate("document.getElementById('modules').scrollIntoView({behavior: 'smooth', block: 'start'})")
        await asyncio.sleep(4)
        # Prompt (Steering wheel)
        await page.evaluate("window.VibeGuide.focusElement('#card_m1_0', 6000)")
        await asyncio.sleep(7)
        # Context (Dashboard)
        await page.evaluate("window.VibeGuide.focusElement('#card_m1_1', 6000)")
        await asyncio.sleep(7)
        # Harness & Loop (Flip cards)
        await page.evaluate("window.VibeGuide.flipCard('#card_m1_0')")
        await asyncio.sleep(7.52)
        await page.evaluate("window.VibeGuide.flipCard('#card_m1_1')")
        await asyncio.sleep(7.70)

        # 03 (30.70s): 3 Roles & No-Code Maintenance
        print("[03_EN] Kinetic Focus on 3 Roles & Module 4 (30.70s)...")
        await page.evaluate("window.VibeGuide.clickTab('m3')")
        await page.evaluate("window.VibeGuide.focusElement('#card_m3_0', 5000)")
        await asyncio.sleep(8)
        await page.evaluate("window.VibeGuide.focusElement('#card_m3_1', 5000)")
        await asyncio.sleep(8)
        await page.evaluate("window.VibeGuide.clickTab('m4')")
        await page.evaluate("window.VibeGuide.focusElement('#card_m4_0', 8000)")
        await asyncio.sleep(14.70)

        # 04 (24.48s): Interactive Lab ReAct Simulator
        print("[04_EN] Kinetic Simulator Execution & Console (24.48s)...")
        await page.evaluate("document.getElementById('lab').scrollIntoView({behavior: 'smooth', block: 'start'})")
        await page.evaluate("window.VibeGuide.focusElement('#labCustomTheme', 3000)")
        await asyncio.sleep(4)
        await page.evaluate("window.VibeGuide.clickButton('#btnRunSim')")
        await asyncio.sleep(5)
        await page.evaluate("window.VibeGuide.focusElement('#simStepsLog', 10000)")
        await asyncio.sleep(15.48)

        # 05 (26.30s): SVG Blueprint & Tracker Analytics
        print("[05_EN] Kinetic Focus on SVG Blueprint & Progress CSV (26.30s)...")
        await page.evaluate("document.getElementById('resources').scrollIntoView({behavior: 'smooth', block: 'start'})")
        await page.evaluate("window.VibeGuide.focusElement('#resources svg', 8000)")
        await asyncio.sleep(11)
        await page.evaluate("document.getElementById('tracker').scrollIntoView({behavior: 'smooth', block: 'start'})")
        await page.evaluate("window.VibeGuide.focusElement('#btnExportCSV', 6000)")
        await asyncio.sleep(15.30)

        # ==================== PART 2: TRADITIONAL CHINESE (06 - 10) ====================
        print("[Switch Language] Changing to Traditional Chinese...")
        await page.evaluate("window.VibeGuide.clickButton('#langToggleBtn')")
        await asyncio.sleep(1.0)

        # 06 (33.46s): Traditional Chinese Summary
        print("[06_ZH] Traditional Chinese Summary (33.46s)...")
        await page.evaluate("window.scrollTo({top: 0, behavior: 'smooth'})")
        await page.evaluate("window.VibeGuide.focusElement('#summary .hero-card', 12000)")
        await asyncio.sleep(32.46)

        # 07 (27.98s): Traditional Chinese Pillars
        print("[07_ZH] Traditional Chinese Pillars Focus (27.98s)...")
        await page.evaluate("document.getElementById('modules').scrollIntoView({behavior: 'smooth', block: 'start'})")
        await page.evaluate("window.VibeGuide.clickTab('m1')")
        await asyncio.sleep(4)
        await page.evaluate("window.VibeGuide.focusElement('#card_m1_0', 5000)")
        await asyncio.sleep(6)
        await page.evaluate("window.VibeGuide.focusElement('#card_m1_1', 5000)")
        await asyncio.sleep(6)
        await page.evaluate("window.VibeGuide.flipCard('#card_m1_0')")
        await asyncio.sleep(6)
        await page.evaluate("window.VibeGuide.flipCard('#card_m1_1')")
        await asyncio.sleep(5.98)

        # 08 (25.39s): Traditional Chinese Roles
        print("[08_ZH] Traditional Chinese 3 Roles (25.39s)...")
        await page.evaluate("window.VibeGuide.clickTab('m3')")
        await page.evaluate("window.VibeGuide.focusElement('#card_m3_0', 4000)")
        await asyncio.sleep(6)
        await page.evaluate("window.VibeGuide.focusElement('#card_m3_1', 4000)")
        await asyncio.sleep(6)
        await page.evaluate("window.VibeGuide.clickTab('m4')")
        await page.evaluate("window.VibeGuide.focusElement('#card_m4_0', 6000)")
        await asyncio.sleep(13.39)

        # 09 (26.93s): Traditional Chinese Interactive Lab
        print("[09_ZH] Traditional Chinese Simulator Execution (26.93s)...")
        await page.evaluate("document.getElementById('lab').scrollIntoView({behavior: 'smooth', block: 'start'})")
        await asyncio.sleep(3)
        await page.evaluate("window.VibeGuide.clickButton('#btnRunSim')")
        await asyncio.sleep(4)
        await page.evaluate("window.VibeGuide.focusElement('#simStepsLog', 10000)")
        await asyncio.sleep(19.93)

        # 10 (30.22s): Traditional Chinese Blueprint & Signature
        print("[10_ZH] Traditional Chinese Blueprint & Signature (30.22s)...")
        await page.evaluate("document.getElementById('resources').scrollIntoView({behavior: 'smooth', block: 'start'})")
        await page.evaluate("window.VibeGuide.focusElement('#resources svg', 8000)")
        await asyncio.sleep(12)
        await page.evaluate("document.getElementById('tracker').scrollIntoView({behavior: 'smooth', block: 'start'})")
        await page.evaluate("window.VibeGuide.focusElement('footer', 8000)")
        await asyncio.sleep(18.22)

        print("[Playwright] Closing browser and finalizing kinetic video recording...")
        await context.close()
        await browser.close()
        print("[Playwright] Kinetic screen capture completed successfully.")

if __name__ == "__main__":
    asyncio.run(record_lecture_video())

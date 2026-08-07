import os
import sys
import glob
import re
import subprocess
from opencc import OpenCC

def parse_srt_time(time_str):
    h, m, s_ms = time_str.split(':')
    s, ms = s_ms.split(',')
    return int(h)*3600 + int(m)*60 + int(s) + int(ms)/1000.0

def format_srt_time(total_seconds):
    h = int(total_seconds // 3600)
    m = int((total_seconds % 3600) // 60)
    s = int(total_seconds % 60)
    ms = int(round((total_seconds - int(total_seconds)) * 1000))
    if ms >= 1000: ms = 999
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def shift_srt_file(srt_path, offset_seconds, output_path, start_index=1, convert_zh=False):
    cc = OpenCC('s2twp')  # Simplified to Traditional Taiwan Phrases
    with open(srt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    blocks = re.split(r'\n\s*\n', content.strip())
    new_blocks = []
    current_idx = start_index

    for b in blocks:
        lines = b.strip().split('\n')
        if len(lines) < 2:
            continue
        time_line = lines[1] if '-->' in lines[1] else (lines[0] if '-->' in lines[0] else '')
        if not time_line:
            continue
        
        match = re.search(r'(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})', time_line)
        if not match:
            continue

        t_start = parse_srt_time(match.group(1)) + offset_seconds
        t_end = parse_srt_time(match.group(2)) + offset_seconds

        text_lines = lines[2:] if '-->' in lines[1] else lines[1:]
        text = "\n".join(text_lines)

        if convert_zh:
            text = cc.convert(text)
            # Mandatory custom fixes for homophones/names
            replacements = {
                "死计": "死記",
                "足行": "逐行",
                "城市": "程式",
                "城市码": "程式碼",
                "仪表办": "儀錶板",
                "驾车": "煞車",
                "互拦": "護欄",
                "自安": "資安",
                "防预网": "防禦網",
                "自减": "自檢",
                "承报": "晨報",
                "时占": "實戰",
                "单员": "單元",
                "济南": "暨南",
                "洛世明": "駱世民",
                "叶伟": "頁尾",
                "向亮": "向量",
                "系统画": "系統化",
                "结构画": "結構化",
                "流程画": "流程化",
                "五城市": "無程式",
                "Laden": "Agent",
                "Think and Fake": "theme config",
                "一见": "一鍵",
                "挥出": "匯出"
            }
            for k, v in replacements.items():
                text = text.replace(k, v)

        new_blocks.append(f"{current_idx}\n{format_srt_time(t_start)} --> {format_srt_time(t_end)}\n{text}")
        current_idx += 1

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n\n".join(new_blocks) + "\n")
    return current_idx

def combine_and_generate_subtitles():
    project_dir = os.path.dirname(__file__)
    audio_dir = os.path.join(project_dir, "audio_tracks")
    output_dir = os.path.join(project_dir, "output_video")
    os.makedirs(output_dir, exist_ok=True)
    
    ffmpeg_exe = r"C:\Users\jimmy\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
    ffprobe_exe = r"C:\Users\jimmy\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffprobe.exe"

    en_files = sorted(glob.glob(os.path.join(audio_dir, "*_en.mp3")))
    zh_files = sorted(glob.glob(os.path.join(audio_dir, "*_zh.mp3")))

    all_files = en_files + zh_files
    list_all = os.path.join(audio_dir, "file_list_all.txt")
    with open(list_all, "w", encoding="utf-8") as f:
        for audio in all_files:
            f.write(f"file '{audio}'\n")

    combined_all = os.path.join(output_dir, "combined_lecture.mp3")
    print("[FFmpeg] Combining all 10 audio tracks into combined_lecture.mp3...")
    subprocess.run([ffmpeg_exe, "-y", "-f", "concat", "-safe", "0", "-i", list_all, "-c", "copy", combined_all], check=True)

    list_en = os.path.join(audio_dir, "file_list_en.txt")
    with open(list_en, "w", encoding="utf-8") as f:
        for audio in en_files:
            f.write(f"file '{audio}'\n")
    combined_en = os.path.join(output_dir, "combined_en.mp3")
    subprocess.run([ffmpeg_exe, "-y", "-f", "concat", "-safe", "0", "-i", list_en, "-c", "copy", combined_en], check=True)

    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"

    srt_en_path = os.path.join(output_dir, "combined_en.srt")
    srt_zh_path = os.path.join(output_dir, "combined_zh.srt")

    if not os.path.exists(srt_en_path):
        print("[Whisper CUDA] Generating EN Subtitles...")
        subprocess.run([sys.executable, "-m", "whisper", combined_en, "--language", "en", "--model", "small", "--device", "cuda", "--output_format", "srt", "--output_dir", output_dir], check=True, env=env)

    list_zh = os.path.join(audio_dir, "file_list_zh.txt")
    with open(list_zh, "w", encoding="utf-8") as f:
        for audio in zh_files:
            f.write(f"file '{audio}'\n")
    combined_zh = os.path.join(output_dir, "combined_zh.mp3")
    subprocess.run([ffmpeg_exe, "-y", "-f", "concat", "-safe", "0", "-i", list_zh, "-c", "copy", combined_zh], check=True)

    if not os.path.exists(srt_zh_path):
        print("[Whisper CUDA] Generating Traditional Chinese Subtitles...")
        subprocess.run([sys.executable, "-m", "whisper", combined_zh, "--language", "zh", "--model", "small", "--device", "cuda", "--output_format", "srt", "--output_dir", output_dir], check=True, env=env)

    duration_cmd = [ffprobe_exe, "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", combined_en]
    en_duration = float(subprocess.check_output(duration_cmd).decode().strip())
    print(f"[Timing] English Part Duration: {en_duration:.2f} seconds")

    final_srt_path = os.path.join(output_dir, "combined_lecture.srt")
    next_idx = shift_srt_file(srt_en_path, 0.0, final_srt_path, start_index=1, convert_zh=False)
    
    temp_shifted_zh = os.path.join(output_dir, "temp_shifted_zh.srt")
    shift_srt_file(srt_zh_path, en_duration, temp_shifted_zh, start_index=next_idx, convert_zh=True)

    with open(final_srt_path, 'a', encoding='utf-8') as f_out:
        with open(temp_shifted_zh, 'r', encoding='utf-8') as f_in:
            f_out.write("\n" + f_in.read())

    print(f"[Subtitles Complete] Merged bilingual SRT saved with OpenCC TW Traditional Chinese: {final_srt_path}")

if __name__ == "__main__":
    combine_and_generate_subtitles()

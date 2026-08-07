import os
import subprocess

def update_srt_and_render():
    output_dir = os.path.join(os.path.dirname(__file__), "output_video")
    
    srt_en_path = os.path.join(output_dir, "combined_en.srt")
    temp_shifted_zh_path = os.path.join(output_dir, "temp_shifted_zh.srt")
    final_srt_path = os.path.join(output_dir, "combined_lecture.srt")
    
    if not os.path.exists(temp_shifted_zh_path):
        print(f"[Error] {temp_shifted_zh_path} does not exist.")
        return

    print("[Subtitles Update] Merging combined_en.srt with modified temp_shifted_zh.srt...")
    with open(srt_en_path, 'r', encoding='utf-8') as f_en:
        en_content = f_en.read().strip()

    with open(temp_shifted_zh_path, 'r', encoding='utf-8') as f_zh:
        zh_content = f_zh.read().strip()

    combined_content = en_content + "\n\n" + zh_content + "\n"

    with open(final_srt_path, 'w', encoding='utf-8') as f_out:
        f_out.write(combined_content)

    print(f"[Subtitles Update] Updated {final_srt_path} successfully.")

if __name__ == "__main__":
    update_srt_and_render()

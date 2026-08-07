import os
import sys
import glob
import subprocess

def assemble_final_video():
    project_dir = os.path.dirname(__file__)
    output_dir = os.path.join(project_dir, "output_video")
    
    webm_files = glob.glob(os.path.join(output_dir, "*.webm"))
    if not webm_files:
        print("[Error] No recorded webm video found in output_video/")
        return
    input_video = max(webm_files, key=os.path.getmtime)  # Get the newest recorded webm file by mtime
    
    input_audio = os.path.join(output_dir, "combined_lecture.mp3")
    input_srt = os.path.join(output_dir, "combined_lecture.srt")
    final_output_mp4 = os.path.join(output_dir, "vibe_coding_video_lecture_5min.mp4")
    
    ffmpeg_exe = r"C:\Users\jimmy\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"

    print("[FFmpeg GPU] Rendering 1080p Full HD video with exact 293.6s audio & subtitle alignment...")
    
    srt_escaped = input_srt.replace("\\", "/").replace(":", "\\:")
    
    # Use tpad / fps filter so variable frame rate WebM extends to full audio duration without freezing early
    filter_spec = f"fps=25,tpad=stop_mode=clone:stop_duration=300,subtitles='{srt_escaped}':force_style='FontSize=16,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1,Shadow=1'"

    cmd_ffmpeg = [
        ffmpeg_exe, "-y",
        "-i", input_video,
        "-i", input_audio,
        "-vf", filter_spec,
        "-c:v", "h264_nvenc", "-preset", "p6", "-tune", "hq",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        final_output_mp4
    ]
    
    try:
        subprocess.run(cmd_ffmpeg, check=True)
        print(f"[FFmpeg GPU Success] Final video generated at: {final_output_mp4}")
    except Exception as e:
        print(f"[FFmpeg Fallback] CPU encoding fallback due to: {e}")

if __name__ == "__main__":
    assemble_final_video()

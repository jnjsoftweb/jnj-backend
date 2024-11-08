# pip install moviepy pydub SpeechRecognition webrtcvad

import os
import sys
from moviepy.editor import VideoFileClip
from pydub import AudioSegment
from pydub.silence import split_on_silence
import speech_recognition as sr
import webrtcvad
import datetime
import whisper

sys.path.append(os.path.dirname(__file__))
from base_builtin import save_file


def get_script_unit(index, text, start_time, end_time):
    if start_time is None or end_time is None:
        return None
    if start_time == end_time or not text.strip():
        return None
    start_time_formatted = f"{int(start_time // 3600):02}:{int((start_time % 3600) // 60):02}:{int(start_time % 60):02},{int((start_time % 1) * 1000):03}"
    end_time_formatted = f"{int(end_time // 3600):02}:{int((end_time % 3600) // 60):02}:{int(end_time % 60):02},{int((end_time % 1) * 1000):03}"
    return f"{index + 1}\n{start_time_formatted} --> {end_time_formatted}\n{text}\n\n"


def adjust_time(start_time, end_time, full_text, split_text):
    total_duration = end_time - start_time
    split_ratio = len(split_text) / len(full_text)
    adjusted_end_time = start_time + (total_duration * split_ratio)
    return adjusted_end_time


def split_by_punctuation(text):
    result = []
    current = ""
    for char in text:
        current += char
        if current.endswith((". ", "? ", "! ")):
            result.append(current.strip())
            current = ""
    if current:
        result.append(current.strip())
    return result


def extract_srt_whisper(src_path, dst_path, model_name="base", max_length=60):
    model = whisper.load_model(model_name)
    result = model.transcribe(src_path, language="ko")

    with open(dst_path, "w", encoding="utf-8") as f:
        script = ""
        index = 0

        for segment in result['segments']:
            segment_start_time = segment['start']
            segment_end_time = segment['end']
            segment_text = segment['text'].strip()

            split_texts = split_by_punctuation(segment_text)

            current_start_time = segment_start_time
            for i, split_text in enumerate(split_texts):
                if i == len(split_texts) - 1:
                    current_end_time = segment_end_time
                else:
                    current_end_time = adjust_time(current_start_time, segment_end_time, segment_text, split_text)

                if len(split_text) <= max_length:
                    script_unit = get_script_unit(index, split_text, current_start_time, current_end_time)
                    if script_unit:
                        script += script_unit.replace("\n\n", " \n\n")
                        index += 1
                else:
                    # 최대 길이를 초과하는 경우, 단어 단위로 분할
                    words = split_text.split()
                    current_line = ""
                    for word in words:
                        if len(current_line) + len(word) + 1 <= max_length:
                            if current_line:
                                current_line += " "
                            current_line += word
                        else:
                            sub_end_time = adjust_time(current_start_time, current_end_time, split_text, current_line)
                            script_unit = get_script_unit(index, current_line, current_start_time, sub_end_time)
                            if script_unit:
                                script += script_unit.replace("\n\n", " \n\n")
                                index += 1
                            current_start_time = sub_end_time
                            current_line = word

                    if current_line:
                        script_unit = get_script_unit(index, current_line, current_start_time, current_end_time)
                        if script_unit:
                            script += script_unit.replace("\n\n", " \n\n")
                            index += 1

                current_start_time = current_end_time

        f.write(script)

# def extract_srt_whisper(src_path, dst_path, model_name="base"):
#
#     # Whisper 모델 로드
#     model = whisper.load_model(model_name)
#     # 한국어로 음성 인식을 수행합니다
#     result = model.transcribe(src_path, language="ko")
#
#     save_file(dst_path, "")
#
#     with open(dst_path, "w", encoding="utf-8") as f:
#         script = ""
#         for i, segment in enumerate(result['segments']):
#             # SRT 형식에 맞게 번호, 시간, 텍스트를 작성합니다
#             start_time = segment['start']
#             end_time = segment['end']
#             text = segment['text']
#
#             # 시간 형식을 SRT에 맞게 변환합니다
#             start_time_formatted = f"{int(start_time // 3600):02}:{int((start_time % 3600) // 60):02}:{int(start_time % 60):02},{int((start_time % 1) * 1000):03}"
#             end_time_formatted = f"{int(end_time // 3600):02}:{int((end_time % 3600) // 60):02}:{int(end_time % 60):02},{int((end_time % 1) * 1000):03}"
#             script += get_script_unit(i, text, start_time, end_time)
#
#         # SRT 파일에 작성합니다
#         f.write(script)

if __name__ == "main":
    pass
    # # # 사용 예
    # # video_path = "your_video.mp4"
    # # video_path = r"E:\class101\프로그래밍\Web 프론트엔드\웹 프로그래머를 위한 워드프레스 플러그인 개발\00_01_5fbc8343e2331e00137a84e6.mp4"
    # # src_path = r"E:\class101\금융 재테크\주식\AI 자동 투자 봇 만들기, 노트북으로 월급을 두 배 불리는 법\00_01_5e840824c4bd5f2cc5a99076.mp4"
    # # src_path = r"D:\00_01_5e840824c4bd5f2cc5a99076.mp4"
    # src_path = r"D:\00_02_5e84082328b2930da4aa8278.mp4"
    # # src_path= r"C:\JnJ-soft\Projects\external\kmc-web-app\frontend\static\_links\chartFiles\diagnosis\audio\A000228한신예240613_0.mp3"
    # # output_path = "subtitles.srt"
    # # dst_path = r"E:\class101\금융 재테크\주식\AI 자동 투자 봇 만들기, 노트북으로 월급을 두 배 불리는 법\00_01_5e840824c4bd5f2cc5a99076.srt"
    # # dst_path = r"D:\00_01_5e840824c4bd5f2cc5a99076.srt"
    # dst_path = r"D:\00_02_5e84082328b2930da4aa8278.srt"
    # # dst_path= r"C:\JnJ-soft\Projects\external\kmc-web-app\frontend\static\_links\chartFiles\diagnosis\audio\A000228한신예240613_0.srt"
    # # extract_srt_subtitles(video_path, output_path)
    # # extract_srt_from_mp4_whisper(video_path, output_path, model_name="base")
    # extract_srt_whisper(src_path, dst_path, model_name="base")


    #
    # # audio_path = r"C:\JnJ-soft\Projects\external\kmc-web-app\frontend\static\_links\chartFiles\diagnosis\audio\A000228한신예240613_0.mp3"
    # audio_path = r"C:\JnJ-soft\Projects\external\kmc-web-app\frontend\static\_links\chartFiles\diagnosis\audio\A000946김정숙240613_0.mp3"
    # audio_path = r"C:\JnJ-soft\Projects\external\kmc-web-app\frontend\static\_links\chartFiles\diagnosis\audio\A000228한신예240613_0.mp3"
    # output_path = "subtitles.srt"
    # # extract_srt_from_mp3(audio_path, output_path)
    # extract_srt_from_mp3_whisper(audio_path, output_path, model_name="base")
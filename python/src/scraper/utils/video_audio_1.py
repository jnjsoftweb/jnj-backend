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
    # 시작 시간과 종료 시간이 동일하거나, 텍스트가 비어있으면 None 반환
    if start_time == end_time or not text.strip():
        return None

    # 시간 형식을 SRT에 맞게 변환
    start_time_formatted = f"{int(start_time // 3600):02}:{int((start_time % 3600) // 60):02}:{int(start_time % 60):02},{int((start_time % 1) * 1000):03}"
    end_time_formatted = f"{int(end_time // 3600):02}:{int((end_time % 3600) // 60):02}:{int(end_time % 60):02},{int((end_time % 1) * 1000):03}"

    return f"{index + 1}\n{start_time_formatted} --> {end_time_formatted}\n{text}\n\n"

def extract_srt_whisper(src_path, dst_path, model_name="base", max_length=40):
    # Whisper 모델 로드
    model = whisper.load_model(model_name)
    # 한국어로 음성 인식을 수행
    result = model.transcribe(src_path, language="ko")

    save_file(dst_path, "")

    with open(dst_path, "w", encoding="utf-8") as f:
        script = ""
        current_text = ""
        start_time = None
        index = 0

        for segment in result['segments']:
            segment_start_time = segment['start']
            segment_end_time = segment['end']
            segment_text = segment['text']

            # 새로운 문장이 시작되는 경우
            if start_time is None:
                start_time = segment_start_time

            # 현재 텍스트에 이어붙임
            if len(current_text) + len(segment_text) <= max_length:
                if current_text:
                    current_text += " "  # 단어와 단어 사이에 공백 추가
                current_text += segment_text.strip()
            else:
                # 현재 텍스트가 최대 길이를 초과하는 경우, 이전 텍스트를 자막으로 추가
                script_unit = get_script_unit(index, current_text.strip(), start_time, segment_start_time)
                if script_unit:
                    script += script_unit.replace("\n\n", " \n\n") # 자막 끝에 " " 추가
                    index += 1

                # 새로운 자막 시작
                current_text = segment_text.strip() + " "
                start_time = segment_start_time

            # 문장의 끝을 나타내는 마침표, 물음표, 느낌표 등으로 문장이 종료되는지 확인
            if any(punct in segment_text for punct in [".", "?", "!", "다", "요"]):
                # 문장이 종료되면 SRT에 추가
                script_unit = get_script_unit(index, current_text.strip(), start_time, segment_end_time)
                if script_unit:
                    script += script_unit.replace("\n\n", " \n\n") # 자막 끝에 " " 추가
                    index += 1

                current_text = ""
                start_time = None  # 다음 문장 시작을 위한 초기화

        # 마지막 문장이 남아 있는 경우 처리
        if current_text:
            script_unit = get_script_unit(index, current_text.strip(), start_time, segment_end_time)
            if script_unit:
                script += script_unit

        # SRT 파일에 작성
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
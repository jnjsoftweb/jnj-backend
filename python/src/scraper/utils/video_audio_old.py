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

def format_timedelta(td):
    hours, remainder = divmod(td.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{td.microseconds // 1000:03d}"


def extract_srt_from_mp3(audio_path, output_path, language='ko-KR'):
    # MP3 파일 로드
    audio = AudioSegment.from_mp3(audio_path)

    # 음성 구간 분리
    chunks = split_on_silence(audio, min_silence_len=500, silence_thresh=-40)

    # 음성 인식 객체 생성
    recognizer = sr.Recognizer()

    subtitles = []
    current_time = 0

    for i, chunk in enumerate(chunks):
        # 청크를 임시 WAV 파일로 저장
        chunk.export("temp_chunk.wav", format="wav")

        # 음성 인식
        with sr.AudioFile("temp_chunk.wav") as source:
            audio_data = recognizer.record(source)
            start_time = datetime.timedelta(seconds=current_time / 1000.0)
            end_time = datetime.timedelta(seconds=(current_time + len(chunk)) / 1000.0)
            try:
                text = recognizer.recognize_google(audio_data, language=language)
            except sr.UnknownValueError:
                print(f"청크 {i}를 인식할 수 없습니다.")
                text = "__인식 오류__"
            except sr.RequestError as e:
                print(f"Google 음성 인식 서비스 오류; {e}")
                text = "__인식 오류__"

            subtitles.append((start_time, end_time, text))

        current_time += len(chunk)

        # 임시 파일 삭제
        os.remove("temp_chunk.wav")

    # SRT 파일 작성
    with open(output_path, 'w', encoding='utf-8') as f:
        for i, (start, end, text) in enumerate(subtitles, start=1):
            f.write(f"{i}\n")
            f.write(f"{format_timedelta(start)} --> {format_timedelta(end)}\n")
            f.write(f"{text}\n\n")

    print(f"SRT 자막이 {output_path}에 저장되었습니다.")


# def extract_srt_from_mp3_whisper(audio_path, output_path, model_name="base"):
#     # Whisper 모델 로드
#     model = whisper.load_model(model_name)
#
#     # MP3 파일 로드
#     audio = AudioSegment.from_mp3(audio_path)
#
#     # 음성 구간 분리
#     chunks = split_on_silence(audio, min_silence_len=500, silence_thresh=-40)
#
#     subtitles = []
#     current_time = 0
#
#     for i, chunk in enumerate(chunks):
#         # 청크를 임시 WAV 파일로 저장
#         chunk.export("temp_chunk.wav", format="wav")
#
#         # Whisper를 사용한 음성 인식
#         result = model.transcribe("temp_chunk.wav")
#
#         start_time = datetime.timedelta(seconds=current_time / 1000.0)
#         end_time = datetime.timedelta(seconds=(current_time + len(chunk)) / 1000.0)
#
#         text = result["text"].strip()
#         if not text:
#             text = "__인식 오류__"
#
#         subtitles.append((start_time, end_time, text))
#
#         current_time += len(chunk)
#
#         # 임시 파일 삭제
#         os.remove("temp_chunk.wav")
#
#     # SRT 파일 작성
#     with open(output_path, 'w', encoding='utf-8') as f:
#         for i, (start, end, text) in enumerate(subtitles, start=1):
#             f.write(f"{i}\n")
#             f.write(f"{format_timedelta(start)} --> {format_timedelta(end)}\n")
#             f.write(f"{text}\n\n")
#
#     print(f"SRT 자막이 {output_path}에 저장되었습니다.")




def extract_srt_from_mp3_whisper(audio_path, output_path, model_name="base"):

    # Whisper 모델 로드
    model = whisper.load_model(model_name)
    # MP3 파일의 경로를 설정하세요
    mp3_file = audio_path
    # 한국어로 음성 인식을 수행합니다
    result = model.transcribe(mp3_file, language="ko")

    # SRT 파일로 저장합니다
    srt_file = output_path

    with open(srt_file, "w", encoding="utf-8") as f:
        for i, segment in enumerate(result['segments']):
            # SRT 형식에 맞게 번호, 시간, 텍스트를 작성합니다
            start_time = segment['start']
            end_time = segment['end']
            text = segment['text']

            # 시간 형식을 SRT에 맞게 변환합니다
            start_time_formatted = f"{int(start_time // 3600):02}:{int((start_time % 3600) // 60):02}:{int(start_time % 60):02},{int((start_time % 1) * 1000):03}"
            end_time_formatted = f"{int(end_time // 3600):02}:{int((end_time % 3600) // 60):02}:{int(end_time % 60):02},{int((end_time % 1) * 1000):03}"

            # SRT 파일에 작성합니다
            f.write(f"{i+1}\n")
            f.write(f"{start_time_formatted} --> {end_time_formatted}\n")
            f.write(f"{text}\n\n")


def extract_srt_whisper(src_path, dst_path, model_name="base"):

    # Whisper 모델 로드
    model = whisper.load_model(model_name)
    # 한국어로 음성 인식을 수행합니다
    result = model.transcribe(src_path, language="ko")

    with open(dst_path, "w", encoding="utf-8") as f:
        for i, segment in enumerate(result['segments']):
            # SRT 형식에 맞게 번호, 시간, 텍스트를 작성합니다
            start_time = segment['start']
            end_time = segment['end']
            text = segment['text']

            # 시간 형식을 SRT에 맞게 변환합니다
            start_time_formatted = f"{int(start_time // 3600):02}:{int((start_time % 3600) // 60):02}:{int(start_time % 60):02},{int((start_time % 1) * 1000):03}"
            end_time_formatted = f"{int(end_time // 3600):02}:{int((end_time % 3600) // 60):02}:{int(end_time % 60):02},{int((end_time % 1) * 1000):03}"

            # SRT 파일에 작성합니다
            f.write(f"{i+1}\n")
            f.write(f"{start_time_formatted} --> {end_time_formatted}\n")
            f.write(f"{text}\n\n")



def extract_srt_subtitles(video_path, output_path, language='ko-KR'):
    # 비디오 파일 로드
    video = VideoFileClip(video_path)

    # 오디오 추출 및 WAV로 저장
    audio = video.audio
    audio.write_audiofile("temp_audio.wav")

    # WAV 파일 로드
    audio = AudioSegment.from_wav("temp_audio.wav")

    # VAD 객체 생성 (음성 활동 감지)
    vad = webrtcvad.Vad(3)  # 감도 설정 (0-3)

    # 음성 구간 분리
    chunks = split_on_silence(audio, min_silence_len=500, silence_thresh=-40)

    # 음성 인식 객체 생성
    recognizer = sr.Recognizer()

    subtitles = []
    current_time = 0

    for i, chunk in enumerate(chunks):
        # 청크를 임시 파일로 저장
        chunk.export("temp_chunk.wav", format="wav")

        # 음성 인식
        with sr.AudioFile("temp_chunk.wav") as source:
            audio_data = recognizer.record(source)
            start_time = datetime.timedelta(seconds=current_time / 1000.0)
            end_time = datetime.timedelta(seconds=(current_time + len(chunk)) / 1000.0)
            try:
                text = recognizer.recognize_google(audio_data, language=language)
            except sr.UnknownValueError:
                print(f"청크 {i}를 인식할 수 없습니다.")
                text = "__인식 오류__"
            except sr.RequestError as e:
                print(f"Google 음성 인식 서비스 오류; {e}")
                text = "__인식 오류__"

            subtitles.append((start_time, end_time, text))

        current_time += len(chunk)

    # SRT 파일 작성
    save_file(output_path, "")
    with open(output_path, 'w', encoding='utf-8') as f:
        for i, (start, end, text) in enumerate(subtitles, start=1):
            f.write(f"{i}\n")
            f.write(f"{format_timedelta(start)} --> {format_timedelta(end)}\n")
            f.write(f"{text}\n\n")

    # 임시 파일 삭제
    os.remove("temp_audio.wav")
    os.remove("temp_chunk.wav")

    print(f"SRT 자막이 {output_path}에 저장되었습니다.")


def extract_srt_from_mp4_whisper(video_path, output_path, model_name="base"):
    # 비디오 파일 로드
    video = VideoFileClip(video_path)

    # 오디오 추출 및 WAV로 저장
    audio = video.audio
    audio.write_audiofile("temp_audio.wav")

    # WAV 파일 로드
    audio = AudioSegment.from_wav("temp_audio.wav")

    # VAD 객체 생성 (음성 활동 감지)
    vad = webrtcvad.Vad(3)  # 감도 설정 (0-3)

    # Whisper 모델 로드
    model = whisper.load_model(model_name)

    # 음성 구간 분리
    chunks = split_on_silence(audio, min_silence_len=500, silence_thresh=-40)

    subtitles = []
    current_time = 0

    for i, chunk in enumerate(chunks):
        # 청크를 임시 WAV 파일로 저장
        chunk.export("temp_chunk.wav", format="wav")

        # Whisper를 사용한 음성 인식
        result = model.transcribe("temp_chunk.wav")

        start_time = datetime.timedelta(seconds=current_time / 1000.0)
        end_time = datetime.timedelta(seconds=(current_time + len(chunk)) / 1000.0)

        text = result["text"].strip()
        if not text:
            text = "__인식 오류__"

        subtitles.append((start_time, end_time, text))

        current_time += len(chunk)

        # 임시 파일 삭제
        os.remove("temp_chunk.wav")

    # SRT 파일 작성
    with open(output_path, 'w', encoding='utf-8') as f:
        for i, (start, end, text) in enumerate(subtitles, start=1):
            f.write(f"{i}\n")
            f.write(f"{format_timedelta(start)} --> {format_timedelta(end)}\n")
            f.write(f"{text}\n\n")

    print(f"SRT 자막이 {output_path}에 저장되었습니다.")

# # 사용 예
# video_path = "your_video.mp4"
# video_path = r"E:\class101\프로그래밍\Web 프론트엔드\웹 프로그래머를 위한 워드프레스 플러그인 개발\00_01_5fbc8343e2331e00137a84e6.mp4"
src_path = r"E:\class101\금융 재테크\주식\AI 자동 투자 봇 만들기, 노트북으로 월급을 두 배 불리는 법\00_01_5e840824c4bd5f2cc5a99076.mp4"
src_path = r"D:\00_01_5e840824c4bd5f2cc5a99076.mp4"
# src_path = r"E:\class101\금융 재테크\주식\AI 자동 투자 봇 만들기, 노트북으로 월급을 두 배 불리는 법\00_02_5e84082328b2930da4aa8278.mp4"
# src_path= r"C:\JnJ-soft\Projects\external\kmc-web-app\frontend\static\_links\chartFiles\diagnosis\audio\A000228한신예240613_0.mp3"
# output_path = "subtitles.srt"
dst_path = r"E:\class101\금융 재테크\주식\AI 자동 투자 봇 만들기, 노트북으로 월급을 두 배 불리는 법\00_01_5e840824c4bd5f2cc5a99076.srt"
dst_path = r"D:\00_01_5e840824c4bd5f2cc5a99076.srt"
# dst_path = r"E:\class101\금융 재테크\주식\AI 자동 투자 봇 만들기, 노트북으로 월급을 두 배 불리는 법\00_02_5e84082328b2930da4aa8278.srt"
# dst_path= r"C:\JnJ-soft\Projects\external\kmc-web-app\frontend\static\_links\chartFiles\diagnosis\audio\A000228한신예240613_0.srt"
# extract_srt_subtitles(video_path, output_path)
# extract_srt_from_mp4_whisper(video_path, output_path, model_name="base")
extract_srt_whisper(src_path, dst_path, model_name="base")


#
# # audio_path = r"C:\JnJ-soft\Projects\external\kmc-web-app\frontend\static\_links\chartFiles\diagnosis\audio\A000228한신예240613_0.mp3"
# audio_path = r"C:\JnJ-soft\Projects\external\kmc-web-app\frontend\static\_links\chartFiles\diagnosis\audio\A000946김정숙240613_0.mp3"
# audio_path = r"C:\JnJ-soft\Projects\external\kmc-web-app\frontend\static\_links\chartFiles\diagnosis\audio\A000228한신예240613_0.mp3"
# output_path = "subtitles.srt"
# # extract_srt_from_mp3(audio_path, output_path)
# extract_srt_from_mp3_whisper(audio_path, output_path, model_name="base")
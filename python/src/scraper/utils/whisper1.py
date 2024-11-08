# pip install openai-whisper pydub

import os
import whisper
from pydub import AudioSegment
from pydub.silence import split_on_silence
import datetime


def format_timedelta(td):
    hours, remainder = divmod(td.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{td.microseconds // 1000:03d}"


def extract_srt_from_mp3_whisper(audio_path, output_path, model_name="base"):
    # Whisper 모델 로드
    model = whisper.load_model(model_name)

    # MP3 파일 로드
    audio = AudioSegment.from_mp3(audio_path)

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


# 사용 예
# audio_path = r"C:\JnJ-soft\Projects\external\kmc-web-app\frontend\static\_links\chartFiles\diagnosis\audio\A000228한신예240613_0.mp3"
audio_path = r"C:\Users\Jungsam\Downloads\광화문자생한방병원_1.mp3"
output_path = "subtitles.srt"
extract_srt_from_mp3_whisper(audio_path, output_path)
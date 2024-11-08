# pip install moviepy pydub SpeechRecognition webrtcvad

import os
import sys
import re
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

def extract_srt_whisper(src_path, dst_path, model_name="base", max_length=40):
    model = whisper.load_model(model_name)
    result = model.transcribe(src_path, language="ko")

    save_file(dst_path, "")
    with open(dst_path, "w", encoding="utf-8") as f:
        script = ""
        index = 0
        current_subtitle = {"text": "", "start_time": None, "end_time": None}
        last_end_time = 0  # 이전 자막의 종료 시간을 저장하는 변수

        for segment in result['segments']:
            segment_start_time = segment['start']
            segment_end_time = segment['end']
            segment_text = segment['text'].strip()

            split_texts = split_by_punctuation(segment_text)

            for i, split_text in enumerate(split_texts):
                if i == len(split_texts) - 1:
                    current_end_time = segment_end_time
                else:
                    current_end_time = adjust_time(segment_start_time, segment_end_time, segment_text, "".join(split_texts[:i+1]))

                if current_subtitle["text"]:
                    temp_concat = current_subtitle["text"] + " " + split_text
                    if len(temp_concat) <= max_length:
                        current_subtitle["text"] = temp_concat
                        current_subtitle["end_time"] = current_end_time
                    else:
                        script_unit = get_script_unit(index, current_subtitle["text"], max(current_subtitle["start_time"], last_end_time), current_subtitle["end_time"])
                        if script_unit:
                            script += script_unit.replace("\n\n", " \n\n")
                            index += 1
                            last_end_time = current_subtitle["end_time"]
                        current_subtitle = {"text": split_text, "start_time": last_end_time, "end_time": current_end_time}
                else:
                    current_subtitle = {"text": split_text, "start_time": max(segment_start_time, last_end_time), "end_time": current_end_time}

                if current_subtitle["text"].endswith((".", "?", "!")):
                    script_unit = get_script_unit(index, current_subtitle["text"], max(current_subtitle["start_time"], last_end_time), current_subtitle["end_time"])
                    if script_unit:
                        script += script_unit.replace("\n\n", " \n\n")
                        index += 1
                        last_end_time = current_subtitle["end_time"]
                    current_subtitle = {"text": "", "start_time": None, "end_time": None}

                if len(current_subtitle["text"]) > max_length:
                    words = current_subtitle["text"].split()
                    current_line = ""
                    line_start_time = max(current_subtitle["start_time"], last_end_time)
                    for word in words:
                        if len(current_line) + len(word) + 1 <= max_length:
                            if current_line:
                                current_line += " "
                            current_line += word
                        else:
                            line_end_time = adjust_time(line_start_time, current_subtitle["end_time"], current_subtitle["text"], current_line)
                            script_unit = get_script_unit(index, current_line, line_start_time, line_end_time)
                            if script_unit:
                                script += script_unit.replace("\n\n", " \n\n")
                                index += 1
                                last_end_time = line_end_time
                            line_start_time = line_end_time
                            current_line = word
                    current_subtitle = {"text": current_line, "start_time": line_start_time, "end_time": current_subtitle["end_time"]}

        # 마지막 자막 처리
        if current_subtitle["text"]:
            script_unit = get_script_unit(index, current_subtitle["text"], max(current_subtitle["start_time"], last_end_time), current_subtitle["end_time"])
            if script_unit:
                script += script_unit

        f.write(script.replace("\n ", "\n"))


def extract_text_from_srt(srt_content):
    # Regular expression to match subtitles and time codes
    srt_pattern = re.compile(r"\d+\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\n(.+?)(?=\n\d+\n|\Z)",
                             re.DOTALL)

    # Find all matches in the SRT content
    matches = srt_pattern.findall(srt_content)

    # Extract and concatenate all subtitle text
    extracted_text = "".join([match[2] for match in matches]).replace(" \n", " ").replace("\n\n", "\n")
    # extracted_text = "".join([match[2].replace("\n", " ") for match in matches])

    return extracted_text.strip()




# if __name__ == "main":
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

# # Example usage:
# srt_content = """1
# 00:00:00,000 --> 00:00:04,759
# 안녕하세요.
#
# 2
# 00:00:04,759 --> 00:00:05,620
# 선한부자 오가닉입니다.
#
#
# 3
# 00:00:05,620 --> 00:00:10,019
# 저번 강의에서는 블로그 주제를 정할 때 알아야 할 것과 수익이 좋은 주제에 대해 알아보려는데요.
#
#
# 4
# 00:00:00,000 --> 00:00:04,759
# 안녕하세요.
#
# 2
# 00:00:04,759 --> 00:00:05,620
# 선한부자 오가닉입니다.
#
#
# 3
# 00:00:05,620 --> 00:00:10,019
# 저번 강의에서는 블로그 주제를 정할 때 알아야 할 것과 수익이 좋은 주제에 대해 알아보려는데요.
# """
#
# extracted_text = extract_text_from_srt(srt_content)
# print(extracted_text)
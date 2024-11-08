import os, sys
import re
import requests
import html2text
import markdown

sys.path.append(os.path.dirname(__file__))
from base_builtin import load_file, load_json, load_yaml, save_file, save_json
from doc_html import get_root, node_to_string, get_nodes, remove_node, get_val

POST_SEPARATOR = "\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n"
CUT_TEXT_BEFORE = "공유하기  신고하기 "  # 이전 내용 삭제
CUT_TEXT_AFTER = "50m©"  # 이후 내용 삭제

folder = "C:/JnJ-soft/Projects/internal/jnj-web-tools/scraper/jnj-scraper-py/down/tistory/전원한의원/html/건강기능식품안내"
repls = [
    (' +\n', '\n'),
    ('\*+ *([^\*]+)? *\*+\n', r'\1\n'),
    (' +\n', '\n'),
    # ('\n\*+\n', ''),
    ('\\\-', '-'),
    ('\\\.', '.'),
    (' {2,}', ' '),
    ('\n{3,}', '\n\n')
]

# * HTML 2 MARKDOWN 설정
# html2text 객체 생성
text_maker = html2text.HTML2Text()
# 링크 주소 간소화 (선택 사항)
text_maker.ignore_links = False
# 이미지 주소 간소화 (선택 사항)
text_maker.ignore_images = True
# 강조 표시를 위한 마크다운 스타일 유지 (선택 사항)
text_maker.mark_code = True

# *
def _replace_md(md, repls):
    for repl in repls:
        md = re.sub(repl[0], repl[1], md)
    return md

# *
def html2md_folder(folder, repls):
    files = os.listdir(folder)
    for file in files:
        path = f"{folder}/{file}"
        save_file(path.replace("/html/", "/md/").replace(".html", ".md"), _replace_md(html2md(load_file(path)), repls))
        # print(load_file(path))

## * 파일 변환
def html2md(html_content, cut_text_before=CUT_TEXT_BEFORE, cut_text_after=CUT_TEXT_AFTER):
    # HTML을 Markdown으로 변환
    markdown_text = text_maker.handle(html_content)
    # print(markdown_text)
    cuts = markdown_text.split(cut_text_before)
    if len(cuts) > 1:
        markdown_text = cuts[1]
    markdown_text = markdown_text.split(cut_text_after)[0].strip()
    # markdown_text = re.sub('\s+\n', '\n', markdown_text)
    return markdown_text
    # save_file("./test_md.txt", markdown_text)


# ## * 파일 병합
# def html2mds(_paths, sep=POST_SEPARATOR):
#     md = ""
#     for _path in _paths:
#         if '/' in _path:
#             title = _path.split('/')[-1].replace(".html", "")
#         elif '\\' in _path:
#             title = _path.split('\\')[-1].replace(".html", "")
#         parts = title.split('_')
#         title = f"\n# {'_'.join(parts[1:])}\n\n"

#         with open(_path, 'r', encoding='utf-8') as file:
#             html_content = file.read()
#             md += sep + title + html2md(html_content)

#     md = re.sub(sep, "", md, count=1)

#     return md

## ** markdown to html
def md2html(md, extensions=['fenced_code', 'tables']):
    return markdown.markdown(md, extensions=extensions)

if __name__ == "__main__":

    #--------------------------------------------
    # Markdown 텍스트
    md_text = """
# 제목

이것은 *마크다운* 예제입니다.

- 목록 1
- 목록 2

|   Name   |   Type   |
| -------- | -------- |
|  토람코   |  블로그  |

```python

def fun1():
    return 'Hello World'

```
    """

    # Markdown을 HTML로 변환
    html = markdown.markdown(md_text, extensions=['fenced_code', 'tables'])
    print("="*80)
    print(html)
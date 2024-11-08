import os, sys
import re
import time
from lxml.html import fromstring
from lxml.etree import tostring
from bs4 import BeautifulSoup
import requests

sys.path.append(os.path.dirname(__file__))
from base_basic import valid_str


SEPERATOR = "|-"

# ** sub functions(callback)
# * list
def _today(sep="-"):
    return time.strftime("%Y" + sep + "%m" + sep + "%d", time.localtime(time.time()))

def set_file_name(name):
    return re.sub(r'[\<\>:"|?*]', " ", name).replace("/", "-").replace("\t", " ").strip()

# *
def prettify(data, type="html"):
    if type == "html":
        return BeautifulSoup(data, features="html.parser").prettify()

def get_root(html):
    return fromstring(html)

def get_nodes(html, xpath):
    return fromstring(html).xpath(xpath)

def node_to_string(node):
    return tostring(node, encoding='unicode', pretty_print=True)

def remove_node(root, xpath):
    for bad in root.xpath(xpath):
        bad.getparent().remove(bad)
    return root

def get_val(root, xpath, target="text", joiner=SEPERATOR):
    """root, xpath, target => value
    """
    if not valid_str(xpath):
        return ""

    try:
        nodes = root.xpath(xpath)
        if nodes is None or len(nodes) == 0:
            return ""
    except Exception as e:
        print(e)
        print("root, xpath, target", root, xpath, target)

    # print("root, xpath, target", root, xpath, target)
    if target == "text" or target == None:  # TODO: node.text_content()와 다른 text 반환 방법으로 수정
        if (len(nodes) == 1):
            rst = " ".join([txt.strip() for txt in root.xpath(xpath + "/text()") if txt.strip() != ""])
        else:
            rst = joiner.join([str(node.text_content().strip()) for node in nodes])
    elif target == "content":
        rst = joiner.join([str(node.text_content().strip()) for node in nodes])
    elif target == "innerhtml":
        # rst = tostring(nodes[0], encoding="unicode", method="html")
        rst = ''.join([tostring(child, encoding='unicode', method='html') for child in nodes[0].iterchildren()])
    elif target == "outerhtml":  # TODO: 문자 깨지지 않는 방법 구현(현재: playwright에서 evaluate()사용중)
        # print(tostring(nodes[0], encoding='utf-8'))
        # rst = str(tostring(nodes[0], encoding='utf-8'))
        rst = tostring(nodes[0], encoding="unicode", method="html")
    else:
        # print(f"nodes len: {len(nodes)}")
        # for node in nodes:
        #     val = "" if node.get(target) is None else node.get(target)
        #     print("val: ", val)
        rst = joiner.join([node.get(target, "").strip() for node in nodes])

    return rst.strip() if rst != None else ""

def get_rows(html, rowXpath, elements, stop_key, stop_val=None, cb_after_row=None, cb_after_rows=None):
    """html, rowXpath, elements, ... => get elements values(dicts)
    stop_val: 중지 조건값, cb_after_row: row당 콜백, cb_after_rows: rows 완료후 콜백
    """
    rows = []
    stop = False
    nodes = fromstring(html).xpath(rowXpath)

    els = {}
    for element in elements:  # TODO: element.get을 1회만 하도록 변경
        key = element.get("key", None)
        xpath = element.get("xpath", None)
        target = element.get("target", None)
        callback = element.get("callback", None)
        # stop = element.get("stop", None)

        if valid_str(key) and valid_str(xpath):
            els[key] = tuple([xpath, target, callback])

    for node in nodes:
        row = {}
        rst = ""
        for (key, (xpath, target, callback)) in els.items():  # TODO: element.get을 1회만 하도록 변경
            # * 각 element data 반환
            rst = get_val(node, xpath, target)
            
            # * stop 조건 만족시, 지금까지의 stop tag=True, data(rows) 반환
            # print(f"stop: {stop}, rst: {rst}, stop_val: {stop_val}")
            if key == stop_key and rst == stop_val:
                return (True, rows)

            # * 데이터 후처리(callback)
            if callback != None:
                # print(f"callback: {callback}, rst: {rst}, type(callback): {type(callback)}, type(rst): {type(rst)}")
                rst = eval(callback) if ("(" in callback) or ("rst" in callback) else callback

            row[key] = rst if rst != None else ""

            # * 데이터 후처리(row)
            if cb_after_row != None: cb_after_row(row, key, rst)

        # * 데이터 후처리(rows)
        if cb_after_rows != None: cb_after_rows(rows, row, key, rst)

    return (False, rows)


# * Detail Page
def get_dict(html, elements, cb_on_key={}):
    dct = {}
    root = fromstring(html)

    for element in elements:
        key = element.get("key", None)
        xpath = element.get("xpath", None)
        target = element.get("target", None)
        callback = element.get("callback", None)

        if not valid_str(key) or not valid_str(xpath): # key나 xpath가 없는 경우
            continue
        
        if key in cb_on_key.keys():  # 별도 콜백이 있는 경우
            rs = cb_on_key[key](root, xpath, target, callback)
            if (rs is not None):
                dct[key] = rs
        else:  # 별도 콜백이 없는 경우
            rst = get_val(root, xpath, target)

            # TODO: callback 실행
            if callback:
                if "rst" in callback:
                    # print(f"**callback: {callback}, rst: |{rst}|")
                    rst = eval(callback)
                else:
                    rst = callback
            dct[key] = rst

    return dct

#---------------------------------------------------------
## * html내 파일 다운로드
def _get_down_files(html, url_el=('/a', 'href'), name_el=('/a', 'text')):
    """
    C:\JnJ-soft\Projects\internal\jnj-web-tools\scraper\jnj-scraper-py\down\tistory\전원한의원\html\경영\건강보험 정보\[전원한의원] 건강보험 임의계속가입제도 안내.html
    """
    root = get_root(html)
    nodes = root.xpath("//a")
    files = []
    for node in nodes:
        url = node.get("href")
        if '/cfile/' in url:
            files.append((url, node.text_content()))

    return files

def _download_file(url, _path):
    response = requests.get(url)               # get request
    save_file(_path, requests.get(url).content, mode="wb")
    # with open(_path, "wb") as file:   # open in binary mode
    #     response = requests.get(url)               # get request
    #     save_file(_path, response, mode="wb")
    #     file.write(response.content)      # write to file
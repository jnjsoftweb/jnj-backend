# -*- coding=utf-8 -*-
"""
주요 기능: Google Sheets(API)
    - CRUD

사용 방법: 
    - 

참조 자료:
    - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request?authuser=0
"""

##@@@ Package/Module
##============================================================

##@@ Built-In Package/Module
##------------------------------------------------------------
import os, sys
import json
import ast

sys.path.append(os.path.dirname(__file__))
from google_api import google_service

##@@ External Package/Module
##------------------------------------------------------------


##@@@ Constant/Varible
##============================================================

##@@ Constant
##------------------------------------------------------------


##@@ Variable(Golobal)
##------------------------------------------------------------
# _SERVICES = []  ## 서비스 목록 [{'api_name': 'drive', 'user_nick': 'deverlife', 'bot_nick': None, 'service': api_OBJ1}, {'api_name': 'sheets', 'user_nick': None, 'bot_nick': 'mats', 'service': api_OBJ2}, ...] 


##@@@ Private Function
##============================================================

##@@ data
##------------------------------------------------------------



##@@ column, range
##------------------------------------------------------------
def _colnum_to_colstr(n):
    colstr = ""
    while n > 0:
        n, remainder = divmod(n - 1, 26)
        colstr = chr(65 + remainder) + colstr
    return colstr

def _extend_empty_cell(data):
    if data:
        # 모든 행 중에서 가장 긴 길이 찾기
        max_length = max(len(row) for row in data)
        
        # 각 행에 대해 누락된 셀을 빈 문자열로 채우기
        for row in data:
            row.extend([''] * (max_length - len(row)))
    return data

def _get_sheet_range(h_w=(1,1), start=(0,0)):
    """_get_sheet_range: 행,열 range -> sheet_range
    Desc:
        - start(행번호, 열번호), h_w(행길이, 열길이) -> sheet_range

    Args:
        - h_w(tuple, (1,1)): h_w(행길이, 열길이)
        - start(tuple, (0,0)): start(행번호, 열번호)

    Returns:
        - str: "A1:B2"

    Usages:
        - [description]
    """
    if h_w == None:
        return None

    row_bgn = start[0] + 1
    row_end = row_bgn + h_w[0]
    col_bgn = start[1] + 1
    col_end = start[1] + h_w[1]

    return f"{_colnum_to_colstr(col_bgn)}{row_bgn}:{_colnum_to_colstr(col_end)}{row_end}"      


def _get_sheet_range2(rowcol_range=[(0,0), (1,1)]):
    """_get_sheet_range: row, col 숫자 -> sheet_range
    Args:
        - rowcol_range(list, [(0,0), (1,1)]): [(시작행번호, 시작열번호), (종료행번호, 종료열번호)]

    Returns:
        - str: "A1:B2"
    """
    if rowcol_range == None:
        return None

    row_bgn = rowcol_range[0][0] + 1
    row_end = rowcol_range[1][0] + 1
    col_bgn = _colnum_to_colstr(rowcol_range[0][1] + 1)
    col_end = _colnum_to_colstr(rowcol_range[1][1] + 1)

    return f"{col_bgn}{row_bgn}:{col_end}{row_end}"


##@@ read
##------------------------------------------------------------
def _eval_read_sheet(data):
    header = data.pop(0)
    dicts = []
    for row in data:
        dicts.append(
            {  ## NOTE: v가 list 이거나 dict 이면 parsing, eval(v)도 가능하나 ast.literal_eval(v)를 권장
                k: ast.literal_eval(v) if (v[0] == "[" and v[-1] == "]") or (v[0] == "{" and v[-1] == "}") else v
                for (k, v) in zip(header, row)
            }
        )
    # with open("test.json", "w") as f:
    #     json.dump(data, f, ensure_ascii=False, indent=4)
    return dicts


##@@ update
##------------------------------------------------------------
# 2. 입력 columns의 header에서의 index 구함
def _sorted_idxs_cols(columns, header):
    """_idxs_cols: 입력 제목행(columns), 기존 제목행(header) -> 기존/신규 행렬,인덱스
    Desc:
        - [extended_summary]

    Args:
        - columns(list): 입력 제목행(update 예정인 제목행)
        - header(list): 기존 제목행(update 대상 Google Sheets에서 가져옴)

    Returns:
        - [tuple]: old(기존에 있는 제목행), new(새로 입력되어지는 제목행)
        * old_idxs / old_cols: 기존 header 순으로 sort

    Usages:
        - [description]
    """
    l = len(header)
    old_idxs = sorted([header.index(col) for col in columns if col in header])
    old_cols = [header[idx] for idx in old_idxs]
    new_cols = [col for col in columns if not col in header]
    new_idxs = [i + l for i in range(len(new_cols))]

    return (old_idxs, old_cols, new_idxs, new_cols)


##@@@ Main Class
##============================================================
class GoogleSheets():
    def __init__(self, spreadsheet_id="", user_name="bigwhitekmc", type="oauth2", sn=0):
        """__init__: Object 초기화
        """
        self.id = spreadsheet_id
        self.service = google_service('sheets', user_name, type, sn)


    ##@@ Private Function
    ##------------------------------------------------------------
    def _start_end_header(self, sheet_name, gap=0):
        """_start_end_header: sheet의 해더, 시작셀, 종료셀
        Desc:
            - [extended_summary]

        Args:
            - sheet_name(str): [description]
            - gap(int, 0): 비어있지 않은 첫번째행과 해더행의 격차

        Returns:
            - [type]: [description]

        Usages:
            - [description]
        """
        rows = self.read_sheet(sheet_name)
        # print(rows)
        
        for i, row in enumerate(rows):
            if row != []:
                start_row = i
                break
        
        for j, col in enumerate(rows[start_row+gap]):  ## NOTE: header행 기준
            if col != '':
                start_col = j
                break
        
        end_row = start_row + len(rows) - 1
        end_col = len(rows[start_row+gap]) - 1

        return [(start_row, start_col), (end_row, end_col), rows[start_row+gap][start_col:]]  ## [시작셀, 종료셀, 해더]

    def _sheet_id(self, sheet_name):
        for sheet in self.spreadsheets_obj()['sheets']:
            if sheet['properties']['title'] == sheet_name:
                return sheet['properties']['sheetId']


    def spreadsheets_obj(self, id=None):
        id = id if id else self.id
        return self.service.spreadsheets().get(spreadsheetId=id).execute()


    def sheet_obj(self, sheet_name="", id=None):
        id = id if id else self.id
        return self.service.spreadsheets().values().get(
            spreadsheetId = id,
            # majorDimension = 'ROWS',
            range = f"{sheet_name}"
        ).execute()


    def sheet_id(self, sheet_name, id=None):
        """sheet_name -> sheetId
        """
        id = id if id else self.id
        for _sheet in self.spreadsheets_obj(id=id)['sheets']:
            if _sheet['properties']['title'] == sheet_name:
                return _sheet['properties']['sheetId']
        return False


    def list_of_sheets(self, id=None):
        id = id if id else self.id
        spreadsheets_obj = self.spreadsheets_obj(id=id)
        return [sheet['properties']['title'] for sheet in spreadsheets_obj['sheets']]

    ##@@ Public Function
    ##------------------------------------------------------------
    def _add_sheet(self, sheet_name):
        """add_sheet_by_id: [summary]
        Refs:
            - https://developers.google.com/sheets/api/samples/sheet
        """       
        return self.service.spreadsheets().batchUpdate(
            spreadsheetId = self.id,
            body = {
                "requests": [
                    {
                        "addSheet": {
                            "properties": {
                                "title": sheet_name
                            }
                        }
                    }
                ]
            }
        ).execute()


    def add_sheet(self, sheet_name):  ## TODO: folder 지정
        if not sheet_name in self.list_of_sheets():  ## NOTE: sheet가 없으면 생성
            self._add_sheet(sheet_name=sheet_name)
        else:
            pass
            # print("{sheet_name} sheet가 존재합니다")


    def _del_sheet(self, sheet_name):
        """del_sheet_by_id: [summary]
        Refs:
            - https://developers.google.com/sheets/api/samples/sheet
        """
        return self.service.spreadsheets().batchUpdate(
            spreadsheetId = self.id,
            body = {
                "requests": [
                    {
                        "deleteSheet": {
                            "sheetId": self.sheet_id(sheet_name)
                        }
                    }
                ]
            }
        ).execute()


    def del_sheet(self, sheet_name):
        """시트 삭제
        """
        if sheet_name in self.list_of_sheets():  ## NOTE: sheet가 있으면 삭제
            self._del_sheet(sheet_name=sheet_name)
        else:
            pass
            # print(f"{sheet_name} sheet가 존재하지 않습니다.")


    def del_sheets(self, sheet_names=[], all=True):
        """복수개 시트 삭제
        all: 시트 전부 삭제(마지막 1개는 삭제되지 않음)
        """
        sheet_names = self.list_of_sheets() if all else sheet_names
        for sheet_name in sheet_names:
            self.del_sheet(sheet_name=sheet_name)


    # https://developers.google.com/sheets/api/guides/values#reading
    def read_sheet(self, sheet_name="API", sheet_range=None, cols=[]):
        """
        cols: 선택 컬럼
        """
        # sheet_range = "A2:E"
        range = f"{sheet_name}!{sheet_range}" if sheet_range else f"{sheet_name}"
        
        self.add_sheet(sheet_name) ## NOTE: sheet가 없으면 생성
        try:
            data = self.service.spreadsheets().values().get(
                spreadsheetId = self.id,
                majorDimension = 'ROWS',
                range = range
            ).execute()['values']
        except:  ## NOTE: sheet가 비어있거나, 에러가 발생하면
            return []

        if cols:
            data = [[v for i, v in enumerate(_a) if i in [i for i, v in enumerate(data[0]) if v in cols]] for _a in data]

        return _extend_empty_cell(data)


    ## https://developers.google.com/sheets/api/guides/values
    # def write_sheet(self, sheet_name="Sheet1", sheet_range=None, values=[]):
    def write_sheet(self, sheet_name="Sheet1", sheet_range=None, data=[], keys=[]):
        """data -> sheet
        keys: 출력할 keys(column) filter / sort 참조: _dict_key_sort
        """
        # print(f"{values=}")
        self.add_sheet(sheet_name) ## NOTE: sheet가 없으면 생성

        # (sheet_range, input_values) = _data_for_sheet(data=data, columns=columns)
        range = f"{sheet_name}!{sheet_range}" if sheet_range != None else f"{sheet_name}"
        # value_input_option 설정
        # value_input_option = {
        #     'raw': {
        #         'cells': data
        #     }
        # }
        body = {
            "valueInputOption": "USER_ENTERED", # "RAW" / "USER_ENTERED"
            "data": [{
                "range": range,
                "majorDimension": "ROWS",
                "values": data
            }]
        }
        return self.service.spreadsheets().values().batchUpdate(
            spreadsheetId = self.id, 
            body = body
        ).execute()


    def append_sheet(self, sheet_name="Sheet1", sheet_range=None, values=[]):
        range = f"{sheet_name}!{sheet_range}" if sheet_range != None else f"{sheet_name}"
        return self.service.spreadsheets().values().append(
            spreadsheetId = self.id, 
            range = range,
            valueInputOption = "RAW", 
            body = {
                'values': values
            }
        ).execute()


    # def upsert_sheet(self, sheet_name, data, cols=[]):
    #     """sheet 업데이트
    #     data: 업데이트할 데이터
    #     cols: 기준값(공통값)이 되는 컬럼(str/list)
    #     """
    #     cols = cols if cols else list(data[0].keys())
    #     # print(f"{data=} {cols=}")
    #     new = _to_df(data).replace(r'^\s*$', np.nan, regex=True).dropna(how="all", subset=cols)
    #     if sheet_name in self.list_of_sheets():  # NOTE: sheet_name이 존재하면
    #         old = self.read_sheet(sheet_name, sheet_range=None, out_type="df")
    #         if len(old) > 0:
    #             cols = cols if cols else old.columns[0]
    #             self.write_sheet(sheet_name, data=_upsert_df(cols, old, new)[old.columns])
    #         else:
    #             self.write_sheet(sheet_name, data=new)
    #     else:  # NOTE: sheet_name이 존재하지 않으면
    #         self.write_sheet(sheet_name, data=new)


    ## https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request#findreplacerequest
    def replace_text(self, find, replacement, sheet_name=None):
        if sheet_name == None:
            all_sheets = True
            _range = None
        else:
            all_sheets = None
            _range = {
                "sheetId": self._sheet_id(sheet_name)
            }
        
        requests = []
        requests.append({
            'findReplace': {
                'find': find,
                'replacement': replacement,
                # 'allSheets': False,
                'allSheets': all_sheets,
                "range": _range
                # "range": {
                #     "sheetId": self._sheet_id(sheet_name),  ## NOTE: sheet 지정 self._sheet_id(sheet_name)
                #     # "startColumnIndex": 0,
                #     # "endColumnIndex": 10
                #     # "startRowIndex": integer,
                #     # "endRowIndex": integer,
                # },
            }
        })

        body = {
            'requests': requests
        }
        response = self.service.spreadsheets().batchUpdate(
            spreadsheetId=self.id,
            body=body,
            # range = "test3"
        ).execute()

        # find_replace_response = response.get('replies')[1].get('findReplace')
        # print('{0} replacements made.'.format(
        #     find_replace_response.get('occurrencesChanged')))

        return response

    # ## NOTE: Updating Spreadsheets
    # ## https://developers.google.com/sheets/api/guides/batchupdate
    # requests = []
    # # Change the spreadsheet's title.
    # requests.append({
    #     'updateSpreadsheetProperties': {
    #         'properties': {
    #             'title': title
    #         },
    #         'fields': 'title'
    #     }
    # })
    # # Find and replace text
    # requests.append({
    #     'findReplace': {
    #         'find': find,
    #         'replacement': replacement,
    #         'allSheets': True
    #     }
    # })
    # # Add additional requests (operations) ...

    # body = {
    #     'requests': requests
    # }
    # response = service.spreadsheets().batchUpdate(
    #     spreadsheetId=spreadsheet_id,
    #     body=body).execute()
    # find_replace_response = response.get('replies')[1].get('findReplace')
    # print('{0} replacements made.'.format(
    #     find_replace_response.get('occurrencesChanged')))

if __name__ == "__main__":
    # spreadsheets_id = "1QOP3_FIXLtjnnW1D-VcKtj1yQfgPghGIJzRMj-7Dsuw"  # settings_account
    # sheet_name = "ebest"
    ## * read
    spreadsheets_id = "1DaorTd4GowGbOeuLhbx8NtSVcc6BLmEu5_xftUV373c"  # settings_account
    sheet_name = "test"
    gs = GoogleSheets(spreadsheets_id, user_name="bigwhitekmc")
    # gs = GoogleSheets(spreadsheets_id, user_name="bigwhitekmc", type="serviceAccount")
    # gs = GoogleSheets(spreadsheet_id, user_name="bigwhitekmc", type="oauth2", sn=0)
    cols = ['순번', '성명', '치료 내용']
    r = gs.read_sheet(sheet_name=sheet_name, sheet_range=None, cols=cols)
    # r = gs.read_sheet(sheet_name=sheet_name, sheet_range=None, cols=cols)
    print(r)

    # ## * write
    # spreadsheets_id = "108Iac6oFuDl051fnpD6uD5eIGS3sAz5t3c76GkeRk04"
    # sheet_name = "notion"
    # gs = GoogleSheets(spreadsheets_id)
    # data = [
    #     ['00Email', '01PW', '02Server', '03Usage', '04Remark', '05Created', '06Github_Account', '07Name', '08Tags', '09API_Account_DB']
    # ]
    # gs.write_sheet(sheet_name, sheet_range=None, data=data)
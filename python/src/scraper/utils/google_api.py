# -*- coding=utf-8 -*-
"""
주요 기능: GoogleAPI 연결, 기본 변수(file_id, mime_type) 설정
    - Google API Service 접속
        - user_nick(OAuth 2.0 Client ID)
        - bot_nick(Service Account)
        - api_key(API Key)  ## 구현되어 있지 않음
    - list: 파일/폴더 검색(file_type, query)
    - id_by_name: file_id 검색(app_name, file_name)
    - id_by_path: file_id 검색(app_name, file_path)

사용 방법: 
    - 

참조 자료:
    - 

필요 환경:
    - pip requirements:
    - pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib google-cloud

References
    - [Workspace for Developers](https://developers.google.com/workspace/guides/auth-overview?hl=en)
    - [Google Drive for Developers > Drive API(V3)](https://developers.google.com/drive/api/v3/reference)
    - [Google Drive for Developers > Drive API(V3) > Files](https://developers.google.com/drive/api/v3/reference/files)
"""

import os, sys
import json

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2 import service_account
from googleapiclient.discovery import build

sys.path.append(os.path.dirname(__file__))
from base_env import get_settings_root
from base_builtin import load_yaml


def _get_auth_paths(user_name='bigwhitekmc', type='oauth2', sn=0):
    root = get_settings_root('googleApis')
    return {
        'credentials': f"{root}/{type}_{user_name}_{sn}.json", 
        'token': f"{root}/token_{user_name}_{sn}.json",
        'scopes': f"{root}/spec/scopes_{user_name}_{sn}.json",
    }

def _get_service_version(service='sheets'):
    return json.load(open(f"{get_settings_root('googleApis')}/spec/google_api_version.json", "r", encoding="utf-8"))[service]


def _get_scopes(path, user_name='bigwhitekmc', sn=0):
    try:
        scopes = json.load(open(path, "r", encoding="utf-8"))
    except:
        scopes = json.load(open(f"{get_settings_root('googleApis')}/spec/scopes_default.json", "r", encoding="utf-8"))

    return scopes

def _google_apiKey(user_name='bigwhitekmc', sn=0):
    root = get_settings_root('googleApis')
    apikeys = load_yaml(f"{root}/apiKeys.yaml")
    return apikeys[user_name][sn]

def _google_credential_serviceAccount(user_name='bigwhitekmc', sn=0):
    paths = _get_auth_paths(user_name, 'serviceAccount', sn)
    SCOPES = _get_scopes(paths['scopes'], user_name, sn)

    return service_account.Credentials.from_service_account_file(paths['credentials'], scopes=SCOPES)

def _google_credential_oath2(user_name='bigwhitekmc', sn=0):
    creds = None
    paths = _get_auth_paths(user_name, 'oauth2', sn)
    SCOPES = _get_scopes(paths['scopes'], user_name, sn)

    if os.path.exists(paths['token']):
        creds = Credentials.from_authorized_user_file(paths['token'], SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                paths['credentials'], SCOPES)
            creds = flow.run_local_server(port=0)
        with open(paths['token'], 'w') as token:
            token.write(creds.to_json())

    return creds

def google_service(api_name='sheets', user_name='bigwhitekmc', type='oauth2', sn=0):
    if "auth" in type:
        return build(api_name, _get_service_version(api_name), credentials=_google_credential_oath2(user_name, sn))
    elif "service" in type:
        return build(api_name, _get_service_version(api_name), credentials=_google_credential_serviceAccount(user_name, sn))
    elif "key" in type.lower():
        return build(api_name, _get_service_version(api_name), developerKey=_google_apiKey(user_name, sn))

def _test_sheets(sheets, spreadsheet_id="1vLAcj8af9DQgOiTt_hhlCzhsiyXCTkHPpuTgPAl8_sQ", range='시트1'):
    request = sheets.get(spreadsheetId=spreadsheet_id, ranges=[], includeGridData=False)
    sheet_props = request.execute()
    data = sheets.values().get(spreadsheetId=spreadsheet_id, range=range).execute()['values']

    print(sheet_props["properties"]["title"])
    print(data)

if __name__ == '__main__':
    # # * Oauth2
    # * bigwhitekmc
    # service = google_service(api_name='sheets', name='bigwhitekmc', type='oauth2', sn=0)
    # _test_sheets(service.spreadsheets(), spreadsheet_id="1vLAcj8af9DQgOiTt_hhlCzhsiyXCTkHPpuTgPAl8_sQ", range='시트1')

    # youtube = build("youtube", "v3", credentials=_google_credential("bigwhitekmc", "oauth2", 0))
    youtube = google_service(api_name="youtube", user_name='bigwhitekmc', type='oauth2', sn=0)
    # youtube = google_service(api_name="youtube", user_name='bigwhitekmc', type='apiKey', sn=0)

    search_response=youtube.search().list(
        q="런업",
        order='relevance',
        part='snippet',
        maxResults=50,
    ).execute()
    print(search_response['items'][0])

    # # * serviceAccount
    # service = google_service(api_name='sheets', name='bigwhitekmc', type='serviceAccount', sn=0)
    # _test_sheets(service.spreadsheets(), spreadsheet_id="1vLAcj8af9DQgOiTt_hhlCzhsiyXCTkHPpuTgPAl8_sQ", range='시트1')



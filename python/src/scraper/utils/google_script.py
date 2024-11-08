# -*- coding=utf-8 -*-
"""
주요 기능: Youtube(API)
    - CRUD

사용 방법: 
    - 

참조 자료:
    - https://developers.google.com/apps-script/api/quickstart/python?hl=ko
    - https://developers.google.com/apps-script/api/how-tos/execute?hl=ko#python
    - https://developers.google.com/sheets/api/guides/values?hl=ko
    - https://developers.google.com/apps-script/api/reference/rest?hl=ko
"""

##@@@ Package/Module
##============================================================

##@@ Built-In Package/Module
##------------------------------------------------------------
import os, sys
import json
import ast
from collections import ChainMap

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


##@@@ Private Function
##============================================================

##@@ data
##------------------------------------------------------------


##@@@ Main Class
##============================================================
class Script():
    def __init__(self, script_Id="", user_name="bigwhitekmc", type="oauth2", sn=0):
        """__init__: Object 초기화
        """
        self.service = google_service('script', user_name, type, sn)
        self.scriptId = script_Id

    def run(self, body={}):
        return self.service.scripts().run(scriptId=self.scriptId, body=body).execute()  # {'done': True, 'response': {'@type': 'type.googleapis.com/google.apps.script.v1.ExecutionResponse'}}



if __name__ == "__main__":
    script = Script(user_name="bigwhitekmc", type="oauth2")

    # Google Cloud Platform(GCP) 프로젝트
    # script_id = "1n5Qmynl0CJmAWvLvo7ZaO00AVPoGWeGss7giTY24eKSCoAqWMvcMOqar"
    # script_id = "1n5Qmynl0CJmAWvLvo7ZaO00AVPoGWeGss7giTY24eKSCoAqWMvcMOqar"
    # script_id = "AKfycbwHIwZ_YRdAl_0FhfDgVYrIkQdLibI2F1A-SEC7vucJBlwde2DPTyMylL69iu3zT0Vv"  # APP 배포
    # request = {"function": "createKeepNote", "parameters": {"name": "Moon Jungsam"}}
    # * googlesheets https://docs.google.com/spreadsheets/d/1AsrbuJ8dIjIaDJi_meuDnwpDpNEFmPWpNkhe0NB3dl4/edit#gid=0
    script_id = "AKfycbzOhyxq1xp52TPQh7IUCymVALwHmV9g8nVVrCe_jdz_J4ppFv5ncRLchHunjQBQ149a"
    request = {"function": "writeToSheet"}
    response = script.service.scripts().run(scriptId=script_id, body=request).execute()
    print(response)

    {'done': True, 'response': {'@type': 'type.googleapis.com/google.apps.script.v1.ExecutionResponse', 'result': '[object Object] 테스트 중입니다.'}}

#     SAMPLE_CODE = """
# function helloWorld() {
#     console.log("Hello, world!");
# }
#     """.strip()

#     SAMPLE_MANIFEST = """
#     {
#         "timeZone": "America/New_York",
#         "exceptionLogging": "CLOUD"
#     }
#     """.strip()


#     request = {"title": "My Script"}
#     response = script.service.projects().create(body=request).execute()

#     # Upload two files to the project
#     request = {
#         "files": [
#             {"name": "hello", "type": "SERVER_JS", "source": SAMPLE_CODE},
#             {
#                 "name": "appsscript",
#                 "type": "JSON",
#                 "source": SAMPLE_MANIFEST,
#             },
#         ]
#     }
#     response = (
#         script.service.projects()
#         .updateContent(body=request, scriptId=response["scriptId"])
#         .execute()
#     )
#     print("https://script.google.com/d/" + response["scriptId"] + "/edit")


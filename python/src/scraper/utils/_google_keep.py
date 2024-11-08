# -*- coding=utf-8 -*-
"""
주요 기능: Youtube(API)
    - CRUD

사용 방법: 
    - 

참조 자료:
    - https://developers.google.com/youtube/v3/guides/authentication?hl=ko
    - https://developers.google.com/youtube/v3/code_samples/code_snippets?hl=ko
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


##@@@ Private Function
##============================================================

##@@ data
##------------------------------------------------------------


##@@@ Main Class
##============================================================
class GoogleKeep():
    def __init__(self, user_name="bigwhitekmc", type="oauth2", sn=0):
        """__init__: Object 초기화
        """
        self.service = google_service('keep', user_name, type, sn)
    
    def subscriptions(self, **kwargs):
        part = kwargs["part"] if "part" in kwargs else "id, snippet"
        mine = kwargs["mine"] if "mine" in kwargs else True
        maxResults = kwargs["maxResults"] if "maxResults" in kwargs else 100

        return self.service.subscriptions().list(
            part=part,
            mine=mine,
            maxResults=maxResults
        ).execute()

    def search(self, **kwargs):
        q = kwargs["q"] if "q" in kwargs else "gemini"
        order = kwargs["order"] if "order" in kwargs else 'relevance'
        part = kwargs["part"] if "part" in kwargs else "snippet"
        maxResults = kwargs["maxResults"] if "maxResults" in kwargs else 100

        return self.service.search().list(
            q=q,
            order=order,
            part=part,
            maxResults=maxResults
        ).execute()

    def get_channel_playlists(self, channel_id):
        request = self.service.playlists().list(
            part='snippet,contentDetails',
            channelId=channel_id,
            maxResults=25
        )
        response = request.execute()
        return response['items']

    def get_playlist_videos(self, playlist_id):
        videos = []
        request = self.service.playlistItems().list(
            part='snippet,contentDetails',
            playlistId=playlist_id,
            maxResults=50  # API 최대 제한
        )
        while request:
            response = request.execute()
            videos += response['items']
            request = self.service.playlistItems().list_next(request, response)
        return videos

    # def get_playlist_videos(self, playlist_id):
    #     request = self.service.playlistItems().list(
    #         part='snippet,contentDetails',
    #         playlistId=playlist_id,
    #         maxResults=200
    #     )
    #     response = request.execute()
    #     return response['items']

if __name__ == "__main__":
    keep = GoogleKeep(user_name="bigwhitekmc", type="serviceAccount")
    # 메모 목록 가져오기
    response = keep.service.notes().list().execute()
    notes = response.get('notes', [])

    # 메모 정보 출력
    for note in notes:
        print(f"메모 ID: {note['id']}")
        print(f"제목: {note['title']}")
        print(f"내용: {note['text']}")
        print("--------------------")
    ## * subscriptions
    # print(youtube.subscriptions())
    # * search
    # print(youtube.search(q="dimabulsa"))  # 'channelId': 'UCmVabiNHXE8wzBiLyOTnHAA'

    # # *
    # pl = youtube.get_channel_playlists("UCmVabiNHXE8wzBiLyOTnHAA")
    # print(len(pl))
    # print(youtube.get_channel_playlists("UCmVabiNHXE8wzBiLyOTnHAA"))

    # # *
    # vs = youtube.get_playlist_videos("PLREStM4P8POmGvEi96WfwDq7m_ZhgWC41")
    # vs = youtube.get_playlist_videos("PLd7hl1qz-dvHER9w6Z8dErELYdKdaz0Gg")
    # print(len(vs))


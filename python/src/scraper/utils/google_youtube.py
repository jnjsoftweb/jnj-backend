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
from collections import ChainMap

sys.path.append(os.path.dirname(__file__))
from google_api import google_service

##@@ External Package/Module
##------------------------------------------------------------


##@@@ Constant/Varible
##============================================================

##@@ Constant
##------------------------------------------------------------
SNIPPET_KEYS = ['channelId', 'publishedAt', 'title', 'description', 'thumbnail']

##@@ Variable(Golobal)
##------------------------------------------------------------


##@@@ Private Function
##============================================================

##@@ data
##------------------------------------------------------------
def _flatten_snippet(snippet={}, keys=['channelId', 'publishedAt', 'title', 'description', 'thumbnail'], thumbnail='high'):
    dct = {}
    for key in keys:
        if key == 'thumbnail':
            try:
                dct[key] = '=image("' + snippet['thumbnails'][thumbnail]['url'] + '")'
            except:
                dct[key] = ""
        elif '_ko' in key:
            dct[key] = snippet['localized'][key.split("_")[0]]
        else:
            dct[key] = snippet[key]
    return dct

##@@@ Main Class
##============================================================
class Youtube():
    def __init__(self, user_name="bigwhitekmc", type="oauth2", sn=0):
        """__init__: Object 초기화
        """
        self.service = google_service('youtube', user_name, type, sn)

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

    def channelId_by_customUrl(self, customUrl):
        return self.search(q=customUrl)['items'][0]['id']['channelId']

    def _subscriptions(self, **kwargs):
        part = kwargs["part"] if "part" in kwargs else "id,snippet"
        mine = kwargs["mine"] if "mine" in kwargs else True
        maxResults = kwargs["maxResults"] if "maxResults" in kwargs else 100

        return self.service.subscriptions().list(
            part=part,
            mine=mine,
            maxResults=maxResults
        ).execute()

    def subscriptions(self, **kwargs):
        items = self._subscriptions(**kwargs)['items']
        dicts = []
        for item in items:
            # dicts.append(ChainMap({'id': item['id']}, _flatten_snippet(item['snippet'])))
            dct = {'id': item['id']}
            dct.update(_flatten_snippet(item['snippet']))
            dicts.append(dct)
        return dicts

    def _channel_info(self, channel_id):
        return self.service.channels().list(
            part='snippet,contentDetails',
            id=channel_id,
            maxResults=25
        ).execute()

    def channel_info(self, channel_id, thumbnail="high"):
        info = self._channel_info(channel_id)['items'][0]
        related = info['contentDetails']['relatedPlaylists']

        dct = {'channelId': channel_id}
        dct.update(_flatten_snippet(info['snippet'], ['customUrl'] + SNIPPET_KEYS[1:] + ['title_ko', 'description_ko'], thumbnail=thumbnail))
        dct.update({'likes': related['likes'], 'uploads': related['uploads']})
        return dct

    def channel_info_by_customUrl(self, customUrl, thumbnail="high"):
        return self.channel_info(self.channelId_by_customUrl(customUrl), thumbnail="high")

    def _channel_playlists(self, channel_id):
        playlists = []
        request = self.service.playlists().list(
            part='snippet,contentDetails',
            channelId=channel_id,
            maxResults=50
        )
        while request:
            response = request.execute()
            playlists += response['items']
            request = self.service.playlistItems().list_next(request, response)
        return playlists

    def channel_playlists(self, channel_id, thumbnail='high'):  # standard
        dicts = []
        for item in self._channel_playlists(channel_id):
            # dicts.append(ChainMap({'id': item['id']}, _flatten_snippet(item['snippet'])))
            dct = {'playlistId': item['id']}
            dct.update(_flatten_snippet(item['snippet'], SNIPPET_KEYS + ['title_ko', 'description_ko'], thumbnail=thumbnail))
            dct.update({'itemCount': item['contentDetails']['itemCount']})
            dicts.append(dct)
        return dicts

    def channel_playlists_by_customUrl(self, customUrl):
        return self.channel_playlists(self.channelId_by_customUrl(customUrl))

    def _videos_by_playlist(self, playlist_id):
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

    def videos_by_playlist(self, playlist_id, thumbnail='high'):  # standard
        dicts = []
        for item in self._videos_by_playlist(playlist_id):
            # dct = {'videoId': item['id']}
            dct = {'videoId': item['contentDetails']['videoId']}
            dct.update(_flatten_snippet(item['snippet'], SNIPPET_KEYS, thumbnail=thumbnail))
            # dct.update({'itemCount': item['contentDetails']['itemCount']})
            dicts.append(dct)
        return dicts


if __name__ == "__main__":
    youtube = Youtube(user_name="bigwhitekmc")
    # * search
    # print(youtube.search(q="dimabulsa"))  # 'channelId': 'UCmVabiNHXE8wzBiLyOTnHAA'

    # # * channelId_by_customUrl
    # vs = youtube.channelId_by_customUrl("dimabulsa")
    # print(vs)

    # # * subscriptions
    # # print(youtube.subscriptions())
    # print(youtube.subscriptions()[0])
    # # print(youtube._subscriptions()["items"][0])

    ## * channel_info
    # info = youtube.channel_info(channel_id="UCSOYuo3uOG3GCUFIeB4or7A")
    # info = youtube.channel_info(youtube.channelId_by_customUrl("aischool_ai"))
    # print(info)

    # # * channel_playlists
    # print(youtube.channel_playlists("UCmVabiNHXE8wzBiLyOTnHAA"))
    # print(youtube.channel_playlists_by_customUrl("aischool_ai"))

    # # * videos_by_playlist
    # vs = youtube.videos_by_playlist("PLd7hl1qz-dvHER9w6Z8dErELYdKdaz0Gg")
    # print(vs)


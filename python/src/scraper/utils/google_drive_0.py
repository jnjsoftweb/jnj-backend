# -*- coding=utf-8 -*-
"""
주요 기능: Google Drive(API)
    - Google Drive Service 연결
        - GoogleAuth(Super Class) 이용
        - google 사용자 계정(user_nick), google 프로젝트 봇 계정(bot_nick)에 적용 가능
    - Google Drive 상용 기능 함수화(Find/Create/Updata/Delete/Upload/Download)
        - 단일 계정 내부 함수
            - list: GoogleAPI(super class) 상속
            - read: file 내용(Non-Google 파일)
            - write: file 변경(Non-Google 파일)
            - create: create_file / create_folder
            - update: update_file / update_folder
            - download: 
            - delete: delete_file / delete_folder
            - copy: 파일 복사
            - move: 소스 폴더의 해당파일 목적 폴더로 이동
            - move_all: 소스 폴더의 모든 파일을 목적 폴더로 이동

        - 복수 계정간 함수
            - move_to
            - copy_to
            - _copy_to_colab
            - _copy_to_sheets

    - 로컬 드라이브에 적용
        - 로컬: Jupyter Server 실행
        - Colab: 로컬 런타임에 연결

사용 방법:
    ```
    gds = GoogleDrive(user_nick="master", path="/__COLAB/_TEST")
    gds.list(type="file")
    ```

참조 자료:
    - 

필요 환경:
    - 인증 관련 json 파일
    - super class: Google.Google
    - requirements: 
    - python:
References
    - [Google Drive for Developers > Drive API(V3)](https://developers.google.com/drive/api/v3/reference)
    - [Google Drive for Developers > Drive API(V3) > Files](https://developers.google.com/drive/api/v3/reference/files)
"""

##@@@ Package/Module
##============================================================

##@@ Built-In Package/Module
##------------------------------------------------------------
import os
import sys
import io
import json

# from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from googleapiclient.http import MediaIoBaseUpload

if not __package__:
    sys.path.append(os.path.join(os.path.dirname(__file__), "../builtin"))
    from util_data import (_file_list, _folder_list, _split_path, _write_file)
    sys.path.append(os.path.join(os.path.dirname(__file__), "."))
    from google_api import GoogleAPI
else:
    from builtin.util_data import (_file_list, _folder_list, _split_path, _write_file)
    from .google_api import GoogleAPI

##@@@ Constant/Varible
##============================================================

##@@ Constant
##------------------------------------------------------------


##@@ Variable(Golobal)
##------------------------------------------------------------

##@@@ Private Function
##============================================================


##@@ sub function
##------------------------------------------------------------

##@@@ Main Class
##============================================================
class GoogleDrive(GoogleAPI):
    def __init__(self, user_nick=None, bot_nick=None, path=None, id=None):
        """__init__: Object 초기화
        Desc:
            - Google Drive Service 연결(user_nick)
            - path 폴더 기준

        Args:
            - user_nick(str, None): 구글계정 별칭(master: monblue@snu.ac.kr / moonitdev: moonitdev@gmail.com / ...)
            - bot_nick(str, None): GCP(google cloud platform) Project 서비스 계정(Bot) 별칭(mats, moonMaster, ...)
            - path(str, None): Google Drive 기준 폴더(경로) 예) __COLAB/_TEST

        Usages:
            - [description]
        """
        super().__init__("drive", user_nick=user_nick, bot_nick=bot_nick)
        # self.service = build("drive", self.version["drive"], credentials = self.credentials)
        self.path = path
        self.id = id if id else self.id_by_path(path, auto_create=True)  # GoogleAPI에서 상속


    ##@@ Private Function
    ##------------------------------------------------------------

    ##@ Inner Google Drive
    ##------------------------------------------------------------
    def _root_folder_id(self):
        return "root"


    def _change_path(self, path):
        self.path = path
        self.id = self.id_by_path(path, auto_create=True)  # GoogleAPI에서 상속
    

    def list(self, path=None, out_type="dict"):
        path = self.path if not path else path
        parents_id = self.id if path == self.path else self.id_by_path(path, auto_create=True)  # GoogleAPI에서 상속

        results = self.drive.files().list(
            # q = "trashed = false and '{parents_id}' in parents",
            # q = "mimeType != 'application/vnd.google-apps.folder' and trashed = false and '1Or703wGwZ-Fs-E67xmZkhWj3YCwcS5Ki' in parents",
            q = f"trashed = false and '{parents_id}' in parents",
            fields = "nextPageToken, files(id, name, mimeType, parents)"
        ).execute()
        print(f"{parents_id=}")
        if out_type == "dict":
            results = {item['name']: item['id'] for item in results.get('files', [])}
        
        return results    


    def _read(self, file_id, dst_mime=None, stream=False):
        # print(f"file_id: {file_id}")
        src_mime = self._meta_data(file_id, fields="mimeType")['mimeType']
        dst_mime = self.mime_type[f"{src_mime}_"] if f"{src_mime}_" in self.mime_type else src_mime  # NOTE: export mime type이 있는 경우 "_{mimetype}" mimetype 변경
        if src_mime == dst_mime:  ## 직접 읽기(google 편집 문서가 아닌 경우)
            media = self.service.files().get_media(fileId=file_id)
        else:  ## export(google 편집 문서)
            media = self.service.files().export_media(fileId=file_id, mimeType=dst_mime)

        if stream:
            return media
        else:
            return media.execute()


    def _copy(self, file_id, name=None):
        # https://developers.google.com/drive/api/v3/reference/files/copy
        # name: 파일 이름
        # parents: 목적 폴더
        # NOTE: mimeType: mime_type 변경시 <- type="colab"
        # if 'type' in dst_meta_data:
        #     dst_meta_data['mimeType'] = self.mime_type[dst_meta_data.pop('type')]
        return self.service.files().copy(
            fileId = file_id,
            name = name,
        ).execute()


    def _move(self, file_id, src_folder_id, dst_folder_id):
        return self.service.files().update(
                fileId = file_id,
                addParents = dst_folder_id,
                removeParents = src_folder_id
        ).execute()


    def _move_all(self, src_folder_id, dst_folder_id):
        query = f"parents = '{src_folder_id}' and trashed = false"
        response = self.service.files().list(q=query).execute()
        files = response.get('files')
        nextPageToken = response.get('nextPageToken')

        while nextPageToken:
            response = self.service.files().list(q=query, pageToken=nextPageToken).execute()
            files.extend(response.get('files'))
            nextPageToken = response.get('nextPageToken')
        
        for f in files:
            if f['mimeType'] != 'application/vnd/google-apps.folder':  ## NOTE: folder가 아닌 파일만
                self._move(f.get('id'), src_folder_id, dst_folder_id)


    def _write(self, file_id, data=None, meta_data={}, in_type="text"):
        _meta_data = self._meta_data(file_id=file_id, fields="name, mimeType, parents")
        """
        file update / create
        """
        parents = _meta_data.pop("parents")
        # print(f"data: {data}, _meta_data: {_meta_data}")
        # _meta_data["fileId"] = file_id

        if data and _meta_data:
            meta_data = dict(_meta_data, **meta_data)
            mime_type = meta_data["mimeType"]
            if in_type[0].lower() == "t": ## 
                media_body = MediaIoBaseUpload(io.BytesIO(json.dumps(data).encode('utf-8')), mime_type, resumable=True)  ## NOTE: string(text)
            elif in_type[0].lower() == "b":  ## binary data
                media_body = MediaIoBaseUpload(io.BytesIO(data), mime_type, resumable=True)  ## NOTE: Google Drive File
            elif in_type[0].lower() == "g" or in_type[0].lower() == "g":  ## google drive file_id
                media_body = MediaIoBaseUpload(io.BytesIO(self.drive.files().get_media(fileId=data).execute()), mime_type, resumable=True)  ## NOTE: Google Drive File
            else:  ## local drive file_path
                media_body = MediaFileUpload(data, mimetype=mime_type, resumable=True)  ## NOTE: Local File

            ## NOTE: update file
            return self.drive.files().update(
                fileId = file_id,
                body = meta_data,
                media_body = media_body
            ).execute()

            ## NOTE: create file
            # dst_meta = {
            #     "name": dst_name,
            #     "parents": [dst_folder_id],
            #     "mimeType": dst_mime
            # }
            # media = MediaFileUpload(src_path, mimetype=src_mime, resumable=True)
            # self.service.files().create(body=dst_meta, media_body=media, fields='id').execute()

            ## create file
            # return self.drive.files().create(
            #     fileId = file_id,
            #     body = meta_data,
            #     media_body = media_body
            # ).execute()

        else:
            # print("해당 파일이 없습니다.")
            return None


    def _delete_file_by_file_id(self, file_id):
        """파일 삭제(file id)

        Args:
            file_id (str): 삭제할 파일의 file_id
        """
        return self.service.files().delete(fileId=file_id).execute()


    def _share_file(self, file_id, user_permission, domain_permission):
        def callback(request_id, response, exception):
            if exception:
                # Handle error
                print(exception)
            else:
                print("Permission Id: %s" % response.get('id'))

        batch = self.service.new_batch_http_request(callback=callback)
        user_permission = {
            'type': 'user',
            'role': 'writer',
            # 'role': 'owner',
            'emailAddress': 'moonitdev@gmail.com'
            # 'emailAddress': 'monblue@snu.ac.kr'
        }
        batch.add(self.service.permissions().create(
            fileId = file_id,
            body = user_permission,
            fields = 'id',
        ))
        domain_permission = {
            'type': 'domain',
            'role': 'reader',
            'domain': 'example.com'
        }
        batch.add(self.service.permissions().create(
            fileId = file_id,
            body = domain_permission,
            fields='id',
        ))
        batch.execute()


    ##@ Google Drive - Local Drive
    ##------------------------------------------------------------
    # def _download(self, file_id, dst_path=None, mode='wb'):
    def _download(self, src_id, dst_path, dst_mime=None):
        """파일 다운로드(file_id)

        Args:
            file_id (str): 다운로드할 파일의 file_id
            dst_path (str): 저장할 경로
            type (str): 다운로드할 파일 타입('binary': 이진 파일 / 'text': 텍스트 파일)
        """
        data = self._read(src_id, dst_mime=dst_mime, stream=False)
        _write_file(data, dst_path, mode="wb", ext=False)
        # fh = open(dst_path, mode)
        # fh = io.FileIO(dst_path, 'wb')
        # downloader = MediaIoBaseDownload(fh, data)
        # done = False
        # while done is False:
        #     status, done = downloader.next_chunk()
        #     # print(f"Download {int(status.progress() * 100)}")


    def _upload(self, src_path, dst_name, dst_folder_id, src_mime="application/vnd.ms-excel", dst_mime="application/vnd.google-apps.spreadsheet"):
        dst_meta = {
            "name": dst_name,
            "parents": [dst_folder_id],
            "mimeType": dst_mime
        }
        media = MediaFileUpload(src_path, mimetype=src_mime, resumable=True)
        self.service.files().create(body=dst_meta, media_body=media, fields='id').execute()


    ##@ Google Drive1 - Google Drive2
    ##------------------------------------------------------------


    ##@@ Public Function
    ##------------------------------------------------------------
    # def list(self): # GoogleAPI에서 상속
    #     pass


    def create_folder(self, path):
        (parents_path, name) = path.rsplit("/", 1)
        parents_id = self.id_by_path(parents_path)  # GoogleAPI에서 상속
        return self._create_folder_by_parents_id(name, parents_id)


    def change_id(self, id):
        self.id = id


    def change_folder(self, path):
        self._set_id(path)


    def read(self, file_path, encoding="utf-8"):
        """
        TODO: encoding이 언제나 필요한 것인지 확인
        """
        return self._read(self.id_by_path(file_path)).decode(encoding)


    def move(self, file_id, src_folder_path, dst_folder_path):
        return self._move(file_id, self.id_by_path(src_folder_path, auto_create=False), self.id_by_path(dst_folder_path, auto_create=True))


    def move_all(self, src_folder_path, dst_folder_path):
        self._move_all(self.id_by_path(src_folder_path, auto_create=False), self.id_by_path(dst_folder_path, auto_create=True))


    def delete(self, path):
        return self._delete_file_by_id(self.id_by_path(path))

    ##@ Google Drive - Local Drive
    ##------------------------------------------------------------
    def upload_folder(self, src_root, dst_root, exts=[], ignores=[], recursive=True):
        """폴더 내의 파일 업로드
        TODO: recursive 지정 옵션 작동하는지 확인
        """
        print(f"{src_root=}")
        folders = [src_root] + _folder_list(src_root, ignores, recursive=recursive)
        print(f"{folders=}")
        for folder in folders:
            path = folder.replace(src_root, dst_root)  # id_by_path(path)
            path = path[:-1] if path[-1] == "/" else path
            dst_folder_id = self.id_by_path(path)

            files = _file_list(path=folder, finds=["*." + ext for ext in exts], recursive=recursive)
            print(f"{files=}")
            for src_path in files:
                (folder, name, ext) = _split_path(src_path)
                src_mime = self.mime_type[ext]
                dst_mime = self.mime_type[f"_{ext}"] if f"_{ext}" in self.mime_type else src_mime  # NOTE: import mime type이 있는 경우 "_{mimetype}" mimetype 변경
                name = name if f"_{ext}" in self.mime_type else f"{name}.{ext}"   # NOTE: import mime type이 있는 경우 파일 이름에서 ext(확장자) 제거
                self._upload(src_path, name, dst_folder_id, src_mime=src_mime, dst_mime=dst_mime)


    def download_folder(self, src_root="", dst_root=""):
        parents_id = self.id if not src_root else self.id_by_path(src_root) if "/" in src_root else src_root
        src_root = src_root if "/" in src_root else self.path_by_id(parents_id)
        print(f"src_root: {src_root}")
        folders = self._children_by_parents_id(parents_id=parents_id, type="folder")

        for folder in folders:
            files = self._children_by_parents_id(parents_id=folder['id'], type="file")
            for file in files:
                # print(f"path: {gd.path_by_id(file['id']).replace(src_root, '')}")
                dst_path = f"{dst_root}/{self.path_by_id(file['id'])}".replace(src_root, '').replace("//", "/")
                src_mime = file['mimeType']
                dst_path = dst_path + "." + self.mime_type[f"{src_mime}_ext"] if f"{src_mime}_" in self.mime_type else dst_path  # NOTE: export mime type이 있는 경우 파일 이름에 ext(확장자) 추가

                self._download(file['id'], dst_path)


    # def _save_text(self, data, path, mimeType="text/markdown"):
    def _save_text(self, data, path=None, folder_id=None):
        """
        "mimeType": "text/plain" / "text/markdown"
        """
        ext = path.rsplit(".", 1)[1] if len(path.rsplit(".")) == 1 else "txt"
        mimeType = self.mime_type[ext]

        (parents_id, name) = (folder_id, path)
        if not folder_id:  # NOTE: folder_id가 없는 경우
            (parent_folder, name) = path.rsplit("/", 1)
            parents_id = self.id_by_path(parent_folder, auto_create=True)

        dst_meta = {
            "name": name,
            "parents": [parents_id],
            "mimeType": mimeType
        }
        media_body = MediaIoBaseUpload(io.BytesIO(data.encode('utf-8')), mimeType)
        self.service.files().create(body=dst_meta, media_body=media_body, fields='id').execute()
    

if __name__ == "__main__":
    gd = GoogleDrive(bot_nick="moonsats", path="__SATS/REFERENCE/_documents", id=None)
    # # gd = GoogleDrive(bot_nick="moonsats", path="__SATS/REFERENCE/_documents", id="1hUntmyTnForCNqq1jMyaNmvdwl6KZYKU")
    # r = gd.list(path="__SATS/REFERENCE/_documents/images", out_type="dict")
    # print(r)
    # list(self, path=None, out_type="dict")
    # list(self, path=None, out_type="dict")
    # data = """
    # # title1
    # content1
    # """
    data = """
    <html>
    </html>
    """
    # r = gd.id_by_path("__SATS/REFERENCE/scraps/layhope", auto_create=True)
    # print(r)
    gd._save_text(data, "__SATS/REFERENCE/scraps/_test/test1.html")
    # gd._save_text(data, "__SATS/REFERENCE/scraps/layhope/test2.md", mimeType="text/markdown")

# -*- coding=utf-8 -*-
"""
Functions: Google Drive(API)
    - Google Drive Service 연결
        - GoogleAuth(Super Class) 이용
        - google 사용자 계정(user_nick), google 프로젝트 봇 계정(bot_nick)에 적용 가능
    - Google Drive 상용 기능 함수화(Find/Create/Updata/Delete/Upload/Download)
        - 단일 계정 내부 함수
            - list: 파일 목록
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

Usages: 
    ```
    gds = GoogleDrive(user_nick="master", path="/__COLAB/_TEST")
    gds.list(type="file")
    ```

Environments:
    - 인증 관련 json 파일
    - super class: Google.Google
    - requirements: 
    - python:

References
    - [Google Drive for Developers > Drive API(V3)](https://developers.google.com/drive/api/v3/reference)
    - [Google Drive for Developers > Drive API(V3) > Files](https://developers.google.com/drive/api/v3/reference/files)
"""

# & Import AREA
# &----------------------------------------------------------------------------

"""# Builtin Modules
"""
import os, sys
import json
import io

"""# Installed Modules
"""
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from googleapiclient.http import MediaIoBaseUpload

"""# Custom Modules
"""
sys.path.append(os.path.dirname(__file__))
from google_api import google_service

# & Variable AREA
# &----------------------------------------------------------------------------

"""# Variables, Constants and Literals
"""

# & Function AREA
# &----------------------------------------------------------------------------

"""# Private Functions
"""


# def _get_path(path_type, user_nick="", configs_folder=CLOUD_CONFIGS_FOLDER):
    # """

    # """
    # path = configs_folder[:-1] if configs_folder[-1] == "/" else configs_folder
    # if path_type == 'mime_type':  # mime_type
    #     path += f"/google_mime_type.json"
    # elif path_type == 'export_map':  # export_map (구글 편집 문서 export) 
    #     path += f"/google_export_map.json"

    # return path


def _set_mime_type():
    with open(r"C:\JnJ-soft\Developments\_Settings\Apis\google\spec\google_mime_type.json", 'r') as f:
        return json.load(f)


def _set_export_map():
    with open(r"C:\JnJ-soft\Developments\_Settings\Apis\google\spec\google_export_map.json", 'r') as f:
        return json.load(f)


# & Class AREA
# &----------------------------------------------------------------------------
class GoogleDrive():
    # def __init__(self, id=None, path = path, user_name="bigwhitekmc", type="oauth2", sn=0):
    def __init__(self, **kwargs):
        """__init__: Object 초기화
        """
        id = kwargs["id"] if "id" in kwargs else None
        path = kwargs["path"] if "path" in kwargs else None
        user_name = kwargs["user_name"] if "user_name" in kwargs else "bigwhitekmc"
        type = kwargs["type"] if "type" in kwargs else "oauth2"
        sn = kwargs["sn"] if "sn" in kwargs else 0

        self.id = id
        self.path = path
        self.service = google_service('drive', user_name, type, sn)
        self.mime_type = _set_mime_type()
        self.export_map = _set_export_map()  # google workspace 문서 export

    ##@@ Private Function
    ##------------------------------------------------------------
    @staticmethod
    def _path_split(path, separator="/"):
        path = path.replace("\\", "/")
        return path if type(path) == list else path.split(separator) if type(path) == str else None ## NOTE: path를 list 형식으로 변경


    def _meta_data(self, file_id, fields="id, name, parents, mimeType"):
        if not file_id:
            return None
        return self.service.files().get(fileId=file_id, fields=fields).execute()


    def _is_folder(self, file_id):
        meta_data = self._meta_data(file_id)
        if not meta_data:  # 해당 file_id 파일/폴더가 존재하지 않음
            return None
        elif 'folder' in meta_data['mimeType']:  # 폴더
            # print(f"True:: meta_data['mimeType']: {meta_data['mimeType']}")
            return True
        else:  # 파일
            # print(f"False: meta_data['mimeType']: {meta_data['mimeType']}")
            return False


    def _query_mime_type(self, type=None):
        # print(f"type: {type}")
        # print(f"self.mime_type[type]: {self.mime_type[type]}")
        if type == None:
            return None
        elif type == 'file':
            query = "mimeType != 'application/vnd.google-apps.folder'"
        else:
            query = f"mimeType = '{self.mime_type[type]}'"
        return query


    def _query(self, type=None, queries=[]):
        return " and ".join(queries if type is None else [self._query_mime_type(type)] + queries)


    def _list(self, type=None, queries=[], parents_id=None, trashed=False, out_type="dict"):
    # def _list(self, queries=[], parents_id=None, trashed=False, out_type="dict"):
        """list_of_book: google sheets 전체 목록
        Desc:
            - type(str, None): app_name / file type_nick  예) sheets, script, xlsx, json, ...
            - queries(list, []): 검색 쿼리 리스트: ["name = 'file_name1'", ...]
            - trashed(bool, False): 휴지통에 있는 파일 검색 여부 

        Returns:
            - list: file type, queries에 해당하는 folder/file 리스트
        """
        # print(f"_list:: parents_id: {parents_id}")
        # type = self.api_name if type == None else type
        # print(f"mimetype: {_APP_NAME_MAP[app]['mimeType']}")

        queries = queries + ["trashed = false"] if trashed == False else queries + ["trashed = true"]
        query = self._query(type=type, queries=queries)
        # print(f"_list:: query: {query}")
        if parents_id:  #@@@@ parents_id가 있으면
            query += f" and '{parents_id}' in parents"

        results = self.service.files().list(
            q = query,
            fields = "nextPageToken, files(id, name, mimeType, parents)"
        ).execute()

        if out_type == "dict":
            results = {item['name']: item['id'] for item in results.get('files', [])}
        
        return results


    def _id_by_name(self, name, type=None, queries=[], trashed=False):
        # type = self.api_name if type == None else type
        queries = [f"name = '{name}'"] + queries
        files = self._list(type=type, queries=queries, trashed=trashed, out_type="dict")
        return files[name] if files else None


    def _children_by_parents_id(self, parents_id=None, type=None, queries=[]):
        # type = self.api_name if type == None else type
        # print(f"_children_by_parents_id:: {parents_id}")
        return self._list(type=type, queries=queries, parents_id=parents_id, trashed=False, out_type="list").get("files", [])
        # query = f"'{parents_id}' in parents"
        # if folder:
        #     query += " and mimeType = 'application/vnd.google-apps.folder'"

        # return self.service.files().list(
        #     q = query, 
        #     fields="nextPageToken, files(id, name)"
        # ).execute().get('files', [])


    def _child_id_by_name(self, parents_id, child_name, type=None):
        # type = self.api_name if type == None else type
        # print(f"parents_id, child_name: {parents_id}, {child_name}")
        children = [d for d in self._children_by_parents_id(parents_id=parents_id) if d.get("name", []) == child_name]
        return children[0]['id'] if len(children) > 0 else None


    def _parents_id_by_file_id(self, file_id):
        response = self.service.files().get(fileId=file_id, fields="parents").execute()
        if response:
            return response["parents"][0]
        else:
            return "root"


    def _path_info(self, path=None, separator="/", last_type=''):
        """
        return: 
        {'parts': [], 'last_type': 'folder', 'first_None': None}
        parts(path 구성 요소 {'name': 'id'}): [{'name': '', 'id': 'root'}, {'name': 'folder1', 'id':'folder_id1'}, ... {'name': 'folder_i', 'id': None},... {'name': 'folder_n', 'id': None}]
        last_type(마지막 요소 타입 folder/file/None): 
        first_None(첫번째 None(존재하지 않는 폴더/파일) 출현 index, int/None)
        ## TODO: path에 파일이름이 포함되어 있는 경우, 폴더만 출력하기(folder=True)
        """
        path_info = {'parts': None, 'first_None': None, 'last_type': 'file'}
        path = path.strip()  # TODO: None 처리
        path = path[:-1] if path[-1] == "/" else path  ## TODO: 마지막 문자가 "///" 형태인 경우도 적용되도록
        names = self._path_split(path, separator=separator) ## NOTE: path를 list 형식으로 변경
        if not names:
            return path_info

        paths = [{"name": name, "id": None} for name in names]
        # print(f"paths: {paths}")
        file_id = "root" if names[0].lower() in ["", "내 드라이브", "my drive", "mydrive", "drive"] else self._id_by_name(names[0])
        # paths[0] = {names[0]: file_id}
        paths[0] = {"name": names[0], "id": file_id}

        for i, name in enumerate(names[:-1]):
            _file_id = self._child_id_by_name(file_id, names[i+1])
            # paths[i+1] = {names[i+1]: _file_id}
            paths[i+1] = {"name": names[i+1], "id": _file_id}
            if _file_id == None:
                # paths[i+1] = {names[i+1]: file_id}
                paths[i+1] = {"name": names[i+1], "id": file_id}
                if last_type == 'folder':  # NOTE: folder type이 아니면
                    path_info['first_None'] = i+1
                    path_info['last_type'] = 'folder'
                else:
                    if i != len(names) - 2:  # NOTE: 마지막항이면 무시 why?
                        path_info['first_None'] = i+1
                        path_info['last_type'] = None
                break
            file_id = _file_id

        path_info['parts'] = paths

        if self._is_folder(paths[-1]["id"]):
            path_info['last_type'] = 'folder'

        return path_info


    def _create_folder_by_parents_id(self, name, parents_id=None):
        parents_id = self.id if parents_id == None else parents_id
        return self.service.files().create(
            body = {
                'name': name,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [parents_id]
            },
            fields = 'id'
        ).execute().get('id', None)


    def _create_folders_by_path_info(self, path_info, last_type="folder"):
        """
        paths: [{'name': '', 'id': 'root'}, {'name': 'folder1', 'id':'folder_id1'}, ... {'name': 'folder_i', 'id': None},... {'name': 'folder_n', 'id': None}]
        last_type: 폴더 생성시 사용 / folder: 마지막 path 항목까지 폴더 생성, 이외에는 마지막 path 항목 생성하지 않음
        """
        parts = path_info['parts']
        start = path_info['first_None']
        # print(f"create_folder start: {start}")
        if start:  # 존재하지 않는 폴더/파일이 있다면
            end = None
            if path_info['last_type'] == 'file' or last_type != 'folder':
                end = -1  # 마지막 항목은 폴더 생성하지 않음(폴더가 아니므로)
        
            for i, part in enumerate(parts[start:end]): # 첫번째 존재하지 않는 폴더 항부터
                # print(f"create_folder: {part['name']}, parent: {parts[start-1 + i]['id']}")
                part['id'] = self._create_folder_by_parents_id(part['name'], parents_id=parts[start-1 + i]['id'])

        return path_info


    ##@@ Public Function
    ##------------------------------------------------------------
    def list(self, file_type=None, out_type="list"):
        return self._list(type=file_type, out_type=out_type)


    # def id_by_name(self, name, app="sheets"):
    def id_by_name(self, name, file_type=None):
        return self._id_by_name(name, type=file_type)


    def name_by_id(self, file_id):
        return self.service.files().get(fileId=file_id, fields="name").execute()["name"]


    def id_by_path(self, path=None, separator="/", auto_create=True, last_type="folder"):
        ## @@@ TODO: len(paths) == 0, len(paths) == 1인 경우 처리
        """
        return: [{'': 'root'}, {'folder1': 'folder_id1'}, ... {'folder_i': None},... {'folder_n': None}]
        ## TODO: path에 파일이름이 포함되어 있는 경우, 폴더만 출력하기(folder=True)
        auto_create: 해당 경로가 없으면 폴더 생성
        last_type: 폴더 생성시 사용 / folder: 마지막 path 항목까지 폴더 생성, 이외에는 마지막 path 항목 생성하지 않음
        """
        path = '/' if path == None else path
        path_info = self._path_info(path=path, last_type=last_type)

        if auto_create:  # 폴더 자동 생성
            path_info = self._create_folders_by_path_info(path_info, last_type=last_type)  # 마지막 생성된 folder id(마지막 항목이 파일인 경우: 위의 parents_id와 동일)
            # print(path_info)

        return path_info['parts'][-1]['id']


    def path_by_id(self, file_id, root=""):
        path = [self.name_by_id(file_id)]
        # print(f"path: {path}")
        while file_id != "root":
            file_id = self._parents_id_by_file_id(file_id)
            if file_id == "root":
                break
            file_name = self.name_by_id(file_id)
            path.append(file_name)
        return "/".join(reversed(path))

    ##@@ @@@@ Public Function 2
    ##------------------------------------------------------------
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

        results = self.service.files().list(
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
                media_body = MediaIoBaseUpload(io.BytesIO(self.service.files().get_media(fileId=data).execute()), mime_type, resumable=True)  ## NOTE: Google Drive File
            else:  ## local drive file_path
                media_body = MediaFileUpload(data, mimetype=mime_type, resumable=True)  ## NOTE: Local File

            ## NOTE: update file
            return self.service.files().update(
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
            # return self.service.files().create(
            #     fileId = file_id,
            #     body = meta_data,
            #     media_body = media_body
            # ).execute()

        else:
            # print("해당 파일이 없습니다.")
            return None


    def _delete_file_by_id(self, file_id):
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
            print(f"{parents_id=}")

        dst_meta = {
            "name": name,
            "parents": [parents_id],
            "mimeType": mimeType
        }
        media_body = MediaIoBaseUpload(io.BytesIO(data.encode('utf-8')), mimeType)
        self.service.files().create(body=dst_meta, media_body=media_body, fields='id').execute()


# & Execution AREA
# &----------------------------------------------------------------------------
if __name__ == "__main__":
    gd = GoogleDrive()
    # path = gd.path_by_id("1DaorTd4GowGbOeuLhbx8NtSVcc6BLmEu5_xftUV373c", root="")
    # print(path)
    # id = gd.id_by_path(path='내 드라이브/치료실일지/치료실일지_202403', separator="/", auto_create=False, last_type="folder")
    # print(id)
    # print(gd.list("sheets"))

    data = """
    <html>
    </html>
    """
    gd._save_text(data, path="내 드라이브/_temp/test.txt", folder_id=None)
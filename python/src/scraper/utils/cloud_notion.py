from dotenv import load_dotenv
from operator import itemgetter
import os, sys
from notion_client import Client
from notion_client.helpers import collect_paginated_api

sys.path.append(os.path.dirname(__file__))
from base_basic import ordered_list_from_dict, ordered_lists_from_dicts, csv_list_from_dicts
from base_builtin import load_file, load_json, load_yaml, save_file, save_json
from base_env import get_settings_root

# * .env
def _notion_bot(bot_nick='monWorkBot'):
    return load_yaml(f"{get_settings_root(what='notion')}/user-bots.yaml")[bot_nick]

def _notion_token(bot_nick='monWorkBot'):
    return _notion_bot(bot_nick)['token']

def _flatten_property(property, timezone=None):
    """property -> flatten(val)
    """
    # print(f"{property=}")
    if isinstance(property, str):  # _property가 str인 경우
        return property

    type = property['type']

    if type == 'rich_text':
        return ''.join([rich_text['plain_text'] for rich_text in property['rich_text']])
    elif type == 'title':
        return property['title'][0]['plain_text']
    elif type == 'date':
        # val = property[type]['start'] if not timezone else _datetime_to_seoul(property[type]['start'])
        # print(f"date: {property=}")
        if not property[type]:
            return ''  # TODO: '' -> None 로 변경 -> 오류 발생 여부 확인 필요
        val = property[type].get('start')
        if property[type].get('end'):
            val += "-->" + property[type]['end']  # TODO: "-->" 변경
        if property[type].get('timezone'):
            val += property[type]['timezone']  # TODO: 추가 형식 확인 필요
    elif type == 'select':
        val = property[type].get('name', '') if property[type] else ''
    elif type == 'multi_select': # TODO: 수정 예정
        val = ''
        # val = [item['name'] for item in property[type]] if property[type] else []  ## TODO: [] -> None 로 변경 -> 오류 발생 여부 확인 필요
    elif type == 'relation': # TODO: 추가 예정
        val = ''
    else:
        val = property[type]  ## TODO: str으로 변경 문제 없는지?

    return val


##@@@ Main Class
##============================================================
class Notion():
    def __init__(self, bot_nick='monWorkBot'):
        """__init__: Object 초기화
        """
        self.notion = Client(auth=_notion_token(bot_nick='monWorkBot'))

    # # * page
    def find_children(self, page_id="0f7d9cbfd94746548d5de973ede73b0e", type="child_block"):
        """
        type: "child_database" / "child_page"
            - "child_block": "callout", "paragraph"와 같은 type은 제외
            - 그외: 모든 children 출력
        """
        # 
        blocks = self.notion.blocks.children.list(block_id=page_id).get("results", [])
        if type == "child_page" or type == "child_database":
            blocks = [block for block in blocks if block.get("type") == type]
        elif type == "child_block":
            blocks = [block for block in blocks if block.get("type") in ["child_page", "child_database"]]
        else:
            return blocks

        return [{'id': block['id'], 'title': block[block['type']]['title'], 'type': block['type']} for block in blocks]


    def query_database(self, database_id="249ba95b54d54dba995f3dcfb3544232"):
        # results = collect_paginated_api(notion.databases.query, database_id=database_id, filter={"property": "04Remark", "rich_text": {"contains": "문"}})
        results = collect_paginated_api(self.notion.databases.query, database_id=database_id)
        return results[0]
        # objs = []
        # for result in results:
        #     obj = {}
        #     for key, property in result["properties"].items():
        #         val = _flatten_property(property, timezone=None)
        #         obj[key] = val if val else ''
        #     objs.append(obj)

        # return csv_list_from_dicts(objs)


if __name__ == "__main__":
    # notion = Client(auth=_notion_token(bot_nick='monWorkBot'))
    notion = Notion('monWorkBot')

    # # * find_children
    # page_id = "0f7d9cbfd94746548d5de973ede73b0e"
    # type = "child_database"
    # # page_id = "00af94c30b624416bcf3cb63a990c83c"
    # # type = "child_page"
    # # blocks = notion.find_children(page_id, type)
    # blocks = notion.find_children(page_id)
    # # blocks = notion.find_children(page_id, type=None)
    # # blocks = notion.find_children("0f7d9cbfd94746548d5de973ede73b0e", None) # "child_database" / "child_page"
    # print("="*60)
    # # blocks
    # print(blocks)

    # * query_database
    data = notion.query_database(database_id="249ba95b54d54dba995f3dcfb3544232")
    print(data)




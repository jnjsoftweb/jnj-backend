def get_upsert_dicts(olds, news, keys):
    adds = []  # 삽입될 딕셔너리들을 저장할 리스트
    dels = []  # 삭제될 딕셔너리들을 저장할 리스트
    upds = []  # 업데이트될 딕셔너리들을 저장할 리스트
    
    # news 딕셔너리들을 반복하면서 처리
    for new_dict in news:
        match_found = False  # 매칭 여부를 나타내는 플래그

        # olds 딕셔너리들을 반복하면서 비교
        for old_dict in olds:
            # 키에 대한 값 비교
            if all(old_dict[key] == new_dict[key] for key in keys):
                match_found = True  # 매칭됨을 나타냄

                # 값이 변경된 경우 업데이트 리스트에 추가
                if old_dict != new_dict:
                    upds.append(new_dict)

                break  # 매칭된 경우 반복 중단

        # 매칭되지 않는 경우 추가 리스트에 추가
        if not match_found:
            adds.append(new_dict)

    # olds 딕셔너리들을 반복하면서 삭제될 항목 찾기
    for old_dict in olds:
        match_found = False  # 매칭 여부를 나타내는 플래그

        # news 딕셔너리들을 반복하면서 비교
        for new_dict in news:
            # 키에 대한 값 비교
            if all(old_dict[key] == new_dict[key] for key in keys):
                match_found = True  # 매칭됨을 나타냄
                break  # 매칭된 경우 반복 중단

        # 매칭되지 않는 경우 삭제 리스트에 추가
        if not match_found:
            dels.append(old_dict)

    return {'adds': adds, 'dels': dels, 'upds': upds}


def get_upsert_lists(olds, news, indexes):
    adds = []  # 삽입될 리스트들을 저장할 리스트
    dels = []  # 삭제될 리스트들을 저장할 리스트
    upds = []  # 업데이트될 리스트들을 저장할 리스트

    # news 리스트를 반복하면서 처리
    for new_item in news:
        match_found = False  # 매칭 여부를 나타내는 플래그

        # olds 리스트를 반복하면서 비교
        for old_item in olds:
            # 인덱스에 대한 값 비교
            if all(old_item[index] == new_item[index] for index in indexes):
                match_found = True  # 매칭됨을 나타냄
                
                # 값이 변경된 경우 업데이트 리스트에 추가
                if old_item != new_item:
                    upds.append(new_item)
                
                break  # 매칭된 경우 반복 중단

        # 매칭되지 않는 경우 추가 리스트에 추가
        if not match_found:
            adds.append(new_item)

    # olds 리스트를 반복하면서 삭제될 항목 찾기
    for old_item in olds:
        match_found = False  # 매칭 여부를 나타내는 플래그

        # news 리스트를 반복하면서 비교
        for new_item in news:
            # 인덱스에 대한 값 비교
            if all(old_item[index] == new_item[index] for index in indexes):
                match_found = True  # 매칭됨을 나타냄
                break  # 매칭된 경우 반복 중단

        # 매칭되지 않는 경우 삭제 리스트에 추가
        if not match_found:
            dels.append(old_item)

    return {'adds': adds, 'dels': dels, 'upds': upds}


def upsert_dicts(olds, news, keys):
    # get_upsert_dicts 함수를 사용하여 결과를 가져옴
    result = get_upsert_dicts(olds, news, keys)

    # adds는 olds의 앞쪽에 추가
    for item in reversed(result['adds']):
        olds.insert(0, item)

    # dels는 olds에서 제거
    for item in result['dels']:
        olds.remove(item)

    # upds는 원래 있던 위치에서 update된 값을 씀
    for update in result['upds']:
        for i, old_dict in enumerate(olds):
            if all(old_dict[key] == update[key] for key in keys):
                olds[i] = update
                break

    return olds


def upsert_lists(olds, news, indexes):
    # get_upsert_lists 함수를 사용하여 결과를 가져옴
    result = get_upsert_lists(olds, news, indexes)

    # adds는 olds의 앞쪽에 추가
    for item in reversed(result['adds']):
        olds.insert(0, item)

    # dels는 olds에서 제거
    for item in result['dels']:
        olds.remove(item)

    # upds는 원래 있던 위치에서 update된 값을 씀
    for update in result['upds']:
        for i, old_list in enumerate(olds):
            if all(old_list[index] == update[index] for index in indexes):
                olds[i] = update
                break

    return olds


# from collections import defaultdict

# def get_upsert_dicts(olds, news, keys):
#   """
#   두 개의 딕셔너리 목록을 비교하여 추가, 삭제 및 업데이트된 항목을 포함하는 딕셔너리를 반환합니다.

#   Args:
#       olds (list of dicts): 기존 딕셔너리 목록입니다.
#       news (list of dicts): 새 딕셔너리 목록입니다.
#       keys (list of str): 비교할 키 목록입니다.

#   Returns:
#       dict: 'adds', 'dels', 'upds' 키를 포함하는 딕셔너리입니다.
#   """

#   adds = defaultdict(dict)
#   dels = defaultdict(dict)
#   upds = defaultdict(dict)

#   # olds를 기준으로 news를 비교합니다.
#   for old_dict in olds:
#     found = False
#     for new_dict in news:
#       if all(old_dict[key] == new_dict[key] for key in keys):
#         found = True
#         # 값이 동일하면 업데이트할 필요가 없습니다.
#         if old_dict != new_dict:
#           for key, value in new_dict.items():
#             upds[key][old_dict[key]] = value
#         break

#     if not found:
#       # 기존 딕셔너리에서 삭제된 항목입니다.
#       for key, value in old_dict.items():
#         dels[key][value] = old_dict

#   # news를 기준으로 olds를 비교합니다.
#   for new_dict in news:
#     found = False
#     for old_dict in olds:
#       if all(old_dict[key] == new_dict[key] for key in keys):
#         found = True
#         break

#     if not found:
#       # 새 딕셔너리입니다.
#       for key, value in new_dict.items():
#         adds[key][value] = new_dict

#   return {
#       "adds": dict(adds),
#       "dels": dict(dels),
#       "upds": dict(upds),
#   }


# def get_upsert_lists(olds, news, indexes):
#   """
#   두 개의 리스트를 비교하여 추가, 삭제 및 업데이트된 항목을 포함하는 딕셔너리를 반환합니다.

#   Args:
#       olds (list): 기존 리스트입니다.
#       news (list): 새 리스트입니다.
#       indexes (list of int): 비교할 인덱스 목록입니다.

#   Returns:
#       dict: 'adds', 'dels', 'upds' 키를 포함하는 딕셔너리입니다.
#   """

#   adds = defaultdict(list)
#   dels = defaultdict(list)
#   upds = defaultdict(list)

#   # olds를 기준으로 news를 비교합니다.
#   for old_item in olds:
#     found = False
#     for new_item in news:
#       if all(old_item[index] == new_item[index] for index in indexes):
#         found = True
#         # 값이 동일하면 업데이트할 필요가 없습니다.
#         if old_item != new_item:
#           upds[index].append((old_item, new_item))
#         break

#     if not found:
#       # 기존 리스트에서 삭제된 항목입니다.
#       dels.append(old_item)

#   # news를 기준으로 olds를 비교합니다.
#   for new_item in news:
#     found = False
#     for old_item in olds:
#       if all(old_item[index] == new_item[index] for index in indexes):
#         found = True
#         break

#     if not found:
#       # 새 리스트입니다.
#       adds.append(new_item)

#   return {
#       "adds": adds,
#       "dels": dels,
#       "upds": upds,
#   }

if __name__ == "__main__":
    # # 테스트 코드
    # olds = [{"a": 1, "b": 2, "c": 3}, {"a": 4, "b": 5, "c": 6}, {"a": 4, "b": 6, "c": 9}]
    # news = [{"a": 1, "b": 2, "c": 3}, {"a": 4, "b": 6, "c": 8}, {"a": 4, "b": 8, "c": 10}]
    # keys = ["a", "b"]

    # print(get_upsert_dicts(olds, news, keys))
    # {'adds': [{'a': 4, 'b': 8, 'c': 10}], 'dels': [{'a': 4, 'b': 5, 'c': 6}], 'upds': [{'a': 4, 'b': 6, 'c': 8}]}


    # # 테스트 코드
    # olds = [{"a": 1, "b": 2, "c": 3}, {"a": 4, "b": 5, "c": 6}, {"a": 4, "b": 6, "c": 9}]
    # news = [{"a": 1, "b": 2, "c": 3}, {"a": 4, "b": 6, "c": 8}, {"a": 4, "b": 7, "c": 9}, {"a": 4, "b": 8, "c": 10}]
    # keys = ["a", "b"]

    # print(upsert_dicts(olds, news, keys))


    # # 테스트 코드
    # olds = [[1, 2, 3], [4, 5, 6], [4, 6, 9]]
    # news = [[1, 2, 3], [4, 6, 8], [4, 8, 10]]
    # indexes = [0, 1]  # 인덱스로 0과 1을 사용

    # print(get_upsert_lists(olds, news, indexes))

    # olds = [{"a": 1, "b": 2, "c": 3}, {"a": 4, "b": 5, "c": 6}, {"a": 4, "b": 6, "c": 9}]
    # news = [{"a": 1, "b": 2, "c": 3}, {"a": 4, "b": 6, "c": 8}, {"a": 4, "b": 8, "c": 10}]
    # keys = ["a", "b"]

    # result = get_upsert_dicts(olds, news, keys)
    # print(result)


    olds = [[1, 2, 3], [4, 5, 6], [4, 6, 9]]
    news = [[1, 2, 3], [4, 6, 8], [4, 8, 10]]
    indexes = [0, 1]

    result = upsert_lists(olds, news, indexes)
    print(result)
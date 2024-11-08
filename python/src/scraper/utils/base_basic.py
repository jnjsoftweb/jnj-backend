"""
A library for Basic (Package Without Importing) Utility Functions

Conventions:

    FileTypes(Extensions)
    - srt:  SubRipText  동영상 자막용 데이터
    - tsv:  Tab-Separated Values  tab으로 분리된 테이블 형식 데이터
    - csv:  Comma-Separated Values  `comma`으로 분리된 테이블 형식 데이터

    DataTypes
    - s:  String  문자열
    - ss:  Array of String  문자열 배열
    - arr:  Array  1차원 배열
    - arrs:  Array of Array  2차원 배열(테이블 형식 데이터)
    - dic:  Dictionary  key: value 쌍으로 이루어진 데이터
    - dics:  Array of Dictionary  dict 배열
    - pair: [keys, vals]
    - pairs: [keys, valss], valss: array of vals
"""

# & Deal with DataType
def pop_dict(obj, key):
    """
    Pop Dict By Key

    :param obj: dict
    :param key: string

    :return: dict
    """
    val = obj[key]
    del obj[key]
    return val


# & Convert Format of String
def tsv_from_srt(s):
    """
    Convert SubRipText(`srt`) format string => Tab-Separated Values(`tsv`) format string

    :param s: string

    :return: string
    """
    return "\n".join(
        line.replace("\n", "\t").strip() for line in s.split("\n\n") if line
    )

# def txt_from_srt(s):
#     """
#     Convert SubRipText(`srt`) format string => extract text

#     :param s: string

#     :return: string
#     """
#     return re.sub(tsv_from_srt(s))


def srt_from_tsv(s):
    """
    Convert Tab-Separated Values(`tsv`) => SubRipText(`srt`)

    :param str: string

    :return: string
    """
    return "\n\n".join(line.replace("\t", "\n") for line in s.split("\n"))


def arrs_from_csv(csv, sep=",", has_quote=True, newline="\n"):
    """
    Convert Comma-Separated Values(`csv`) => Array of Array(`arrs`)

    :param csv: string
    :param sep: string, default=','
    :param has_quote: bool
    :param newline: string

    :return: list[list]
    """
    arrs = []
    for line in csv.split(newline):
        if has_quote:
            arrs.append([s.strip() for s in line[1:-1].split(f'"{sep}"')])
        else:
            arrs.append([s.strip() for s in line.split(sep)])
    return arrs


def csv_from_arrs(arrs, sep=",", has_quote=True, newline="\n"):
    """
    Array of Array(`arrs`) => Convert Comma-Separated Values(`csv`)

    :param arrs: list[list]
    :param sep: string, default=','
    :param has_quote: bool
    :param newline: string

    :return: string
    """
    rows = []
    for arr in arrs:
        if has_quote:
            row = f'"{sep}"'.join(str(s) for s in arr)
            rows.append(f'"{row}"')
        else:
            rows.append(sep.join(str(s) for s in arr))
    return newline.join(rows)


def arr_from_arrs(arrs, index=0, has_header=False):
    """
    Returns arr From arrs (array of array).

    :param arrs: list[list]
    :param index: int, default=0
    :param has_header: bool, default=False

    :return: list
    """
    arr = [c[index] for c in arrs]
    return arr[1:] if has_header else arr


def arr_from_dicts(dics, key):
    """
    Arr From Dicts (Extract array By Key)

    :param dicts: list[dict]
    :param key: string

    :return: list
    """
    return [d[key] for d in dics]


def dict_from_pair(keys, vals):
    """
    Returns Dict (object) From Pair (Keys, Vals)

    :param keys: list
    :param vals: list

    :return: dict
    """
    return {k: v for k, v in zip(keys, vals)}


def dicts_from_pairs(keys, valss):
    """
    Returns Dicts (objects) From Pairs (Keys, Valss)

    :param keys: list
    :param valss: list[list]

    :return: list[dict]
    """
    return [dict(zip(keys, vals)) for vals in valss]


def arrs_from_dict(dic):
    """
    Arrs From Dict

    :param dct: dict

    :return: list[list]
    """
    if dic is None or not isinstance(dic, dict):
        return []
    keys = list(dic.keys())
    values = list(dic.values())
    return [keys, values]


def arrs_from_dicts(dics):
    """
    Arrs From Dicts

    :param dics: list[dict]

    :return: list[list]
    """
    arrs = []
    if dics is None or not isinstance(dics, list) or len(dics) == 0:
        return []
    keys = list(dics[0].keys())
    arrs.append(keys)
    for dct in dics:
        row = [dct[key] for key in keys]
        arrs.append(row)
    return arrs


def arrs_added_defaults(arrs, defaults={}, is_push=False):
    """
    Arrs Added Default Values

    :param arrs: list[list]
    :param defaults: dict, default={}
    :param is_push: bool, default=False

    :return: list[list]
    """
    add_keys = list(defaults.keys())
    add_vals = list(defaults.values())
    if is_push:
        return [
            arr + add_keys if i == 0 else arr + add_vals for i, arr in enumerate(arrs)
        ]
    else:
        return [
            add_keys + arr if i == 0 else add_vals + arr for i, arr in enumerate(arrs)
        ]


def convert_str(data, src_type, dst_type):
    """
    Main Converter

    :param data: string
    :param src_type: string
    :param dst_type: string

    :return: string
    """
    if src_type == "srt" and dst_type == "tsv":
        return tsv_from_srt(data)
    elif src_type == "tsv" and dst_type == "srt":
        return srt_from_tsv(data)


# & Dict, Dicts
def swap_dict(dic):
    """
    Swap Dict Key-Value

    :param dic: dict

    :return: dict
    """
    return {v: k for k, v in dic.items()}


def get_upsert_dicts(olds, news, keys):
    """
    Get Upsert Dicts

    :param olds: list[dict]
    :param news: list[dict]
    :param keys: list

    :return: dict
    """
    upserts = {"adds": [], "dels": [], "upds": []}
    for new_dict in news:
        matching_old_dict = next(
            (
                old_dict
                for old_dict in olds
                if all(new_dict.get(key, "") == old_dict.get(key, "") for key in keys)
                # if all(new_dict[key] == old_dict[key] for key in keys)
            ),
            None,
        )
        if not matching_old_dict:
            upserts["adds"].append(new_dict)
        elif not all(
            # new_dict[key] == matching_old_dict[key] for key in new_dict.keys()
            new_dict.get(key, "") == matching_old_dict.get(key, "") for key in new_dict.keys()
        ):
            upserts["upds"].append(new_dict)

    for old_dict in olds:
        matching_new_dict = next(
            (
                new_dict
                for new_dict in news
                if all(old_dict.get(key, "") == new_dict.get(key, "") for key in keys)
                # if all(old_dict[key] == new_dict[key] for key in keys)
            ),
            None,
        )
        if not matching_new_dict:
            upserts["dels"].append(old_dict)

    return upserts


def remove_dict_keys(dic, keys):
    """
    Remove Keys From Dict

    :param dic: dict
    :param keys: list

    :return: dict
    """
    return {k: v for k, v in dic.items() if k not in keys}

#===============================================
def valid_str(val):
    return False if (val is None) or (val.strip() == "") or (type(val) != str) else True

def is_empty(val):
    if val is None:
        return True
    elif type(val) == str:
        return val.strip() == ""
    elif type(val) == list:
        return len(val) == 0
    elif type(val) == dict:
        return val == {}

def arr_from_csv(csv, index=0, has_header=False):
    arr = [c[index] for c in csv]
    return arr[1:] if has_header else arr

def dict_from_tuple(fields, tp):
    return {fields[i]:v for (i, v) in enumerate(tp)}

def dicts_from_tuples(fields, tuples):
    return [{fields[i]:tp[i] for i in range(0, len(tp))} for tp in tuples]

def csv_from_dict(dct):
    if dct is None or (type(dct) != dict):
        return []
    return [list(dct.keys()), list(dct.values())]

def csv_from_dicts(dicts):
    csv = []
    # print(f"dicts: |{dicts}|")
    if dicts is None or (len(dicts) == 0):
        return []
    keys = dicts[0].keys()
    csv = [list(keys)]
    csv.extend([[dic[k] for k in keys] for dic in dicts])
    return csv

def csv_added_defaults(csv, defaults={}, is_push=False):
    add_keys = list(defaults.keys())
    add_vals = list(defaults.values()) 
    # print("add_keys, add_vals", add_keys, add_vals)
    if (is_push):
        csv = [arr + (add_keys if i == 0 else add_vals) for (i, arr) in enumerate(csv)]
    else:
        csv = [(add_keys if i == 0 else add_vals) + arr for (i, arr) in enumerate(csv)]
    return csv

def ordered_list_from_dict(obj, keys=[], dfault=""):
    """
    obj<dict>의 values를 keys의 순서(비어있을 경우는 obj의 key값을 소팅한 배열)로 리스트를 만듬(value가 없을 경우: dfault값으로 넣음)
    """
    if not keys:
        keys = sorted(obj.keys())
    return [obj.get(key, dfault) for key in keys]


def ordered_lists_from_dicts(objs, keys=[], dfault=""):
    """
    objs<dicts>의 values를 keys의 순서(비어있을 경우는 obj의 key값을 소팅한 배열)로 리스트를 만듬(value가 없을 경우: dfault값으로 넣음)
    """
    if not keys:
        keys = sorted(objs[0].keys())

    return [ordered_list_from_dict(obj, keys, dfault) for obj in objs]

def csv_list_from_dicts(objs, keys=[], dfault=""):
    if not keys:
        keys = sorted(objs[0].keys())

    return [keys] + ordered_lists_from_dicts(objs, keys, dfault)


if __name__ == "__main__":
    # a = {"a": 1, "b": 2, "c": 3}
    # print(a.get("d", "-"))
    olds = [{"a": 1, "b": 2, "c": 3}, {"a": 4, "b": 5, "c": 6}, {"a": 4, "b": 6, "c": 9}]
    news = [{"a": 1, "b": 2, "c": 3}, {"a": 4, "b": 6, "c": 8}, {"a": 4, "b": 8, "c": 10}]
    keys = ["a", "b"]

    # keys = ["a", "b", "c"]
    print(get_upsert_dicts(olds, news, keys))
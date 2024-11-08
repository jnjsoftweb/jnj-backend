# -*- coding=utf-8 -*-
"""
주요 기능:
    - 날짜/시간 관련 유틸 함수

사용례: 
    - 
"""

##@@@ Package/Module
##============================================================

##@@ Built-In Package/Module
##------------------------------------------------------------
# import os, sys
# import re, json
import time
from datetime import date, datetime, timedelta, timezone
import threading


TODAY = datetime.now().strftime("%Y%m%d")

##@@ External Package/Module
##------------------------------------------------------------

##@@ User Package/Module
##------------------------------------------------------------

##@@@ Constant/Varible
##============================================================
DEFAULT_BGN = "08:30"
DEFAULT_END = "15:30"
DEFAULT_INTV = 2


##@@ path, var
##------------------------------------------------------------

##@@@ Private Function
##============================================================

##@@ 시간, 날짜
##------------------------------------------------------------
def _datetime_to_seoul(_datetime, format="%Y-%m-%dT%H:%M:%S", out_type="datetime"):
    """Asia/Seoul timezone으로 변경 '2021-11-05T03:03:00.000Z' -> '2021-11-05 12:03:00'
    out_type: datetime / str
    """
    dt = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=9) if len(_datetime) < 16 else datetime.strptime(_datetime, f"{format}.%fZ") + timedelta(hours=9) if _datetime[-1].upper() == 'Z' else datetime.strptime(_datetime, format.replace('T', ' '))
    return dt if out_type[0].lower() == 'd' else dt.strftime(format.replace('T', ' '))


def _is_later_datetime(dt1, dt2):
    """dt1이 dt2보다 나중인가?
    """
    return _datetime_to_seoul(dt1) > _datetime_to_seoul(dt2)


def _to_date(dt, format="%Y%m%d"):
    """date 형식으로 변경
    """
    return dt.date() if '.datetime' in str(type(dt)) \
                        else dt if '.date' in str(type(dt)) \
                        else  datetime.strptime(str(dt).replace("/", "").replace("-", ""), format.replace("-", "").replace("/", "")).date()


def _to_dates(start, end, inc=1, format="%Y%m%d", out_type="str"):
    """
    start, end: datetime, date, date 문자열(format="%Y-%m-%d", ...), , datetime 문자열(format="%Y/%m/%d %H:%M:%S", ...)
    inc: 1 -> end 날짜 포함(O), 0 -> end 날짜 포함(X)
    out_type: "str" -> format형식의 문자열, "date": date type
    """
    start = _to_date(start, format=format)
    end = _to_date(end, format=format)
#     for n in range(int((end - start).days) + inc):
#         yield start + timedelta(n) if out_type[0].lower() == "d" else (start + timedelta(n)).strftime(format)
    return [start + timedelta(n) if out_type[0].lower() == "d" else (start + timedelta(n)).strftime(format.split(" ")[0]) for n in range(int((end - start).days) + inc)]



def _str_to_datetime_ebest(time_str, date=None, format='%Y%m%d%H%M%S'):
    """fetch 결과의 date/time을 datetime 형식으로 변환
    time_str 형식: ebest api에 사용되는 format
    """
    l = len(time_str)

    time = None
    if l > 6:  # time_str: %Y%m%d
        time = datetime.strptime(time_str, format[:6])
    elif l > 4:  # time_str: %H%M%S
        time_str = f"{date}{time_str}"
        time = datetime.strptime(time_str, format)
    else:  # time_str: %H%M
        time_str = f"{date}{time_str}00"
        time = datetime.strptime(time_str, format)
    
    return time


def _convert_date_format(date, format1='%Y%m%d', format2='%Y-%m-%d'):
    """날짜 형식 변경

    Args:
        date (str): 변경하고자 하는 format1 형식의 날짜(ex: 20210714) 
        format1 (str, optional): 원래 날짜 형식. Defaults to '%Y%m%d'.
        format2 (str, optional): 변경(결과) 날짜 형식. Defaults to '%Y-%m-%d'.

    Returns:
        str: format2 형식으로 변경된 날짜(문자열)
    """
    return datetime.strptime(date, format1).strftime(format2)


def _gap_dates(today=None, gap=-366, format='%Y%m%d'):
    """오늘 날짜, 1년전(366일전) 날짜 출력

    Args:
        today (str, optional): None: 오늘 날짜 / 기준일 입력 가능. Defaults to None.
        gap (int, optional): [날짜 차이: 음수(-): 이전일, 양수(+): 이후일]. Defaults to -366(1년전).
        format (str, optional): [날짜 출력 형식]. Defaults to '%Y%m%d'.

    Returns:
        [tuple]: [(구한 날짜, 오늘(today))]
    """

    if not today:
        now = datetime.now()
    else:
        now = datetime.strptime(today, format)
    return ((now + timedelta(days=gap)).strftime(format), now.strftime(format))


def _count_date_gap(end='20210714', bgn='20200714', format='%Y%m%d', unit='day'):
    # delta = datetime.strptime(end, format) - datetime.strptime(bgn, format)
    return (datetime.strptime(end, format) - datetime.strptime(bgn, format)).days


def _bgn_end_date(term, sep="_", format="%Y-%m-%d", holidays=False):
    """term(기간 <num>_<unit>) 첫번째, 마지막 날짜 <unit>: years, days, weeks, months(TODO: timedelta 이용 더 정확히 개선)
    """
    (days, unit) = term.split(sep, 1)
    days = int(days) if unit[0].lower() == 'd' else int(days)*365 if unit[0].lower() == 'y' else int(days)*7 if unit[0].lower() == 'w' else int(days)*31

    end = date.today()
    bgn = end - timedelta(days=days)

    return (bgn.strftime(format), end.strftime(format))


# https://fishpoint.tistory.com/5237

def _to_datetime(time, today=TODAY, format="%Y%m%d %H:%M"):
    """time을 datetime 형식으로 반환
    time: datetime/str '08:30'
    format: time이 str인 경우 (today를 포함한) datetime 형식
    사용례:
        - _to_datetime("08:30", today=TODAY, format="%Y%m%d %H:%M")
        - _to_datetime("2021-12-25 12:25:25", format="%Y-%m-%d %H:%M:%S")
    """
    return time if type(time) != str else datetime.strptime(f"{today} {time}", f"{format}") if len(time) < 10 else datetime.strptime(f"{time}", f"{format}")


def _timedelta(intv='30_m'):
    (n, unit) = intv.split("_", 1)
    return timedelta(**{"seconds": int(n)} if unit[0].lower() == 's' else {"minutes": int(n)} if unit[0].lower() == 'm' else {"hours": int(n)})


def _split_intv(bgn=None, end=None, intv='30_m', today=TODAY, format="%Y%m%d %H:%M"):
    """intv 간격으로 bgn, end를 나눔(나눌 수 있을 때까지 반복)
    """
    bgn = _to_datetime(bgn, today=today, format=format)
    end = _to_datetime(end, today=today, format=format)
    interval = _timedelta(intv)
    times = []
    while bgn < end:
        _end = min(bgn + interval, end)
        times.append((bgn, _end))
        bgn = _end
    return times


def _split_intvs(bgn=None, end=None, intvs=[], reverse=False, today=TODAY, format="%Y%m%d %H:%M"):
    """intvs 간격으로 bgn, end를 나눔(주어진 intvs만 적용시킴)
    reverse: True이면 뒤에서부터 적용
    """
    bgn = _to_datetime(bgn, today=today, format=format)
    end = _to_datetime(end, today=today, format=format)
    times = []
    intervals = [_timedelta(intv) for intv in intvs]
    for interval in intervals if not reverse else intervals[::-1]:
        if not reverse:
            _end = min(bgn + interval, end)
            times.append((bgn, _end))
            bgn = _end
        else:
            _bgn = max(bgn, end - interval)
            times.append((_bgn, end))
            end = _bgn
    return times + [(times[-1][1], end)] if not reverse else [(bgn, times[-1][0])] + times[::-1]


def _elapsed(_time, format="%Y%m%d %H:%M"):
    """시간 경과 확인
    _time: "09:12"
    return: True/False
    """
    NOW = datetime.now()
    return NOW >= datetime.strptime(f"{NOW.strftime(format.split(' ')[0])} {_time}", f"{format}")


def _is_active(bgn, end, today=TODAY, format="%Y%m%d %H:%M"):
    bgn = bgn if type(bgn) != str else datetime.strptime(f"{today} {bgn}", f"{format}") if len(bgn) < 10 else datetime.strptime(f"{bgn}", f"{format}")
    end = end if type(end) != str else datetime.strptime(f"{today} {end}", f"{format}") if len(end) < 10 else datetime.strptime(f"{end}", f"{format}")
    # print(f"{bgn}, {datetime.now()}, {end}")
    return datetime.now() >= bgn and datetime.now() < end


class _Timer(object):
    ## TODO: function의 출력값에 따라 강제 종료 가능하도록
    def __init__(self, opts, function, *args, **kwargs):
        opts
        self._timer = None
        self.bgn = opts.get('bgn', DEFAULT_BGN)
        self.end = opts.get('end', DEFAULT_END)
        self.interval = opts.get('intv', DEFAULT_INTV)
        self.function = function
        self.args = args
        self.kwargs = kwargs
        self.next_call = time.time()
        self._run()


    def _run(self):
        self.is_running = False
        self.result = self.function(*self.args, **self.kwargs)
        self.start()


    def start(self):
        self.next_call = time.time() + self.interval
        if not self.is_running and _is_active(self.bgn, self.end):
            self.next_call += max(0, self.next_call - time.time() - self.interval)
            self._timer = threading.Timer(self.next_call - time.time(), self._run)
            if self.result == False:
                # print("STOP******************")
                self.stop()
            else:
                pass
                # print("go on----------")
            self._timer.start()
            self.is_running = True
        else:
            print("Timer is out!!")
            return True

    def stop(self):
        self._timer.cancel()
        self.is_running = False


## NOTE: timezone 적용
# from pytz import timezone
# from datetime import datetime, timedelta

# UTC = timezone('UTC')
# KST = timezone('Asia/Seoul')

# bgn = "08:30"
# end = "16:00"

# TODAY = datetime.now(timezone('Asia/Seoul')).strftime("%Y%m%d")
# bgn = datetime.strptime(f"{TODAY} {bgn}", "%Y%m%d %H:%M")
# end = datetime.strptime(f"{TODAY} {end}", "%Y%m%d %H:%M")

# datetime.now(KST) > bgn.replace(tzinfo=KST) and datetime.now(KST) < end.replace(tzinfo=KST)
# # bgn.replace(tzinfo=KST)
# # print(bgn, end)
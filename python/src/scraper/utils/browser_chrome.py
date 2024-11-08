import os, sys
import time
from playwright.sync_api import sync_playwright

sys.path.append(os.path.dirname(__file__))
from base_builtin import load_json, load_yaml, find_folders
from base_env import get_settings_root

PATHS = load_yaml(f"{get_settings_root(what='chrome')}/paths.yaml")
USER_DATA_DIR = PATHS['user_data_dir'] # "C:\\Users\\Jungsam\\AppData\\Local\\Google\\Chrome\\User Data", "/home/sam/.config/google-chrome"
EXE_PATH = PATHS['exe_path'] # "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "/usr/bin/google-chrome"

def find_chrome_profiles(base_path=None): # 'C:/Users/Jungsam/AppData/Local/Google/Chrome/User Data'
    base_path = base_path if base_path else USER_DATA_DIR

    pattern = 'Profile'
    folders = find_folders(base_path, pattern)
    profiles = []

    for folder in folders:
        json = load_json(f"{folder}/Preferences")
        if "account_info" in json and len(json["account_info"]) > 0:
            profile = {'profile': folder.replace("\\", "/").split("/")[-1]}
            keys = ['email', 'full_name', 'given_name']
            for key in keys:
                profile[key] = json["account_info"][0][key]
            profiles.append(profile)

    return profiles

def get_profile_by_email(email="bigwhitekmc@gmail.com", base_path=None):
    base_path = base_path if base_path else USER_DATA_DIR
    folders = find_folders(base_path, 'Profile')

    for folder in folders:
        json = load_json(f"{folder}/Preferences")
        if "account_info" in json and len(json["account_info"]) > 0:
            if json["account_info"][0]['email'] == email:
                return folder.replace("\\", "/").split("/")[-1]

    return 'Profile 1'


def get_chrome_paths(user_data_dir=None, exe_path=None):
    user_data_dir = user_data_dir if user_data_dir else USER_DATA_DIR
    exe_path = exe_path if exe_path else EXE_PATH
    return (user_data_dir, exe_path)
    # return {'user_data_dir': user_data_dir, 'exe_path': exe_path}


class Chrome:
    # def __init__(self, url, profile=None, headless=False):
    def __init__(self, url, **kwargs):
        profile = kwargs['profile'] if 'profile' in kwargs else None
        headless = kwargs['headless'] if 'headless' in kwargs else False
        # frame_xpath = kwargs['frame_xpath'] if 'frame_xpath' in kwargs else None

        self.url = url
        self.profile = profile
        self.headless = headless
        self.playwright = sync_playwright().start()

        if profile:  # profile이 있는 경우
            browser_context_options = {
                "user_data_dir": USER_DATA_DIR,
                "executable_path": EXE_PATH,
                "args": [
                    f'--profile-directory={profile}'
                ]
            }

            self.browser = self.playwright.chromium.launch_persistent_context(**browser_context_options, headless=headless)
        else:  # profile이 없는 경우
            self.browser = self.playwright.chromium.launch(headless=headless, args=["--disable-gpu"])

        self.page = self.browser.new_page()
        self.page.goto(self.url)

    def login_id_pw(self, **kwargs):
        """
        로그인
        - login_xpath_id: id 텍스트박스 xpath / id: id값
        - login_xpath_pw: pw(암호) 텍스트박스 xpath / pw: pw(암호)값
        - login_xpath_submit: 클릭할 submit 버튼 xpath / 없는 경우 'Enter'키 입력
        - sleep_before
        """
        try:  # 로그인되어 있는 경우는 에러 발생
            sleep_before = kwargs['sleep_before'] if 'sleep_before' in kwargs else 1
            time.sleep(sleep_before)

            self.page.fill(kwargs['login_xpath_id'], kwargs['id'])
            self.page.fill(kwargs['login_xpath_pw'], kwargs['pw'])

            if 'login_xpath_submit' in kwargs:
                self.page.click(kwargs['login_xpath_submit'])
            else:
                self.page.focus(kwargs['login_xpath_pw'])
                time.sleep(1)
                self.page.keyboard.press("Enter")

            # * 2단계 인증(카카오톡, 문자, 이메일 등)이 있는 경우 wait 시간
            sleep_after = kwargs['sleep_before'] if 'sleep_before' in kwargs else 1
            time.sleep(sleep_after)
        except:
            print("로그인 중에 에러가 발생하였습니다")

    # def set_page(self, url):
    #     self.page.goto(self.url)

    def set_frame(self, frame_xpath):
        self.frame = self.page.wait_for_selector(frame_xpath).content_frame()

    def close(self):
        # 브라우저 종료
        self.browser.close()
        # Playwright 종료
        self.playwright.stop()

if __name__ == "__main__":
    profile = get_profile_by_email(email="bigwhitekmc@gmail.com", base_path=None)
    # print(profile)
    chrome = Chrome(url="https://www.google.com", profile=profile, headless=False)
    time.sleep(50)
    chrome.close()

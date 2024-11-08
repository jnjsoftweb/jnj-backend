import os, sys
sys.path.append(os.path.dirname(__file__))
from base_builtin import slashed_folder


# def slashed_folder(folder):
#     folder = folder.replace('\\', '/')
#     return folder if not folder.endswith('/') else folder[:-1]

def _dev_settings_root():
    return slashed_folder(os.environ['DEV_SETTINGS'])

def get_settings_root(what='googleApis'):
    root = _dev_settings_root()
    if what == 'googleApis':
        root = f"{root}/Apis/google"
    elif what == 'notion':
        root = f"{root}/Apis/notion"
    elif what == 'chrome':
        root = f"{root}/Browsers/chrome"
    return root
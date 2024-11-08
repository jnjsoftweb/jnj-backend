import os, sys
import google.generativeai as genai

sys.path.append(os.path.dirname(__file__))
from base_builtin import load_file, load_json, load_yaml, save_file, save_json
from base_env import _dev_settings_root

# C:\JnJ-soft\Developments\_Settings\Apis\ai\gemini\accounts.yml

# * .env
def _gemini_setting(user='bigwhitekmc'):
    return load_yaml(f"{_dev_settings_root()}/Apis/ai/gemini/accounts.yaml")[user]


# * AI (Gemini)
# def ai_gen_model(user="bigwhitekmc", temperature=0.9, top_p=1, top_k=1, max_output_tokens=2048):
def ai_gen_model(**kwargs):
    user = kwargs['user'] if 'user' in kwargs else 'bigwhitekmc'
    temperature = kwargs['temperature'] if 'temperature' in kwargs else 0.9
    top_p = kwargs['top_p'] if 'top_p' in kwargs else 1
    top_k = kwargs['top_k'] if 'top_k' in kwargs else 1
    max_output_tokens = kwargs['max_output_tokens'] if 'max_output_tokens' in kwargs else 2048

    genai.configure(api_key=_gemini_setting(user)['api_key'])

    # Set up the model
    generation_config = {
        "temperature": temperature,
        "top_p": top_p,
        "top_k": top_k,
        "max_output_tokens": max_output_tokens,  # 9000
    }

    return genai.GenerativeModel('gemini-pro', generation_config=generation_config)


# def ai_grammar_md(path, model, grammar_prompt="- 같은 줄에 쓰여져야 할 내용이 줄바꿈 된 경우에는 줄을 이어서 정리해줘.\n\n```\n"):
#     prompt = "- 아래글을 한글 맞춤법에 맞게 교정해줘.\n " + grammar_prompt + "\n\n```\n"
#     prompt += load_file(path) +  "\n```\n"
#     response = model.generate_content(prompt)
#     return response.text

# def ai_grammar_md(path, model, grammar_prompt="- markdown 문법은 유지해줘, - 같은 줄에 쓰여져야 할 내용이 줄바꿈 된 경우에는 줄을 이어서 정리해줘.\n\n```\n"):
#     prompt = "- 아래글을 한글 맞춤법에 맞게 교정해줘.\n " + grammar_prompt + "\n\n```\n"
#     prompt += load_file(path) +  "\n```\n"
#     response = model.generate_content(prompt)
#     return response.text

def chat_gemini(prompt, **kwargs):
    return ai_gen_model(**kwargs).generate_content(prompt).text



def ai_grammar_md(path, model, grammar_prompt="- markdown 문법은 유지해줘, - 같은 줄에 쓰여져야 할 내용이 줄바꿈 된 경우에는 줄을 이어서 정리해줘.\n\n```\n"):
    prompt = "- 아래에 있는 markdown 문서에 대해, 제목이나 문장끝이 아닌 경우 필요없는 줄바꿈은 없애주고, 한글 맞춤법도 적용해서 수정해주세요.\n\n```\n"
    prompt += load_file(path) +  "\n```\n"
    response = model.generate_content(prompt)
    return response.text

def ai_markdown(path, **kwargs):
    # path = r"C:\JnJ-soft\Projects\internal\jnj-web-tools\scraper\jnj-scraper-py\down\tistory\전원한의원\md\건강기능식품안내\[전원한의원] 홍차 효능 부작용 복용법 보관법 등 총정리.md"
    # user = kwargs['user'] if 'user' in kwargs else 'bigwhitekmc'
    # temperature = kwargs['temperature'] if 'temperature' in kwargs else 0.9
    # top_p = kwargs['top_p'] if 'top_p' in kwargs else 1
    # top_k = kwargs['top_k'] if 'top_k' in kwargs else 1
    # max_output_tokens = kwargs['max_output_tokens'] if 'max_output_tokens' in kwargs else 2048
    # 
    model = ai_gen_model(**kwargs)
    
    return ai_grammar_md(path, model)

if __name__ == "__main__":
    prompt = "tistory 블로그 알아?"
    print(chat_gemini(prompt, max_output_tokens=9000))
    # path = r"C:\JnJ-soft\Projects\internal\jnj-web-tools\scraper\jnj-scraper-py\down\tistory\전원한의원\md\건강기능식품안내\[전원한의원] 홍차 효능 부작용 복용법 보관법 등 총정리.md"
    # # model = ai_gen_model(user="bigwhitekmc", temperature=0.9, top_p=1, top_k=1, max_output_tokens=2048)
    # # md = ai_grammar_md(path, model)
    # md = ai_markdown(path)
    # print(md)
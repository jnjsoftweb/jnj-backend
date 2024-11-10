Namecheap

Username: vastwhite
Password: 
monwater@gmail.com

## host 추가
https://ap.www.namecheap.com/Domains/DomainControlPanel/vastwhite.com/advancedns






> `sudo nano /etc/nginx/conf.d/react.vastwhite.com.conf`

```
server {
    listen 80;
    server_name react.vastwhite.com;

    location / {
        proxy_pass http://125.133.148.194:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    server_name react.vastwhite.com;

    ssl_certificate /etc/letsencrypt/live/react.vastwhite.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/react.vastwhite.com/privkey.pem;

    location / {
        proxy_pass http://125.133.148.194:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> `sudo vi /etc/nginx/conf.d/api.vastwhite.com.conf`
```
server {
    listen 80;
    server_name api.vastwhite.com;

    location / {
        proxy_pass http://125.133.148.194:3007;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    server_name api.vastwhite.com;

    ssl_certificate /etc/letsencrypt/live/api.vastwhite.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.vastwhite.com/privkey.pem;

    location / {
        proxy_pass http://125.133.148.194:3007;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```


```sh
sudo certbot --nginx -d api.vastwhite.com
```

"""
sam@galatea:~$ sudo certbot --nginx -d api.vastwhite.com
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Error while running nginx -c /etc/nginx/nginx.conf -t.

2024/11/10 21:36:40 [emerg] 5304#5304: cannot load certificate "/etc/letsencrypt/live/api.vastwhite.com/fullchain.pem": BIO_new_file() failed (SSL: error:80000002:system library::No such file or directory:calling fopen(/etc/letsencrypt/live/api.vastwhite.com/fullchain.pem, r) error:10000080:BIO routines::no such file)
nginx: configuration file /etc/nginx/nginx.conf test failed
"""

Nginx에서 아직 존재하지 않는 SSL 인증서를 로드하려고 해서 발생하는 오류입니다. api.vastwhite.com 도메인에 대한 SSL 설정은 이미 되어있지만, Certbot이 아직 인증서를 생성하지 않은 상태입니다.
다음과 같은 순서로 해결할 수 있습니다:

먼저 현재 Nginx 설정에서 SSL 인증서 관련 설정을 확인합니다:

bashCopygrep -r "ssl_certificate" /etc/nginx/

Nginx 설정 파일(/etc/nginx/sites-available/ 아래에 있을 것임)에서 SSL 인증서 관련 줄을 임시로 주석 처리하거나 제거합니다. 해당 줄은 아래와 같은 형태일 것입니다:

nginxCopyssl_certificate /etc/letsencrypt/live/api.vastwhite.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/api.vastwhite.com/privkey.pem;

Nginx 설정이 올바른지 테스트합니다:

bashCopysudo nginx -t

테스트가 통과하면 Nginx를 다시 로드합니다:

bashCopysudo systemctl reload nginx

이제 다시 Certbot을 실행합니다:

bashCopysudo certbot --nginx -d api.vastwhite.com

Certbot이 성공적으로 실행되면, SSL 인증서 설정을 자동으로 다시 추가할 것입니다.

모든 작업이 완료된 후 최종 설정을 확인하려면:
bashCopysudo nginx -t
sudo systemctl status nginx
이런 오류는 보통 실제 인증서는 없는 상태에서 SSL 설정만 미리 되어있을 때 발생합니다. SSL 설정을 임시로 제거하고, Certbot이 인증서를 생성한 후 적절히 SSL을 설정하도록 하면 해결됩니다.



```sh
sudo nginx -t
sudo systemctl restart nginx
```

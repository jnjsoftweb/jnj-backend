C:\JnJ-soft\Developments\_Settings\Apis\google\token_mooninlearn_0.json

jnj-lib-google

> `googleAuth.ts`

```ts
  async saveCredentials(client: any) {
    const keys = loadJson(this.crendentialsPath);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: "authorized_user",
      client_id: key.client_id,
      client_secret: key.client_secret,
      expiry_date: client.credentials.expiry_date, // !! 추가
      refresh_token: client.credentials.refresh_token,
    });
    saveJson(this.tokenPath, payload);
  }
```

- token 파일에 expiry_date
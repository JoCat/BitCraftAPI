import got from "got";

interface Identity {
  identity: string;
  token: string;
}

export async function getIdentityToken(server: string, token: string) {
  return await got
    .post(`${server}/v1/identity/websocket-token`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .json<Identity>();
}

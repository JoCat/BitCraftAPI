import got from "got";

interface Identity {
  identity: string;
  token: string;
}

export async function getIdentityToken(server: string) {
  return await got.post(`${server}/v1/identity`).json<Identity>();
}

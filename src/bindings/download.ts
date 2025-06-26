import { getActualMainServer } from "../core/getActualMainServer";
import { generateBindings } from "./generate";
import { getIdentityToken } from "./getIdentity";

const { uri, name } = await getActualMainServer();

const token = process.env.TOKEN;
if (!token) {
  throw new Error("No token");
}

const { token: identityToken } = await getIdentityToken(uri, token);

await generateBindings(uri, name, identityToken, "output.wasm");
await generateBindings(uri, "bitcraft-7", identityToken, "output7.wasm");

process.exit(0);

import { getIdentityToken } from "./bindings/getIdentity";
import { rawRequest } from "./bindings/request";
import { getActualMainServer } from "./core/getActualMainServer";

const { uri } = await getActualMainServer();

const token = process.env.TOKEN;
if (!token) {
  throw new Error("No token");
}

const { token: identityToken } = await getIdentityToken(uri, token);

const { messageEmitter, ws } = rawRequest(
  uri,
  "bitcraft-7",
  identityToken,
  "SELECT * FROM experience_state WHERE entity_id = 288230376163739357"
);

messageEmitter.on("message", (message) => {
  console.log(message);
});

ws.addEventListener("close", () => process.exit(0));

import { getActualMainServer } from "./getActualMainServer";
// import { testGenerateBindings } from "./bindings/generate";
import { DbConnection, ErrorContext } from "../bindings";
// import { getIdentityToken } from "./getIdentity";

const { uri, name } = await getActualMainServer();
// const { token, identity } = await getIdentityToken(uri);
// const name = "bitcraft-general";

const token = process.env.TOKEN;
if (!token) {
  throw new Error("No token");
}

// it's works!!!
// testGenerateBindings(uri, name, token, "output.wasm");

export function connect() {
  return new Promise<DbConnection>((resolve) => {
    return DbConnection.builder()
      .withUri(uri.replace("http", "ws"))
      .withModuleName(name)
      .withToken(token)
      .onConnect((connection) => {
        console.log("Connected");
        resolve(connection);
      })
      .onDisconnect(onDisconnect)
      .onConnectError(onConnectError)
      .build();
  });
}

function onDisconnect(ctx: ErrorContext, error?: Error | undefined) {
  console.log("Disconnected");
  console.log(error);
}

function onConnectError(ctx: ErrorContext, error: Error) {
  console.log("Connection error");
  console.error(error);
}

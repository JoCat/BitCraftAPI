import { getActualMainServer } from "./getActualMainServer";
import { DbConnection, ErrorContext } from "../../bindings";

let { uri, name } = await getActualMainServer();
// name = "bitcraft-7";

const token = process.env.TOKEN;
if (!token) {
  throw new Error("No token");
}

export function connect(moduleName = name) {
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

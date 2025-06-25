import { getActualMainServer } from "../core/getActualMainServer";
import { generateBindings } from "./generate";

const { uri, name } = await getActualMainServer();

const token = process.env.TOKEN;
if (!token) {
  throw new Error("No token");
}

await generateBindings(uri, name, token, "output.wasm");
await generateBindings(uri, "bitcraft-7", token, "output7.wasm");

process.exit(0);

import { writeFile } from "fs/promises";
import { rawRequest } from "./request";

export function generateBindings(
  server: string,
  module: string,
  token: string,
  wasmPath: string
) {
  const { messageEmitter, ws } = rawRequest(
    server,
    module,
    token,
    "SELECT * FROM st_module"
  );

  messageEmitter.on("message", async (message) => {
    if (message.includes("program_bytes")) {
      console.log("Found program_bytes");

      try {
        const parsed = JSON.parse(message);
        const insertJsonString =
          parsed.InitialSubscription.database_update.tables[0].updates[0]
            .inserts[0];
        const inner = JSON.parse(insertJsonString);
        const wasmBytes = Buffer.from(inner.program_bytes, "hex");
        await writeFile(wasmPath, wasmBytes);
        ws.close();
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    }
  });

  return new Promise<void>((resolve) =>
    ws.addEventListener("close", () => resolve())
  );
}

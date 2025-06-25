import { writeFile } from "fs/promises";

export function generateBindings(
  server: string,
  module: string,
  token: string,
  wasmPath: string
) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(
      `${server}/v1/database/${module}/subscribe?token=${token}`,
      ["v1.json.spacetimedb"]
    );

    ws.onopen = () => {
      console.log("Connected!");

      const queryJson = {
        Subscribe: {
          query_strings: ["SELECT * FROM st_module"],
          request_id: 1,
        },
      };

      ws.send(JSON.stringify(queryJson));
    };

    ws.onmessage = async (event) => {
      const message =
        typeof event.data === "string"
          ? event.data
          : Buffer.from(event.data).toString("utf-8");

      if (message.includes("program_bytes")) {
        try {
          const parsed = JSON.parse(message);
          const insertJsonString =
            parsed.InitialSubscription.database_update.tables[0].updates[0]
              .inserts[0];
          const inner = JSON.parse(insertJsonString);
          const programBytesHex = inner.program_bytes;

          const wasmBytes = Buffer.from(programBytesHex, "hex");
          await writeFile(wasmPath, wasmBytes);

          ws.close();
          resolve(true);
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      }
    };

    ws.onclose = (event) => {
      console.error("WebSocket closed:", event.code, event.reason);
      reject(false);
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
      reject(false);
    };
  });
}

/// <reference no-default-lib="true"/>

export function testGenerateBindings(
  server: string,
  module: string,
  token: string,
  wasmPath: string
) {
  const ws = new WebSocket(`${server}/v1/database/${module}/subscribe`, {
    protocols: ["v1.json.spacetimedb"],
    headers: { Authorization: `Bearer ${token}` },
  });

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

  ws.onmessage = (event) => {
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
        Bun.write(wasmPath, wasmBytes);

        ws.close();
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    }
  };

  ws.onclose = (event) => {
    console.error("WebSocket closed:", event.code, event.reason);
  };

  ws.onerror = (event) => {
    console.error("WebSocket error:", event);
  };
}

import EventEmitter from "events";

interface MessageEmitter extends EventEmitter {
  on(event: "message", listener: (message: string) => void): this;
}

export function rawRequest(
  server: string,
  module: string,
  token: string,
  query: string
) {
  const messageEmitter: MessageEmitter = new EventEmitter();

  const ws = new WebSocket(
    `${server}/v1/database/${module}/subscribe?token=${token}`,
    ["v1.json.spacetimedb"]
  );

  ws.onopen = () => {
    console.log("Connected!");

    const queryJson = {
      Subscribe: {
        query_strings: [query],
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

    messageEmitter.emit("message", message);
  };

  ws.onclose = (event) => {
    console.error("WebSocket closed:", event.code, event.reason);
  };

  ws.onerror = (event) => {
    console.error("WebSocket error:", event);
  };

  return { messageEmitter, ws };
}

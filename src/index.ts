import { Elysia } from "elysia";
import { connect } from "./connect";

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

const connection = await connect();

connection
  .subscriptionBuilder()
  .onApplied((event) => {
    console.log(event);
  })
  .subscribe("SELECT * FROM empire_state");

connection.db.empireState.onInsert((event, row) => {
  console.log(row);
});

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

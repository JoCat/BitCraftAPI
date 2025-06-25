import Fastify from "fastify";
import { connect } from "./core/connect";

const connection = await connect();

// const chillingPlaceEmpireId = 1605n;

// connection
//   .subscriptionBuilder()
//   .onApplied((event) => {
//     console.log(event);
//   })
//   .subscribe(`SELECT * FROM empire_player_data_state`);

// console.log(
//   connection.db.empirePlayerDataState.entityId.find(chillingPlaceEmpireId)
// );

// connection.db.empirePlayerDataState.onInsert((_, row) => {
//   console.log("insert", row);
// });

// const fastify = Fastify({
//   logger: true,
// });

// fastify.get("/", async function handler(request, reply) {
//   return { hello: "world" };
// });

// try {
//   await fastify.listen({ port: 3000 });
// } catch (err) {
//   fastify.log.error(err);
//   process.exit(1);
// }

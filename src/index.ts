import Fastify from "fastify";
import { connect } from "./core/connect";

// const connection = await connect();
const connection7 = await connect("bitcraft-7");

const chillingPlaceEmpireId = 1605n;

// const subscribes = [
//   `SELECT * FROM empire_player_data_state empire WHERE empire.empire_entity_id = ${chillingPlaceEmpireId}`,
//   `SELECT username.* FROM player_username_state username JOIN empire_player_data_state empire ON username.entity_id = empire.entity_id WHERE empire.empire_entity_id = ${chillingPlaceEmpireId}`,
// ];

const subscribes7 = [
  // "SELECT * FROM skill_desc",
  "SELECT * FROM player_state WHERE entity_id = 288230376163739357",
  "SELECT * FROM experience_state WHERE entity_id = 288230376163739357",
];

// connection
//   .subscriptionBuilder()
//   .onError(() => console.error("Subscription error"))
//   .onApplied(() => console.log("Subscribed"))
//   .subscribe(subscribes);

connection7
  .subscriptionBuilder()
  .onError((ctx) => console.error("Subscription error", ctx.event))
  .onApplied(() => console.log("Subscribed"))
  .subscribe(subscribes7);

connection7.db.playerState.onInsert((playerState) => {
  console.log("i7 Player state", playerState);
});
connection7.db.experienceState.onInsert((experienceState) => {
  console.log("i7 Experience state", experienceState);
});
connection7.db.playerState.onUpdate((playerState) => {
  console.log("u7 Player state", playerState);
});
connection7.db.experienceState.onUpdate((experienceState) => {
  console.log("u7 Experience state", experienceState);
});

const fastify = Fastify();

fastify.get("/skills", async function handler() {
  return {
    skills: [...connection7.db.skillDesc.iter()],
  };
});

fastify.get("/users", async function handler() {
  console.log([...connection7.db.playerState.iter()]);

  return {
    // count: connection.db.empirePlayerDataState.count(),
    // users: [...connection.db.empirePlayerDataState.iter()].map((user) => {
    //   return {
    //     userId: user.entityId.toString(),
    //     username: connection.db.playerUsernameState.entityId.find(user.entityId)
    //       ?.username,
    //     stats: JsonStringify(
    //       connection7.db.experienceState.entityId.find(user.entityId) ?? {}
    //     ),
    //   };
    // }),
  };
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

function BigIntReplacer(_key: string, value: any) {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
}

function JsonStringify(data: any) {
  return JSON.parse(JSON.stringify(data, BigIntReplacer));
}

import Fastify from "fastify";
import { connect } from "./core/connect";

const connection = await connect();
const connection7 = await connect("bitcraft-7");

const chillingPlaceEmpireId = 1605n;

const subscribes = [
  `SELECT * FROM empire_player_data_state empire WHERE empire.empire_entity_id = ${chillingPlaceEmpireId}`,
  `SELECT username.* FROM player_username_state username JOIN empire_player_data_state empire ON username.entity_id = empire.entity_id WHERE empire.empire_entity_id = ${chillingPlaceEmpireId}`,
];

const subscribes7 = [
  "SELECT * FROM skill_desc",
  `SELECT player.* FROM player_state player JOIN empire_player_data_state empire ON player.entity_id = empire.entity_id WHERE empire.empire_entity_id = ${chillingPlaceEmpireId}`,
  `SELECT exp.* FROM experience_state exp JOIN empire_player_data_state empire ON exp.entity_id = empire.entity_id WHERE empire.empire_entity_id = ${chillingPlaceEmpireId}`,
];

connection
  .subscriptionBuilder()
  .onError(() => console.error("Subscription error"))
  .onApplied(() => console.log("Subscribed"))
  .subscribe(subscribes);

connection7
  .subscriptionBuilder()
  .onError((ctx) => console.error("Subscription error", ctx.event))
  .onApplied(() => console.log("Subscribed"))
  .subscribe(subscribes7);

const skills: Record<number, any> = {};

connection7.db.skillDesc.onInsert((_, skill) => {
  skills[skill.id] = {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    title: skill.title,
    type: skill.skillCategory.tag,
    maxLevel: skill.maxLevel,
  };
});

const fastify = Fastify();

fastify.get("/skills", async function handler() {
  return { skills: Object.values(skills) };
});

fastify.get("/users", async function handler() {
  return {
    count: connection.db.empirePlayerDataState.count(),
    users: [...connection.db.empirePlayerDataState.iter()].map((user) => {
      const userSkills =
        connection7.db.experienceState.entityId.find(user.entityId)
          ?.experienceStacks ?? [];

      const playerState = connection7.db.playerState.entityId.find(
        user.entityId
      );

      return {
        userId: user.entityId.toString(),
        username: connection.db.playerUsernameState.entityId.find(user.entityId)
          ?.username,
        timePlayed: playerState?.timePlayed ?? 0,
        stats: Object.fromEntries(
          userSkills.map((userSkill) => {
            const skillData = skills[userSkill.skillId];
            return [
              skillData.name,
              {
                quantity: userSkill.quantity,
                level: levelFromExp(userSkill.quantity),
              },
            ];
          })
        ),
      };
    }),
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

function levelFromExp(xp: number): number {
  const r = 1.10572;
  const lvl = 1 + Math.log(1 + (xp * (r - 1)) / 640.0) / Math.log(r);
  return Math.floor(lvl);
}

function ExperienceToLevel(experience: number) {
  const baseValue = 4082 * 5120;
  var level = 8 * Math.log2(experience / baseValue) + 80;
  return level;
}

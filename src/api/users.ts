import { connectionGlobal, connectionRegion7 } from "../connections";
import { getSkillById } from "./skills";

const chillingPlaceEmpireId = 1605n;

connectionGlobal
  .subscriptionBuilder()
  .onError(() => console.error("Users global subscription error"))
  .onApplied(() => console.log("Users global subscribed"))
  .subscribe([
    `SELECT * FROM empire_player_data_state empire WHERE empire.empire_entity_id = ${chillingPlaceEmpireId}`,
    `SELECT username.* FROM player_username_state username JOIN empire_player_data_state empire ON username.entity_id = empire.entity_id WHERE empire.empire_entity_id = ${chillingPlaceEmpireId}`,
  ]);

connectionRegion7
  .subscriptionBuilder()
  .onError(() => console.error("Users region-7 subscription error"))
  .onApplied(() => console.log("Users region-7 subscribed"))
  .subscribe([
    `SELECT player.* FROM player_state player JOIN empire_player_data_state empire ON player.entity_id = empire.entity_id WHERE empire.empire_entity_id = ${chillingPlaceEmpireId}`,
    `SELECT exp.* FROM experience_state exp JOIN empire_player_data_state empire ON exp.entity_id = empire.entity_id WHERE empire.empire_entity_id = ${chillingPlaceEmpireId}`,
  ]);

export const routes = [
  {
    method: "GET",
    url: "/users",
    schema: {
      description:
        "Get users (the selection is temporarily limited to the Chilling Place empire)",
      response: {
        200: {
          type: "object",
          properties: {
            count: { type: "number" },
            users: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  username: { type: "string" },
                  timePlayed: { type: "number" },
                  stats: {
                    type: "object",
                    properties: {},
                  },
                },
              },
            },
          },
        },
      },
    },
    handler: () => {
      return {
        count: connectionGlobal.db.empirePlayerDataState.count(),
        users: [...connectionGlobal.db.empirePlayerDataState.iter()].map(
          (user) => {
            const userSkills =
              connectionRegion7.db.experienceState.entityId.find(user.entityId)
                ?.experienceStacks ?? [];
            const playerState = connectionRegion7.db.playerState.entityId.find(
              user.entityId
            );
            return {
              userId: user.entityId.toString(),
              username: connectionGlobal.db.playerUsernameState.entityId.find(
                user.entityId
              )?.username,
              timePlayed: playerState?.timePlayed ?? 0,
              stats: Object.fromEntries(
                userSkills.map((userSkill) => {
                  const skillData = getSkillById(userSkill.skillId);
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
          }
        ),
      };
    },
  },
];

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
  if (xp <= 0) return 0;
  const r = 1.10572;
  const lvl = 1 + Math.log(1 + (xp * (r - 1)) / 640.0) / Math.log(r);
  return Math.floor(lvl);
}

function ExperienceToLevel(experience: number) {
  const baseValue = 4082 * 5120;
  var level = 8 * Math.log2(experience / baseValue) + 80;
  return level;
}

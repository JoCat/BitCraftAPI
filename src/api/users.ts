import { getConnection } from "../connections";
import { getSkillById } from "./skills";

const chillingPlaceEmpireId = 1605n;

// Oh shit...
const connectionGlobal = await getConnection();
const connectionRegion7 = await getConnection("bitcraft-7");

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
                  skills: {
                    type: "object",
                    additionalProperties: {
                      type: "object",
                      properties: {
                        quantity: { type: "number" },
                        level: { type: "number" },
                      },
                    },
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
              connectionRegion7.db.experienceState.entityId.find(
                user.entityId
              )?.experienceStacks;

            let skills: Record<string, { quantity: number; level: number }> =
              {};
            if (userSkills) {
              userSkills.forEach((userSkill) => {
                const skillData = getSkillById(userSkill.skillId);
                if (!skillData || skillData.name === "ANY") return;

                skills[skillData.name] = {
                  quantity: userSkill.quantity,
                  level: levelFromExp(userSkill.quantity),
                };
              });
            }

            const playerState = connectionRegion7.db.playerState.entityId.find(
              user.entityId
            );

            return {
              userId: user.entityId.toString(),
              username: connectionGlobal.db.playerUsernameState.entityId.find(
                user.entityId
              )?.username,
              timePlayed: playerState?.timePlayed ?? 0,
              skills,
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

// cheap and dirty workaround
const levelsExp = [
  0, 640, 1340, 2130, 2990, 3950, 5000, 6170, 7470, 8900, 10480, 12230, 14160,
  16300, 18660, 21280, 24170, 27360, 30900, 34800, 39120, 43900, 49180, 55020,
  61480, 68620, 76520, 85250, 94900, 105580, 117380, 130430, 144870, 160820,
  178470, 197980, 219550, 243400, 269780, 298940, 331190, 366850, 406280,
  449870, 498080, 551380, 610320, 675490, 747550, 827230, 915340, 1012760,
  1120480, 1239590, 1371290, 1516920, 1677940, 1855990, 2052870, 2270560,
  2511270, 2777430, 3071730, 3397150, 3756970, 4154840, 4594770, 5081220,
  5619100, 6213850, 6871490, 7596660, 8393710, 9268520, 10223770, 11265640,
  12563780, 13892800, 15362330, 16987240, 18783950, 20770630, 22967360,
  25396360, 28082170, 31051960, 34335740, 37966720, 41981610, 46421000,
  51329760, 56757530, 62759190, 69394400, 76729260, 84836300, 93794960,
  103692650, 114626640, 126704730,
];

function levelFromExp(exp: number) {
  let level = 0;
  while (exp > levelsExp[level]) {
    level++;
  }
  return level;
}

import { RouteOptions } from "fastify";
import { redisClient } from "../core/redis";
import { getConnection } from "../connections";

const SKILLS_CACHE_KEY = "BITCRAFT:SKILLS";

export async function fetchSkills() {
  const cachedSkills = await redisClient.HGETALL(SKILLS_CACHE_KEY);

  const skillsList = Object.values(cachedSkills);
  if (skillsList.length > 0) {
    console.log("Using cached skills");
    skillsList.forEach((item) => skills.push(JSON.parse(item)));
    return;
  }

  const connectionGlobal = await getConnection();

  connectionGlobal
    .subscriptionBuilder()
    .onError(() => console.error("Skills subscription error"))
    .onApplied(() => console.log("Skills subscribed"))
    .subscribe(["SELECT * FROM skill_desc"]);

  connectionGlobal.db.skillDesc.onInsert((_, skill) => {
    const formatedSkill = {
      id: skill.id,
      name: skill.name,
      title: skill.title,
      type: skill.skillCategory.tag,
      maxLevel: skill.maxLevel,
    };

    skills.push(formatedSkill);
    redisClient.HSET(SKILLS_CACHE_KEY, skill.id, JSON.stringify(formatedSkill));
  });
}
fetchSkills();

interface Skill {
  id: number;
  name: string;
  title: string;
  type: string;
  maxLevel: number;
}

const skills: Skill[] = [];

export function getSkillById(id: number) {
  return skills.find((skill) => skill.id === id);
}

export const routes: RouteOptions[] = [
  {
    method: "GET",
    url: "/skills",
    schema: {
      description: "Get all skills",
      response: {
        200: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  name: { type: "string" },
                  title: { type: "string" },
                  type: { type: "string" },
                  maxLevel: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    handler: () => ({ data: skills }),
  },
];

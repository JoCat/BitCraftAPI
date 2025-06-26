import { RouteOptions } from "fastify";
import { connectionGlobal } from "../connections";

connectionGlobal
  .subscriptionBuilder()
  .onError(() => console.error("Skills subscription error"))
  .onApplied(() => console.log("Skills subscribed"))
  .subscribe(["SELECT * FROM skill_desc"]);

interface Skill {
  id: number;
  name: string;
  title: string;
  type: string;
  maxLevel: number;
}

const skills: Record<number, Skill> = {};

export function getSkills() {
  return skills;
}
export function getSkill(id: number) {
  return skills[id];
}

connectionGlobal.db.skillDesc.onInsert((_, skill) => {
  skills[skill.id] = {
    id: skill.id,
    name: skill.name,
    title: skill.title,
    type: skill.skillCategory.tag,
    maxLevel: skill.maxLevel,
  };
});

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
    handler: () => {
      return { data: Object.values(skills) };
    },
  },
];

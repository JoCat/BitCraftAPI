import { RouteOptions } from "fastify";
import { getConnection } from "../connections";
import { redisClient } from "../core/redis";

const CARGOES_CACHE_KEY = "BITCRAFT:CARGOES";

export async function fetchCargoes() {
  const cachedCargoes = await redisClient.HGETALL(CARGOES_CACHE_KEY);

  const cargoesList = Object.values(cachedCargoes);
  if (cargoesList.length > 0) {
    console.log("Using cached cargoes");
    cargoesList.forEach((cargo) => cargoes.push(JSON.parse(cargo)));
    return;
  }

  const connectionGlobal = await getConnection();

  connectionGlobal
    .subscriptionBuilder()
    .onError(() => console.error("Cargoes subscription error"))
    .onApplied(() => console.log("Cargoes subscribed"))
    .subscribe(["SELECT * FROM cargo_desc"]);

  connectionGlobal.db.cargoDesc.onInsert((_, cargo) => {
    const formatedCargo = {
      id: cargo.id,
      name: cargo.name,
      description: cargo.description,
      volume: cargo.volume,
      secondaryKnowledgeId: cargo.secondaryKnowledgeId,
      pickUpTime: cargo.pickUpTime,
      animatorState: cargo.animatorState,
      movementModifier: cargo.movementModifier,
      despawnTime: cargo.despawnTime,
      tier: cargo.tier,
      tag: cargo.tag,
      rarity: cargo.rarity.tag,
      notPickupable: cargo.notPickupable,
    };

    cargoes.push(formatedCargo);
    redisClient.HSET(
      CARGOES_CACHE_KEY,
      cargo.id,
      JSON.stringify(formatedCargo)
    );
  });
}
fetchCargoes();

interface Cargo {
  id: number;
  name: string;
  description: string;
  volume: number;
  secondaryKnowledgeId: number;
  pickUpTime: number;
  animatorState: string;
  movementModifier: number;
  despawnTime: number;
  tier: number;
  tag: string;
  rarity: string;
  notPickupable: boolean;
}

const cargoes: Cargo[] = [];

export const routes: RouteOptions[] = [
  {
    method: "GET",
    url: "/cargoes",
    schema: {
      description: "Get all cargoes",
      response: {
        200: {
          type: "object",
          properties: {
            count: { type: "number" },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  name: { type: "string" },
                  description: { type: "string" },
                  volume: { type: "number" },
                  secondaryKnowledgeId: { type: "number" },
                  pickUpTime: { type: "number" },
                  animatorState: { type: "string" },
                  movementModifier: { type: "number" },
                  despawnTime: { type: "number" },
                  tier: { type: "number" },
                  tag: { type: "string" },
                  rarity: { type: "string" },
                  notPickupable: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    handler: () => ({ count: cargoes.length, data: cargoes }),
  },
];

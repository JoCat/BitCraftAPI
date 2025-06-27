import { RouteOptions } from "fastify";
import { getConnection } from "../connections";
import { redisClient } from "../core/redis";

const ITEMS_CACHE_KEY = "BITCRAFT:ITEMS";

export async function fetchItems() {
  const cachedItems = await redisClient.HGETALL(ITEMS_CACHE_KEY);

  const itemsList = Object.values(cachedItems);
  if (itemsList.length > 0) {
    console.log("Using cached items");
    itemsList.forEach((item) => items.push(JSON.parse(item)));
    return;
  }

  const connectionGlobal = await getConnection();

  connectionGlobal
    .subscriptionBuilder()
    .onError(() => console.error("Items subscription error"))
    .onApplied(() => console.log("Items subscribed"))
    .subscribe(["SELECT * FROM item_desc"]);

  connectionGlobal.db.itemDesc.onInsert((_, item) => {
    const formatedItem = {
      id: item.id,
      name: item.name,
      description: item.description,
      volume: item.volume,
      durability: item.durability,
      convertToOnDurabilityZero: item.convertToOnDurabilityZero,
      secondaryKnowledgeId: item.secondaryKnowledgeId,
      tier: item.tier,
      tag: item.tag,
      rarity: item.rarity.tag,
      compendiumEntry: item.compendiumEntry,
      itemListId: item.itemListId,
    };

    items.push(formatedItem);
    redisClient.HSET(ITEMS_CACHE_KEY, item.id, JSON.stringify(formatedItem));
  });
}
fetchItems();

interface Item {
  id: number;
  name: string;
  description: string;
  volume: number;
  durability: number;
  convertToOnDurabilityZero: number;
  secondaryKnowledgeId: number;
  tier: number;
  tag: string;
  rarity: string;
  compendiumEntry: boolean;
  itemListId: number;
}

const items: Item[] = [];

export const routes: RouteOptions[] = [
  {
    method: "GET",
    url: "/items",
    schema: {
      description: "Get all items",
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
                  durability: { type: "number" },
                  convertToOnDurabilityZero: { type: "number" },
                  secondaryKnowledgeId: { type: "number" },
                  tier: { type: "number" },
                  tag: { type: "string" },
                  rarity: { type: "string" },
                  compendiumEntry: { type: "boolean" },
                  itemListId: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    handler: () => ({ count: items.length, data: items }),
  },
];

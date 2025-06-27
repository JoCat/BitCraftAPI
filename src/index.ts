import Fastify from "fastify";
import { routes as skillsRoutes } from "./api/skills";
import { routes as itemsRoutes } from "./api/items";

const fastify = Fastify();

await fastify.register(import("@fastify/swagger"), {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "BitCaft API",
      description: "Experimental API for BitCaft Online",
      version: "0.1.0",
    },
  },
});

await fastify.register(import("@scalar/fastify-api-reference"), {
  routePrefix: "/",
});

skillsRoutes.forEach((route) => fastify.route(route));
itemsRoutes.forEach((route) => fastify.route(route));

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

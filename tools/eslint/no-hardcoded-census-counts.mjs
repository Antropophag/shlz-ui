const propertyName = (node) => {
  if (node?.type !== "MemberExpression") return null;
  if (!node.computed) return node.property.name;
  return node.property.type === "Literal" ? node.property.value : null;
};

const isCensusCount = (node) =>
  propertyName(node) === "primitiveDependencyPathCount" ||
  (propertyName(node) === "length" &&
    propertyName(node.object) === "primitiveDependencies");
const isNumber = (node) =>
  node?.type === "Literal" && typeof node.value === "number";

export default {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      duplicatedCount:
        "Do not duplicate a measured census count as a numeric expectation. Compare independently discovered paths with the manifest instead.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const method = propertyName(node.callee);
        const [first, second] = node.arguments;
        let duplicatesCount = false;
        if (
          ["equal", "strictEqual", "deepEqual", "deepStrictEqual"].includes(
            method,
          )
        ) {
          duplicatesCount =
            (isCensusCount(first) && isNumber(second)) ||
            (isNumber(first) && isCensusCount(second));
        } else if (
          ["toHaveLength", "toBe", "toEqual", "toStrictEqual"].includes(method)
        ) {
          const receiver = node.callee.object;
          const value =
            receiver?.type === "CallExpression" &&
            receiver.callee.type === "Identifier" &&
            receiver.callee.name === "expect"
              ? receiver.arguments[0]
              : null;
          duplicatesCount =
            isNumber(first) &&
            (method === "toHaveLength"
              ? propertyName(value) === "primitiveDependencies"
              : isCensusCount(value));
        }
        if (duplicatesCount)
          context.report({ node, messageId: "duplicatedCount" });
      },
    };
  },
};

import { print } from "recast";
import { builders, namedTypes } from "ast-types";
import {
  parse,
  transformTemplateLiteralToStringLiteral,
  interpolate,
  removeTSInterfaceDeclares,
  findContainedIdentifiers,
  importContainedIdentifiers,
  importNames,
  removeESLintComments,
  expression,
} from "./ast";

describe("interpolate", () => {
  test("Evaluates template literal", () => {
    const mapping = {
      NAME: builders.stringLiteral("World"),
    };
    // eslint-disable-next-line no-template-curly-in-string
    const file = parse("`Hello, ${NAME}!`");
    interpolate(file, mapping);
    const { code } = print(file);
    expect(code).toBe('"Hello, World!"');
  });
  test("Evaluates JSX contained string literal expression", () => {
    const mapping = {
      NAME: builders.stringLiteral("World"),
    };
    const file = parse("<div>Hello, {NAME}</div>");
    interpolate(file, mapping);
    const { code } = print(file);
    expect(code).toBe("<div>Hello, World</div>");
  });
  test("Evaluates JSX contained fragment", () => {
    const mapping = {
      NAME: builders.jsxFragment(
        builders.jsxOpeningFragment(),
        builders.jsxClosingFragment(),
        [builders.jsxText("World")]
      ),
    };
    const file = parse("<div>Hello, {NAME}</div>");
    interpolate(file, mapping);
    const { code } = print(file);
    expect(code).toBe("<div>Hello, World</div>");
  });
  test("Evaluates JSX contained fragment in fragment", () => {
    const mapping = {
      NAME: builders.jsxFragment(
        builders.jsxOpeningFragment(),
        builders.jsxClosingFragment(),
        [builders.jsxText("World")]
      ),
    };
    const file = parse("<>Hello, {NAME}</>");
    interpolate(file, mapping);
    const { code } = print(file);
    expect(code).toBe("<>Hello, World</>");
  });
  test("handles type arguments correctly", () => {
    const mapping = {
      NAME: builders.identifier("World"),
    };
    const file = parse("sayHello<NAME>(world)");
    interpolate(file, mapping);
    const { code } = print(file);
    expect(code).toBe("sayHello<World>(world)");
  });
});

describe("transformTemplateLiteralToStringLiteral", () => {
  test("Quasis only", () => {
    const quasis = [
      builders.templateElement({ cooked: "Hello", raw: "Hello" }, true),
    ];
    const expressions = [] as namedTypes.StringLiteral[];
    const templateLiteral = builders.templateLiteral(quasis, expressions);
    const stringLiteral = transformTemplateLiteralToStringLiteral(
      templateLiteral
    );
    expect(stringLiteral.value).toBe("Hello");
  });
  test("Single qusie and string literal", () => {
    const quasis = [
      builders.templateElement({ cooked: "Hello, ", raw: "Hello, " }, true),
    ];
    const expressions = [builders.stringLiteral("World")];
    const templateLiteral = builders.templateLiteral(quasis, expressions);
    const stringLiteral = transformTemplateLiteralToStringLiteral(
      templateLiteral
    );
    expect(stringLiteral.value).toBe("Hello, World");
  });
  test("Two quasis and string literal", () => {
    const quasis = [
      builders.templateElement({ cooked: "Hello, ", raw: "Hello, " }, false),
      builders.templateElement({ cooked: "!", raw: "!" }, true),
    ];
    const expressions = [builders.stringLiteral("World")];
    const templateLiteral = builders.templateLiteral(quasis, expressions);
    const stringLiteral = transformTemplateLiteralToStringLiteral(
      templateLiteral
    );
    expect(stringLiteral.value).toBe("Hello, World!");
  });
});

describe("removeTSInterfaceDeclares", () => {
  test("removes interface declares", () => {
    const file = parse(`declare interface A {}; interface B {}`);
    removeTSInterfaceDeclares(file);
    expect(print(file).code).toEqual(`interface B {}`);
  });
});

describe("removeESLintComments", () => {
  test("removes ESLint block comments", () => {
    const file = parse(`/* eslint-disable */ function f(x) { return x * 2 }`);
    removeESLintComments(file);
    expect(print(file).code).toEqual(`function f(x) { return x * 2 }`);
  });
  test("removes ESLint line comments", () => {
    const file = parse(
      `// eslint-disable-next-line
      function f(x) { return x * 2 }`
    );
    removeESLintComments(file);
    expect(print(file).code).toEqual(`function f(x) { return x * 2 }`);
  });
});

describe("findContainedIdentifiers", () => {
  test("contained identifier", () => {
    const file = parse("f(x)");
    const ids = [builders.identifier("x")];
    const containedIds = findContainedIdentifiers(file, ids);
    expect(containedIds.map((id) => id.name)).toEqual(ids.map((id) => id.name));
  });
  test("two contained identifiers", () => {
    const file = parse("f(x)");
    const ids = [builders.identifier("f"), builders.identifier("x")];
    const containedIds = findContainedIdentifiers(file, ids);
    expect(containedIds.map((id) => id.name)).toEqual(ids.map((id) => id.name));
  });
  test("uncontained identifier", () => {
    const file = parse("f(x)");
    const ids = [builders.identifier("g")];
    const containedIds = findContainedIdentifiers(file, ids);
    expect(containedIds.map((id) => id.name)).toEqual([]);
  });
  test("contained identifier and uncontained identifier", () => {
    const file = parse("f(x)");
    const xID = builders.identifier("x");
    const ids = [xID, builders.identifier("g")];
    const containedIds = findContainedIdentifiers(file, ids);
    expect(containedIds.map((id) => id.name)).toEqual([xID.name]);
  });
  test("contained identifier in decorator", () => {
    const file = parse(`
class A {
  @x
  b: string;
}
    `);
    const ids = [builders.identifier("x")];
    const containedIds = findContainedIdentifiers(file, ids);
    expect(containedIds.map((id) => id.name)).toEqual(ids.map((id) => id.name));
  });
  test("contained identifier appearing twice", () => {
    const file = parse(`
class A {
  @IsInstance(x)
  b: x;
}
    `);
    const ids = [builders.identifier("x"), builders.identifier("x")];
    const containedIds = findContainedIdentifiers(file, ids);
    expect(containedIds.map((id) => id.name)).toEqual(ids.map((id) => id.name));
  });
});

describe("importContainedIdentifiers", () => {
  test("imports contained identifiers", () => {
    const file = parse(`
class A {
  @IsInstance(x)
  b: x;
}
    `);
    const module = "class-validator";
    const id = builders.identifier("IsInstance");
    const moduleToIds = {
      [module]: [id],
    };
    const compactImport = (declaration: namedTypes.ImportDeclaration) => [
      declaration.specifiers?.map((specifier) => specifier.id?.name),
      declaration.source.value,
    ];
    expect(
      importContainedIdentifiers(file, moduleToIds).map(compactImport)
    ).toEqual([compactImport(importNames([id], module))]);
  });
});

describe("expression", () => {
  test("creates expression from code template literal", () => {
    const createdExpression = expression`() => 42`;
    expect(print(createdExpression).code).toEqual("() => 42");
  });
  test("creates expression from code template literal with string substitution", () => {
    const createdExpression = expression`() => ${"42"}`;
    expect(print(createdExpression).code).toEqual("() => 42");
  });
  test("creates expression from code template literal with AST substitution", () => {
    const createdExpression = expression`() => ${builders.numericLiteral(42)}`;
    expect(print(createdExpression).code).toEqual("() => 42");
  });
});

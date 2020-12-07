import { print } from "recast";
import { builders } from "ast-types";
import { Module } from "../../types";
import { readFile, relativeImportPath } from "../../util/module";
import {
  getExportedNames,
  interpolate,
  importNames,
  addImports,
  removeTSVariableDeclares,
  removeESLintComments,
  removeTSIgnoreComments,
} from "../../util/ast";
import { SRC_DIRECTORY } from "../constants";

const appModuleTemplatePath = require.resolve("./app.module.template.ts");
const MODULE_PATH = `${SRC_DIRECTORY}/app.module.ts`;
const MODULE_PATTERN = /\.module\.ts$/;
const MORGAN_MODULE_ID = builders.identifier("MorganModule");

export async function createAppModule(
  resourceModules: Module[],
  staticModules: Module[]
): Promise<Module> {
  const nestModules = [
    ...resourceModules.filter((module) => module.path.match(MODULE_PATTERN)),
    ...staticModules.filter((module) => module.path.match(MODULE_PATTERN)),
  ];

  const nestModulesWithExports = nestModules.map((module) => ({
    module,
    exports: getExportedNames(module.code),
  }));
  const moduleImports = nestModulesWithExports.map(({ module, exports }) => {
    /** @todo explicitly check for "@Module" decorated classes */
    return importNames(
      // eslint-disable-next-line
      // @ts-ignore
      exports,
      relativeImportPath(MODULE_PATH, module.path)
    );
  });

  const nestModulesIds = nestModulesWithExports.flatMap(
    /** @todo explicitly check for "@Module" decorated classes */
    ({ exports }) => exports
  );
  const modules = builders.arrayExpression([
    ...nestModulesIds,
    MORGAN_MODULE_ID,
  ]);

  const file = await readFile(appModuleTemplatePath);

  interpolate(file, {
    MODULES: modules,
  });

  addImports(file, [
    ...moduleImports,
    builders.importDeclaration(
      [builders.importSpecifier(MORGAN_MODULE_ID)],
      builders.stringLiteral("nest-morgan")
    ),
  ]);
  removeTSIgnoreComments(file);
  removeESLintComments(file);
  removeTSVariableDeclares(file);

  return {
    path: MODULE_PATH,
    code: print(file).code,
  };
}

import { builders } from "ast-types";
import { print } from "recast";
import { Module } from "../../../types";
import { relativeImportPath, readFile } from "../../../util/module";
import {
  interpolate,
  removeTSIgnoreComments,
  importNames,
  addImports,
  removeTSClassDeclares,
  removeESLintComments,
} from "../../../util/ast";
import { SRC_DIRECTORY } from "../../constants";

const moduleTemplatePath = require.resolve("./module.template.ts");

export async function createModule(
  entityName: string,
  entityType: string,
  entityServiceModule: string,
  entityControllerModule: string
): Promise<Module> {
  const modulePath = `${SRC_DIRECTORY}/${entityName}/${entityName}.module.ts`;
  const file = await readFile(moduleTemplatePath);
  const controllerId = builders.identifier(`${entityType}Controller`);
  const serviceId = builders.identifier(`${entityType}Service`);
  const moduleId = builders.identifier(`${entityType}Module`);

  interpolate(file, {
    ENTITY: builders.identifier(entityType),
    SERVICE: serviceId,
    CONTROLLER: controllerId,
    MODULE: moduleId,
  });

  const serviceImport = importNames(
    [serviceId],
    relativeImportPath(modulePath, entityServiceModule)
  );

  const controllerImport = importNames(
    [controllerId],
    relativeImportPath(modulePath, entityControllerModule)
  );

  addImports(file, [serviceImport, controllerImport]);

  removeTSIgnoreComments(file);
  removeESLintComments(file);
  removeTSClassDeclares(file);

  return {
    path: modulePath,
    code: print(file).code,
  };
}

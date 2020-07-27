import { builders } from "ast-types";
import { Module, relativeImportPath, readFile } from "../util/module";
import {
  interpolate,
  removeTSIgnoreComments,
  importNames,
  addImports,
  removeTSClassDeclares,
} from "../util/ast";
import { print } from "recast";

const moduleTemplatePath = require.resolve("./templates/module.ts");

export async function createResourceModule(
  modulePath: string,
  entityType: string,
  entityServiceModule: string,
  entityControllerModule: string
): Promise<Module> {
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
  removeTSClassDeclares(file);

  return {
    path: modulePath,
    code: print(file).code,
  };
}

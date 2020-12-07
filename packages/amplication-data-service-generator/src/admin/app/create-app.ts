import * as path from "path";
import { print } from "recast";
import { builders } from "ast-types";
import { paramCase } from "param-case";
import { plural } from "pluralize";
import { Module } from "../../types";
import {
  addImports,
  importNames,
  interpolate,
  removeTSIgnoreComments,
  removeTSVariableDeclares,
} from "../../util/ast";
import { readFile, relativeImportPath } from "../../util/module";
import { EntityComponents } from "../types";
import { SRC_DIRECTORY } from "../constants";
import { jsxElement, jsxFragment } from "../util";

const navigationTemplatePath = path.resolve(__dirname, "App.template.tsx");
const PATH = `${SRC_DIRECTORY}/App.tsx`;

export async function createAppModule(
  entitiesComponents: Record<string, EntityComponents>
): Promise<Module> {
  const file = await readFile(navigationTemplatePath);
  const entitiesRoutes = Object.entries(entitiesComponents).flatMap(
    ([entityName, entityComponents]) => {
      const entityPath = "/" + paramCase(plural(entityName));
      return [
        jsxElement`<Route exact path="${entityPath}" component={${entityComponents.list.name}} />`,
        jsxElement`<Route exact path="${entityPath}/new" component={${entityComponents.new.name}} />`,
        jsxElement`<Route exact path="${entityPath}/:id" component={${entityComponents.entity.name}} />`,
      ];
    }
  );
  interpolate(file, {
    ROUTES: jsxFragment`<>${entitiesRoutes}</>`,
  });
  removeTSVariableDeclares(file);
  removeTSIgnoreComments(file);
  const entityImports = Object.values(
    entitiesComponents
  ).flatMap((entityComponents) =>
    Object.values(entityComponents).map((component) =>
      importNames(
        [builders.identifier(component.name)],
        relativeImportPath(PATH, component.modulePath)
      )
    )
  );
  addImports(file, [...entityImports]);
  return {
    path: PATH,
    code: print(file).code,
  };
}

import { builders, namedTypes } from "ast-types";
import { Entity } from "../../../../../types";
import { readFile } from "../../../../../util/module";
import {
  interpolate,
  NamedClassDeclaration,
  removeTSClassDeclares,
  getClassDeclarationById,
} from "../../../../../util/ast";

const templatePath = require.resolve("./find-many-args.template.ts");

export async function createFindManyArgs(
  entity: Entity,
  whereInput: NamedClassDeclaration
): Promise<NamedClassDeclaration> {
  const file = await readFile(templatePath);
  const id = createId(entity.name);

  interpolate(file, {
    ID: id,
    WHERE_INPUT: whereInput.id,
  });

  removeTSClassDeclares(file);

  return getClassDeclarationById(file, id) as NamedClassDeclaration;
}

export function createId(entityType: string): namedTypes.Identifier {
  return builders.identifier(`FindMany${entityType}Args`);
}

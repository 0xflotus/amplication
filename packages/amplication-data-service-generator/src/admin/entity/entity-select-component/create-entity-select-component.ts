import * as path from "path";
import { builders } from "ast-types";
import { Entity } from "../../../types";
import { addImports, importNames, interpolate } from "../../../util/ast";
import { readFile, relativeImportPath } from "../../../util/module";
import { DTOs } from "../../../server/resource/create-dtos";
import { EntityComponent } from "../../types";
import { getEntityTitleField } from "../entity-title-component/create-entity-title-component";
const template = path.resolve(
  __dirname,
  "entity-select-component.template.tsx"
);

export async function createEntitySelectComponent(
  entity: Entity,
  dtos: DTOs,
  entityToDirectory: Record<string, string>,
  entityToResource: Record<string, string>,
  dtoNameToPath: Record<string, string>
): Promise<EntityComponent> {
  const file = await readFile(template);
  const name = `${entity.name}Select`;
  const modulePath = `${entityToDirectory[entity.name]}/${name}.tsx`;
  const resource = entityToResource[entity.name];
  const entityDTO = dtos[entity.name].entity;

  interpolate(file, {
    ENTITY: builders.identifier(entity.name),
    ENTITY_SELECT: builders.identifier(name),
    RESOURCE: builders.stringLiteral(resource),
    ENTITY_TITLE_FIELD: builders.identifier(getEntityTitleField(entity)),
  });

  addImports(file, [
    importNames(
      [entityDTO.id],
      relativeImportPath(modulePath, dtoNameToPath[entityDTO.id.name])
    ),
  ]);

  return { name, file, modulePath };
}

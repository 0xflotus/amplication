import { builders } from "ast-types";
import { Entity } from "../../../types";
import { classDeclaration, NamedClassDeclaration } from "../../../util/ast";
import {
  isRelationField,
  isOneToOneRelationField,
  isPasswordField,
} from "../../../util/field";
import { createFieldClassProperty } from "./create-field-class-property";
import { OBJECT_TYPE_ID } from "./nestjs-graphql.util";

export const OBJECT_TYPE_DECORATOR = builders.decorator(
  builders.callExpression(OBJECT_TYPE_ID, [])
);

export function createEntityDTO(
  entity: Entity,
  entityIdToName: Record<string, string>
): NamedClassDeclaration {
  const properties = entity.fields
    .filter(
      (field) =>
        (!isRelationField(field) || isOneToOneRelationField(field)) &&
        !isPasswordField(field)
    )
    .map((field) =>
      createFieldClassProperty(
        field,
        !field.required,
        false,
        false,
        entityIdToName
      )
    );
  return classDeclaration(
    builders.identifier(entity.name),
    builders.classBody(properties),
    null,
    [OBJECT_TYPE_DECORATOR]
  ) as NamedClassDeclaration;
}

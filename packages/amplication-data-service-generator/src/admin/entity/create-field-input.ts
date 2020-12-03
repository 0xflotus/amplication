import { namedTypes } from "ast-types";
import { EnumDataType, EntityField } from "../../types";
import { jsxElement } from "../util";

/**
 * Creates an input element to be placed inside a Formik form for editing the given entity field
 * @param field the entity field to create input for
 * @returns the input element AST representation
 */
export function createFieldInput(field: EntityField): namedTypes.JSXElement {
  const createDataTypeFieldInput = DATA_TYPE_TO_FIELD_INPUT[field.dataType];
  if (!createDataTypeFieldInput) {
    throw new Error(
      `Can not display field ${field.name} with data type ${field.dataType}`
    );
  }
  return jsxElement`<div><label>${
    field.displayName
  }</label>{" "}${createDataTypeFieldInput(field)}</div>`;
}

const DATA_TYPE_TO_FIELD_INPUT: {
  [key in EnumDataType]: null | ((field: EntityField) => namedTypes.JSXElement);
} = {
  [EnumDataType.SingleLineText]: (field) =>
    jsxElement`<TextField name="${field.name}" />`,
  [EnumDataType.MultiLineText]: (field) =>
    jsxElement`<TextField name="${field.name}" textarea />`,
  [EnumDataType.Email]: (field) =>
    jsxElement`<TextField type="email" name="${field.name}" />`,
  [EnumDataType.WholeNumber]: (field) =>
    jsxElement`<TextField type="number" step={1} name="${field.name}" />`,
  [EnumDataType.DateTime]: (field) => {
    const { dateOnly } = field.properties;
    return dateOnly
      ? jsxElement`<TextField type="date" name="${field.name}" />`
      : jsxElement`<TextField type="datetime-local" name="${field.name}" />`;
  },
  [EnumDataType.DecimalNumber]: (field) =>
    jsxElement`<TextField type="number" name="${field.name}" />`,
  /** @todo use search */
  [EnumDataType.Lookup]: (field) =>
    jsxElement`<TextField name="${field.name}" />`,
  /** @todo use select */
  [EnumDataType.MultiSelectOptionSet]: (field) =>
    jsxElement`<TextField name="${field.name}" />`,
  /** @todo use select */
  [EnumDataType.OptionSet]: (field) =>
    jsxElement`<TextField name="${field.name}" />`,
  [EnumDataType.Boolean]: (field) =>
    jsxElement`<TextField type="checkbox" name="${field.name}" />`,
  /** @todo use geographic location */
  [EnumDataType.GeographicLocation]: (field) =>
    jsxElement`<TextField name="${field.name}" />`,
  [EnumDataType.Id]: null,
  [EnumDataType.CreatedAt]: null,
  [EnumDataType.UpdatedAt]: null,
  /** @todo use select */
  [EnumDataType.Roles]: (field) =>
    jsxElement`<TextField name="${field.name}" />`,
  [EnumDataType.Username]: (field) =>
    jsxElement`<TextField name="${field.name}" textarea />`,
  [EnumDataType.Password]: (field) =>
    jsxElement`<TextField type="password" name="${field.name}" textarea />`,
};

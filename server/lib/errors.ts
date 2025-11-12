export class MissingRelationError extends Error {
  constructor(relationName: string, entityName: string, action: string) {
    super(`Cannot perform '${action}' on '${entityName}': the '${relationName}' relation was not loaded.`);
    this.name = "MissingRelationError";
  }
}

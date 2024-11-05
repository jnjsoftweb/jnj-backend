import { loadJson } from 'jnj-lib-base';
import { DB_SCHEMA_DIR } from '../env.js';

const getAllSchemas = (dbName) => {
  const schemaPath = `${DB_SCHEMA_DIR}/${dbName}.json`;
  return loadJson(schemaPath);
};

const getSchema = (tableName, dbName) => {
  const schemas = getAllSchemas(dbName);
  // console.log(schemas);
  return schemas.find((schema) => schema.title === tableName);
};

export { getAllSchemas, getSchema };

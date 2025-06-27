import { DbConnection } from "../bindings";
import { connect } from "./core/connect";
import { getActualMainServer } from "./core/getActualMainServer";

const { name: globalModuleName } = await getActualMainServer();

const connctionsMap = new Map<string, DbConnection>();

export async function getConnection(moduleName = globalModuleName) {
  if (connctionsMap.has(moduleName)) {
    return connctionsMap.get(moduleName)!;
  }

  const newConnection = await connect(moduleName);
  connctionsMap.set(moduleName, newConnection);
  return newConnection;
}

import { COVERS } from "../../src/data/covers";
console.log(JSON.stringify(COVERS.map((c) => ({ id: c.id, name: c.name, collection: c.collection }))));

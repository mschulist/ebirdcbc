import { MongoClient } from "mongodb";

export async function mongoConnect() {
  const uri = process.env.MONGODB_URI;
  console.log("uri", uri);

  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db("ebirdcbc");
  return { db: database, client };
}

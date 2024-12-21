import { mongoConnect } from "./mongoConnect";

export default async function getDbPoints() {
    const { db, client } = await mongoConnect();
    const collection = db.collection("points");
    const points = await collection.find({}).toArray();
    client.close();
    return points;
}
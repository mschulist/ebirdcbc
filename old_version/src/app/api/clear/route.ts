import { mongoConnect } from "@/Utils/mongoConnect";

export async function POST() {
    const collectionName = "tennessee-valley"; // TODO: get from request

    const { db, client } = await mongoConnect();
    const collection = db.collection(collectionName);
    await collection.deleteMany({});
    client.close();
    return Response.json({ message: "Collection cleared" })
}
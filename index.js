const express = require("express");
const app = express();

require("dotenv/config");

const { MongoClient } = require("mongodb");

const uri = process.env.DB_CONNECTION;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connect and get collection from db
client.connect().then(() => console.log("Connected to DB 🔥"));
const database = client.db("moodme");
const restaurants = database.collection("restaurants");

app.get("/", async (req, res) => {
  const result = await search(req.query);

  if (result) {
    res.status(200).json({
      message: "Search successfully completed",
      length: result.length,
      data: result,
    });
  } else {
    res.status(404).json({ message: "Result not found" });
  }
});

async function search(queryParams) {
  try {
    // Set query queryParams

    const page = queryParams.page ? queryParams.page : 0;
    const limit = queryParams.limit ? queryParams.limit : 10;

    const name = queryParams.name;
    const cuisine = queryParams.cuisine;
    const street = queryParams.street;

    let query = {};
    if (name) query.name = name;
    if (cuisine) query.cuisine = cuisine;
    if (street) query = { ...query, "address.street": { $eq: street } };

    console.log(query);

    var res = await restaurants
      .find(query)
      .skip(limit * page)
      .limit(limit)
      .toArray();

    console.log(res);

    return res;
  } catch (err) {
    console.log(err);
  }
}

const PORT = process.env.PORT || 4321;

app.listen(PORT, function () {
  console.log(`Server is listening on port ${PORT} ⚡`);
});

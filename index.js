const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv/config");

app.use(cors());

const { MongoClient } = require("mongodb");

const uri = process.env.DB_CONNECTION;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connect and get collection from db
client.connect().then(() => {
  console.log("Connected to DB 🔥");

  // Prepare grades for search
  // This is a one time operation, but I will leave here for illustrative purposes

  restaurants.updateMany({}, [
    {
      $set: { average: { $avg: "$grades.score" } },
    },
  ]);
});

const database = client.db("moodme");
const restaurants = database.collection("restaurants");

const MIN_AVERGAE_GRADE = 0;
const MAX_AVERAGE_SCORE = 100;

app.get("/search", async (req, res) => {
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

app.get("/cuisines", async (req, res) => {
  const cuisines = [];
  await restaurants
    .aggregate([
      { $group: { _id: { cuisine: "$cuisine" }, cuisineTotal: { $sum: 1 } } },
    ])
    .toArray()
    .then((res) => {
      res.forEach((c) => cuisines.push(c._id.cuisine));
    })
    .catch((err) => {
      console.log("Error: Update unsuccessfull.");
    });

  res.json(cuisines);
});

async function search(queryParams) {
  try {
    // Set query queryParams
    const page = queryParams.page ? parseInt(queryParams.page) : 0;
    const limit = queryParams.limit ? parseInt(queryParams.limit) : 10;

    const name = queryParams.name;
    const cuisine = queryParams.cuisine;
    const street = queryParams.street;
    const minAverageGrade = parseInt(queryParams.minAverageGrade);
    const maxAverageGrade = parseInt(queryParams.maxAverageGrade);

    let query = {};
    if (name) {
      re = new RegExp("^" + name);
      query.name = { $regex: re, $options: "i" };
    }
    if (cuisine) {
      re = new RegExp("^" + cuisine);
      query.cuisine = { $regex: re, $options: "i" };
    }
    if (street) {
      re = new RegExp("^" + street);
      query = { ...query, "address.street": { $regex: re, $options: "i" } };
    }
    if (minAverageGrade || maxAverageGrade) {
      query.average = {
        $gte: minAverageGrade ? minAverageGrade : MIN_AVERGAE_GRADE,
        $lte: maxAverageGrade ? maxAverageGrade : MAX_AVERAGE_SCORE,
      };
    }

    var res = await restaurants
      .find(query)
      .skip(limit * page)
      .limit(limit)
      .toArray();

    return res;
  } catch (err) {
    console.log(err);
  }
}

const PORT = process.env.PORT || 4321;

app.listen(PORT, function () {
  console.log(`Server is listening on port ${PORT} ⚡`);
});

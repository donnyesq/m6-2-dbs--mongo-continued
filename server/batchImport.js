const { MongoClient } = require("mongodb");
const assert = require("assert");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useUnifiedTopology: true,
};

// GENERATE SEATS

const seats = [];

const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {
    let seat;
    seat = {
      _id: `${row[r]}-${s}`,
      price: 225,
      isBooked: false,
    };
    seats.push(seat);
  }
}
/////

const batchImport = async (data) => {
  const client = await MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("ticket-booker");
    console.log("connected!");

    const r = await db.collection("seats").insertMany(seats);
    assert.strictEqual(data.length, r.insertedCount);
  } catch (err) {
    console.log(err.stack);
  }

  client.close();
  console.log("disconnected!");
};

batchImport(seats);

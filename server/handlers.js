const { MongoClient } = require("mongodb");
const assert = require("assert");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
  let seats;
  const client = await MongoClient(MONGO_URI, options);
  await client.connect();
  const db = client.db("ticket-booker");
  console.log("connected!");

  await db
    .collection("seats")
    .find()
    .toArray((err, result) => {
      if (result.length > 0) {
        const resultObj = {};
        result.forEach((item) => (resultObj[item._id] = item));
        seats = resultObj;
        res.status(200).json({
          status: 200,
          seats: resultObj,
          numOfRows: 8,
          seatsPerRow: 12,
        });
      } else {
        res.status(404).json({ status: 404, data: "Not Found" });
      }

      client.close();
    });

  console.log("disconnected!");
};

const bookSeat = async (req, res) => {
  const { seatId, creditCard, expiration, fullName, email } = req.body;
  let lastBookingAttemptSucceeded = false;

  const client = await MongoClient(MONGO_URI, options);

  await client.connect();
  const db = client.db("ticket-booker");

  try {
    const query = { _id: seatId };
    const newValues = { $set: { isBooked: "true", fullName, email } };
    const r = await db.collection("seats").updateOne(query, newValues);
    assert.strictEqual(1, r.matchedCount);
    assert.strictEqual(1, r.modifiedCount);
    lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

    return res.status(200).json({
      status: 200,
      success: true,
    });
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({ status: 500, data: req.body, message: err.message });
  }

  client.close();

  if (!creditCard || !expiration) {
    return res.status(400).json({
      status: 400,
      message: "Please provide credit card information!",
    });
  }

  if (lastBookingAttemptSucceeded) {
    lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

    return res.status(500).json({
      message: "An unknown error has occurred. Please try your request again.",
    });
  }
};

module.exports = { getSeats, bookSeat };

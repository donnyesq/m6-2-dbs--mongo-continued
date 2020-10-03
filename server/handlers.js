const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);
  await client.connect();
  const db = client.db("ticket-booker");
  console.log("connected!");

  const seats = await db
    .collection("seats")
    .find()
    .toArray((err, result) => {
      if (result.length > 0) {
        const start = Number(req.query.start) || 0;
        let limit = start + Number(req.query.limit) || 30;
        if (limit >= result.length) {
          limit = result.length;
        }

        const data = result.slice(start, limit);

        res.status(200).json({ status: 200, start, limit, seats: data });
      } else {
        res.status(404).json({ status: 404, data: "Not Found" });
      }
      client.close();
    });

  console.log("disconnected!");
};

const bookSeat = async (req, res) => {
  const { seatId, creditCard, expiration } = req.body;
  let lastBookingAttemptSucceeded = false;

  const seat = seats[seatId];

  const isAlreadyBooked = !!seat.isBooked;
  if (isAlreadyBooked) {
    return res.status(400).json({
      message: "This seat has already been booked!",
    });
  }

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

  lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

  return res.status(200).json({
    status: 200,
    success: true,
  });
};

module.exports = { getSeats, bookSeat };

const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(console.log("/****** Database connected ******/"))
  .catch((err) => console.error(err));

const shortenerSchema = new mongoose.Schema({ original_url: String, short_url: Number });

const Shortener = mongoose.model("Shortener", shortenerSchema);

module.exports = { Shortener };

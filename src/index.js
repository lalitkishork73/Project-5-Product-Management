//<<=================== Application =====================>>//

const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const route = require("./routes/route.js");
const multer = require("multer");
const app = express();
const testPort = 3003;

app.use(bodyParser.json());
app.use(multer().any());

mongoose
  .connect(
    "mongodb+srv://lalitkishork73:UzPr9bb6Wvxda9eC@cluster0.o2wavxe.mongodb.net/group27Database?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb is connected!"))
  .catch((err) => console.log(err));

app.use("/", route);
app.use("*", (req, res) => {
  return res.status(400).send({ status: false, message: "Bad Url request!" });
});

app.listen(process.env.PORT || testPort, () => {
  console.log(`Express app running on port ` + (process.env.PORT || testPort));
});

const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/shop";
/*   "mongodb+srv://taskapp:taskapproot@cluster0.ub1nd.mongodb.net/shop?retryWrites=true&w=majority";
 */ mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });


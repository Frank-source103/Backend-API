require("dotenv").config(); // load .env FIRST, before anything reads it

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`SRM API running on http://localhost:${PORT}`);
});
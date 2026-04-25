const app = require("./src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Theatre Reservation API is running on port ${PORT}`);
});
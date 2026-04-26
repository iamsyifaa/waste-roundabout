import express from "express";
const app = express();

app.get("/", (req, res) => {
  const name = process.env.NAME || "Syifa";
  res.send(`Hello ${name}!`);
});

const port = parseInt(process.env.PORT || "3000");
app.listen(port, () => {
  console.log("Halo dari server!");
});

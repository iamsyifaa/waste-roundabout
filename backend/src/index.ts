import express from "express";
const app = express();

app.get("/", (req, res) => {
  const name = process.env.NAME || "World";
  res.send(`Hello ${name}!`);
});

const port = parseInt(process.env.PORT || "3000");

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log("Halo dari server!");
  });
}

export default app;

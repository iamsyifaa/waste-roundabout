import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const port = parseInt(process.env.PORT || "3000");

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log("Halo dari server!");
    console.log(`Server nyala di http://localhost:${port}`);
  });
}

export default app;
import { ERR } from "../lib/httpExceptions.js";
import cors from "cors";

const whitelist = ["http://localhost:3000"];

 const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new ERR.Forbidden());
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};


export const useCors = cors(corsOptions)
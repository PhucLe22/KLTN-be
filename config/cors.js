import { ForbiddenException } from "../lib/httpExceptions";

const whitelist = ["http://localhost:3000", ,];
export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new ForbiddenException());
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

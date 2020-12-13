import * as express from "express";
import * as axios from "axios";

export const validateUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const auth = req.headers.authorization?.split(" ");
  let token: string;
  if (!auth || auth.length < 2 || !auth[1]) {
    res.status(401).send({
      error: new Error("User is not authenticated"),
    });
    return;
  } else {
    token = auth[1];
  }

  const { APP_ID, SERVER_URL } = process.env;

  const config: axios.AxiosRequestConfig = {
    headers: {
      "X-Parse-Application-Id": APP_ID,
      "Content-Type": "application/json",
      "X-Parse-Session-Token": token,
    },
  };

  let url = SERVER_URL || "http://localhost:1337/api/";
  url = url.endsWith("/") ? url.slice(0, -1) : url;

  try {
    await axios.default.get(`${url}/users/me`, config);
    next();
  } catch (err) {
    console.log(err);
    res.status(403).send({
      error: new Error(err.message),
    });
    return;
  }
};

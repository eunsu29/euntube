import routes from "./routes";

export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "Euntube";
  res.locals.routes = routes;
  next();
};

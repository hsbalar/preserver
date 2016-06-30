import express from "express";
import path from "path";

import routes from "../routes";

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'jade');

// serve static content from 'public' dir
app.use(express.static(path.resolve('public')));
app.use(express.static(path.resolve('dist')));

// register routes
routes(app);

export default app;

import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import favicon from "serve-favicon";

import fs from "fs";
import path from "path";

import routes from "../routes";

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'jade');

// pretty output
if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

// serve static content from 'public' dir
app.use(favicon(path.resolve('public/favicon.ico')));
app.use(express.static(path.resolve('public')));
app.use(express.static(path.resolve('dist')));

// register body parsers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// allow method override
app.use(methodOverride());

// register routes
routes(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

export default app;


function index(req, res, next) {
  res.render('index', { title: 'Home!' });
}

export default function (app) {

  // index page
  app.get('*', index);
};

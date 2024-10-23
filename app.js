var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')
const connectDB = require('./Config/db')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var studentsRouter = require('./routes/studentsRoutes');
var courseRouter = require('./routes/courseRoute')
var adminRouter = require('./routes/admin')
var transactionRouter = require('./routes/transaction')
var attendanceRouter = require('./routes/attendance')
var expenceRouter = require('./routes/expence')
var notesRouter = require('./routes/notes')
var logsRouter = require('./routes/logsRoute')
var examRouter = require('./routes/examRoutes')


var app = express();
connectDB()
// app.use(cors({
//   origin:'https://lms.tecnavis.com/,http://localhost:3000'
// }))
app.use(cors({
  origin: ["http://localhost:5174","http://localhost:5173","http://localhost:5175",'https://lms.tecnavis.com'],
  method:["PUT","DELETE","PUSH","GET","POST","PATCH"],
  credential:true
}))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/students', studentsRouter);
app.use('/course',courseRouter)
app.use('/admin',adminRouter)
app.use('/transaction',transactionRouter)
app.use('/attendance',attendanceRouter)
app.use('/expence',expenceRouter)
app.use('/exam',examRouter)


app.use('/notes',notesRouter)

app.use('/log',logsRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

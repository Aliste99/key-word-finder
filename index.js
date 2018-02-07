var requestUrl = 'https://flowxo.com/hooks/a/b5vvpb5e';
var mySQL_business;
var mySQL_persons;
var constants = require("./constants.js");

var admin = require("firebase-admin");
const request = require('request');

var serviceAccount = require("./key-word-finder-firebase-adminsdk-7vd39-4ba6d8a558.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://key-word-finder.firebaseio.com/"
});


var db = admin.database();
var refKeyWord = db.ref("key-word");

refKeyWord.orderByChild("status").equalTo("new").on("child_added", function(snapshot, prevChildKey) {
  var post = snapshot.val();
  var sqlResult;
  var sqlQuery = setSQLquery(post.message);
  console.log("vars completed");
  
  setConnection();
  
  mySQL_persons.connect(function(err) {
    if(err) throw console.log(err);
    console.log("mySQL_persons connected!");
    if(sqlQuery){
      mySQL_persons.query(sqlQuery, function(err, result) {
        if(err) throw err;
        console.log(result);
          sqlResult = result;
          sendSqlResultToFlowXO(snapshot, sqlResult);
      });
    }
  });  
});

function setSQLquery(keyWord){
    var sqlQuery;
    sqlQuery = "SELECT * FROM Budget2017 LEFT JOIN persons ON Budget2017.person_Id = persons.id WHERE Budget2017.id LIKE '%" + keyWord + "%'  OR person_Id LIKE '%" + keyWord + "%' OR num LIKE '%" + keyWord + "%' OR period LIKE '%" + keyWord + "%'  OR payer LIKE '%" + keyWord + "%' OR details LIKE '%" + keyWord + "%' OR sumStr LIKE '%" + keyWord + "%'  OR sum LIKE '%" + keyWord + "%'";
    return sqlQuery;
}

function setConnection(argument) {
  var mysql = require('mysql');
  mySQL_persons = mysql.createConnection({
      host: constants.MYSQL_HOST_PERSONS,
      user: constants.MYSQL_USER_PERSONS,
      password: constants.MYSQL_PASSWORD_PERSONS,
      database: "spider"
  });  
}

function sendSqlResultToFlowXO(snapshot, sqlResult){
  var post = snapshot.val();
  var respPath = post.responsePath;
  request({
    method: 'post',
    url: requestUrl,
    form: {
      "result": sqlResult,
      "path": respPath,
    },
    json: true,
  }, (err, res, body) => {
    if (err) { return console.log(err); }
    console.log(body.url);
    console.log(body.explanation);
  });
  console.log("Message sended");
}
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
          var messageResult = sqlResultToFlowXOmessage(sqlResult);
          //sendSqlResultToFlowXO(snapshot, messageResult);
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

function sqlResultToFlowXOmessage(sqlResult){
  var message;
  var b = 5;
  var count = Object.keys(sqlResult).length;
  var keys = Object.keys(sqlResult);
  if (count < 5){
    b = count;
  }
  for (var i = 0; i < b; i++ ){
    console.log("vnfmkcl" + sqlResult[keys[i].id]);
  }
  return message;
}

function sendSqlResultToFlowXO(snapshot, result){
  var post = snapshot.val();
  var respPath = post.responsePath;
  request({
    method: 'post',
    url: requestUrl,
    form: {
      "result": result,
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
var requestUrl = 'https://flowxo.com/hooks/a/b5vvpb5e';
var mySQL_business;
var mySQL_persons;
var constants = require("./constants.js");

var admin = require("firebase-admin");
const request = require('request');

var serviceAccount = require("./key-word-finder-firebase-adminsdk-7vd39-4ba6d8a558.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://task-3d21a.firebaseio.com/"
});


var db = admin.database();
var refKeyWord = db.ref("keywordfinder");

refKeyWord.orderByChild("status").equalTo("new").on("child_added", function(snapshot, prevChildKey) {
    var post = snapshot.val();
    var sqlResult;
  console.log("vars completed");
  
  setConnection();
  
  mySQL_persons.connect(function(err) {
    if(err) throw console.log(err);
    console.log("mySQL_persons connected!");
    if(post.message){
      mySQL_persons.query(post.message, function(err, result) {
        if(err) throw err;
        console.log(result);
          sqlResult = result;
          updateFirebaseData(snapshot, sqlResult);
          sendSqlResultToFlowXO(snapshot, sqlResult);
      });
    }
  });  
});

function setConnection(argument) {
  var mysql = require('mysql');
  mySQL_persons = mysql.createConnection({
      host: constants.MYSQL_HOST_PERSONS,
      user: constants.MYSQL_USER_PERSONS,
      password: constants.MYSQL_PASSWORD_PERSONS,
      database: "spider"
  });  
}
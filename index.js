var requestUrl = 'https://flowxo.com/hooks/a/b5vvpb5e';
var mySQL_business;
var mySQL_persons;

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
    
});
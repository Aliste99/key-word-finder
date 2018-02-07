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
    for(var i = 0; i < sqlQuery.length; i++){
      if(sqlQuery[i]){
        mySQL_persons.query(sqlQuery[i], function(err, result) {
          if(err) throw err;
          console.log(result);
          sqlResult = result;
          var messageResult = sqlResultToFlowXOmessage(sqlResult);
          //sendSqlResultToFlowXO(snapshot, messageResult);
        });
      }
    }
  });  
});

function setSQLquery(keyWord){
    var sqlQuery =[];
    sqlQuery.push("SELECT * FROM Budget2017 LEFT JOIN persons ON Budget2017.person_Id = persons.id WHERE Budget2017.id LIKE '%" + keyWord + "%'  OR person_Id LIKE '%" + keyWord + "%' OR num LIKE '%" + keyWord + "%' OR period LIKE '%" + keyWord + "%'  OR payer LIKE '%" + keyWord + "%' OR details LIKE '%" + keyWord + "%' OR sumStr LIKE '%" + keyWord + "%'  OR sum LIKE '%" + keyWord + "%'");
    sqlQuery.push("SELECT * FROM budgets LEFT JOIN persons ON budgets.person_id = persons.id WHERE budgets.id LIKE '%" + keyWord + "%' OR person_id LIKE '%" + keyWord + "%' OR num LIKE '%" + keyWord + "%' OR period LIKE '%" + keyWord + "%' OR payer LIKE '%" + keyWord + "%' OR details LIKE '%" + keyWord + "%' OR sumStr LIKE '%" + keyWord + "%' OR sum LIKE '%" + keyWord + "%'");
    sqlQuery.push("SELECT * FROM declaration WHERE id LIKE '%" + keyWord + "%' OR last_name LIKE '%" + keyWord + "%' OR first_name LIKE '%" + keyWord + "%' OR middle_name LIKE '%" + keyWord + "%' OR workplace LIKE '%" + keyWord + "%' OR positn LIKE '%" + keyWord + "%' OR income_sum LIKE '%" + keyWord + "%' OR income LIKE '%" + keyWord + "%' OR expend_sum LIKE '%" + keyWord + "%' OR expend LIKE '%" + keyWord + "%' OR immov_est LIKE '%" + keyWord + "%' OR immov_dov LIKE '%" + keyWord + "%' OR mov_est LIKE '%" + keyWord + "%' OR mov_dov LIKE '%" + keyWord + "%' OR rel_income_sum LIKE '%" + keyWord + "%' OR rel_income LIKE '%" + keyWord + "%' OR rel_expend_sum LIKE '%" + keyWord + "%' OR rel_expend LIKE '%" + keyWord + "%' OR rel_immov_est LIKE '%" + keyWord + "%' OR rel_immov_dov LIKE '%" + keyWord + "%' OR rel_mov_est LIKE '%" + keyWord + "%' OR rel_mov_dov LIKE '%" + keyWord + "%'");
    sqlQuery.push("SELECT * FROM EniAll WHERE id LIKE '%" + keyWord + "%' OR eni LIKE '%" + keyWord + "%' OR owner LIKE '%" + keyWord + "%'");
    sqlQuery.push("SELECT * FROM gb_land_registry_proprietor WHERE Column_1 LIKE '%" + keyWord + "%' OR Column_2 LIKE '%" + keyWord + "%' OR Column_3 LIKE '%" + keyWord + "%' OR Column_4 LIKE '%" + keyWord + "%' OR Column_5 LIKE '%" + keyWord + "%' OR Column_6 LIKE '%" + keyWord + "%' OR Column_7 LIKE '%" + keyWord + "%' OR Column_8 LIKE '%" + keyWord + "%' OR Column_9 LIKE '%" + keyWord + "%' OR Column_10 LIKE '%" + keyWord + "%' OR Column_11 LIKE '%" + keyWord + "%'");
    sqlQuery.push("SELECT * FROM links WHERE (CONVERT(`id` USING utf8) LIKE '%" + keyWord + "%' OR CONVERT(`name` USING utf8) LIKE '%" + keyWord + "%')")
    sqlQuery.push("SELECT * FROM Lot WHERE id LIKE '%" + keyWord + "%' OR tenderNum LIKE '%" + keyWord + "%' OR lotNum LIKE '%" + keyWord + "%' OR lotName LIKE '%" + keyWord + "%' OR lotSum LIKE '%" + keyWord + "%' OR planSum LIKE '%" + keyWord + "%' OR cancelReason LIKE '%" + keyWord + "%'");
    sqlQuery.push("SELECT * FROM LotParticipation WHERE id LIKE '%" + keyWord + "%' OR Lot_id LIKE '%" + keyWord + "%' OR name LIKE '%" + keyWord + "%' OR place LIKE '%" + keyWord + "%' OR status LIKE '%" + keyWord + "%'"); 
    sqlQuery.push("SELECT * FROM persons WHERE id LIKE '%" + keyWord + "%' OR rayonCode LIKE '%" + keyWord + "%' OR rayonName LIKE '%" + keyWord + "%' OR inn LIKE '%" + keyWord + "%' OR fullName LIKE '%" + keyWord + "%' OR fullAddress LIKE '%" + keyWord + "%' OR directorName LIKE '%" + keyWord + "%' OR activityStartDate LIKE '%" + keyWord + "%' OR liquidationDate LIKE '%" + keyWord + "%' OR vatActiveDate LIKE '%" + keyWord + "%' OR vatExemptDate LIKE '%" + keyWord + "%'");
    sqlQuery.push("SELECT * FROM tenders WHERE id LIKE '%" + keyWord + "%' OR tender_num LIKE '%" + keyWord + "%' OR org_name LIKE '%" + keyWord + "%' OR org_address LIKE '%" + keyWord + "%' OR org_phone LIKE '%" + keyWord + "%' OR purchase LIKE '%" + keyWord + "%' OR procuring_entity LIKE '%" + keyWord + "%' OR format LIKE '%" + keyWord + "%' OR method LIKE '%" + keyWord + "%' OR plan_sum LIKE '%" + keyWord + "%' OR published LIKE '%" + keyWord + "%' OR currency LIKE '%" + keyWord + "%' OR deadline LIKE '%" + keyWord + "%' OR valid_period LIKE '%" + keyWord + "%'");
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
    console.log("vnfmkcl " + sqlResult[keys[i]]);
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
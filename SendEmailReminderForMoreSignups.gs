var SUNDAYTIMING = "9-11 am";
var SATURDAYTIMING = "8-10 am";
var WEEKDAYTIMING = "6-8 pm";
var REPLYTO="$EMAILTOREPLYFROMAUTOMATEDREMINDER$";

function sendPlayerEmails1() {
  var sheet = SpreadsheetApp.openById("$SPREADSHEETID$");
  var target_sheet = sheet.getSheetByName("TimeBooking");
  var endRange = target_sheet.getLastRow();
  var range = target_sheet.getRange("A2:C"+(endRange));
  // Fetch values for each row in the Range.
  var data = range.getValues();
  
  //GetDate + 1
  var timeStamp = new Date((new Date()).getTime()+24*60*60*1000);
  //build a user array
  var users = new Array();
  var emailAddress = "";
  var userList = "";
  var userCounter = 1;
  for(var ii=0; ii < data.length; ii++) {
    // check for values of id and similar
    if ((getDate(data[ii][2]) == getDate(timeStamp))) {
      var userRecord = new UserRecord();
      userRecord.timestamp = data[ii][0];
      userRecord.userID = data[ii][1];
      emailAddress += data[ii][1] + ",";
      userList +=  userCounter + ". \t" + data[ii][1] + "\n"; 
      userRecord.dateBooked = data[ii][2];
      var size = users.length;
      users[size] = userRecord;
      userCounter++;
      }
    }
  var len = users.length;
  SpreadsheetApp.flush();
  if((users.length < 4) ||  (users.length == 5) || (users.length < 7)){
    var message ="";
    var subject = "Meeting Reminder on " + getDayAndDate(timeStamp);
    var dayTimeStr = "";
    if (getDay(timeStamp) === "Sun")
    {
      dayTimeStr = SUNDAYTIMING;
            
    }
    else if (getDay(timeStamp) === "Sat")
    {
      dayTimeStr = SATURDAYTIMING;
    }
    else
    {
      dayTimeStr = WEEKDAYTIMING;
    }
    if(users.length == 0)
      {
        message += "0 people signed up for "+ getDayAndDate(timeStamp) + " and timing is " + dayTimeStr +". More people can be accommodated. \n";
        message += "Please signup here: https://sites.google.com/site/$SCHEDULERSITE$/    \n\n";
      }
    else
      {
        message = "Only " + users.length + " person/folks signed up for "+ getDayAndDate(timeStamp) + " and timing is " + dayTimeStr + ". More players can be accommodated. \n";
        message += "Please signup here: https://sites.google.com/site/$SCHEDULERSITE$/ \n\n";
        message += " FOLKS SO FAR... \n";
        message += userList; // Second column
      }
    var emails = createEmailList();
    MailApp.sendEmail(emails, REPLYTO, subject, message);
  }
}

function UserRecord() {
  this.timestamp = "";
  this.userID = "";
  this.dateBooked = "";
}

// Date is returned in mm-dd-yyyy
function getDate(timeStamp) {
  var year = Utilities.formatDate(timeStamp,Session.getTimeZone() ,"yyyy");
  var month = Utilities.formatDate(timeStamp,Session.getTimeZone(), "MM");
  var day = Utilities.formatDate(timeStamp,Session.getTimeZone(), "dd");
  var date = month+"-"+day+"-"+year;
  return date;
}

function getDayAndDate(timeStamp){
 var date = getDate(timeStamp);
 var day = Utilities.formatDate(timeStamp,Session.getTimeZone(),"EEE");
  return (day+" ("+date+")");
}

function getDay(timeStamp){
 var day = Utilities.formatDate(timeStamp,Session.getTimeZone(),"EEE");
  return (day);
}

function createEmailList(){
//Spreadsheet containing groups email address
  var sheet = SpreadsheetApp.openById("$SPREADSHEETKEY$");
  var target_sheet = sheet.getSheetByName("Users");
  var endRange = target_sheet.getLastRow();
  var range = target_sheet.getRange("A2:A"+(endRange));
  // Fetch values for each row in the Range.
  var data = range.getValues();
  var emailAddress = "";
  for (var i = 0; i < data.length; ++i) {
    emailAddress += data[i][0] + ",";  
    SpreadsheetApp.flush();
  }
  return emailAddress;
}

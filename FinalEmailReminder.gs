var SUNDAYTIMING = "9-11 am";
var SATURDAYTIMING = "8-10 am";
var WEEKDAYTIMING = "6-8 pm";
var EMAILCC="$EMAILCC$";
var ADVANCEDARGS = {cc:EMAILCC};

function sendPlayerEmails2() {
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
  var message = users.length + " Players signed up for "+ getDayAndDate(timeStamp) + " and timing is " + dayTimeStr +".\n\n";
  message += " PLAYERS \n";
  message += userList;
  var subject = "Meeting reminder on " + getDayAndDate(timeStamp);
  if(emailAddress != ""){
    MailApp.sendEmail(emailAddress, subject, message, ADVANCEDARGS);
  }
  Logger.log("Email addresses: " + emailAddress);
  // Make sure the cell is updated right away in case the script is interrupted
  SpreadsheetApp.flush();
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

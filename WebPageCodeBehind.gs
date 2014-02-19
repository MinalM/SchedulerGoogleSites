/*
* Copyright (c) 2014-2015, Minal Mishra
* All rights reserved.
*/

// global constants
var LABEL_WIDTH="400";
var TEXTBOX_WIDTH="400";
// Spreadsheet where all the time booking data is stored
var SPREADSHEET_ID = "$GOOGLESPREADSHEETID$";
var SHEETNAME = "$SHEETNAMEFROMSPREADSHEET$";
var MAXPLAYERCOUNT = 10;


/*
* @return UiInstance Application created using UI Services
*                    which includes all the widgets and callback handler hooks
*
*/
function doGet(e) {
 var app = UiApp.createApplication().setTitle("Weekly Scheduler");
 //create form widgets
 createForm_(app)
 return app;
}


/*
* @param UiInstance Private method which creates all the widgets in the App
*/
function createForm_(container) {
  // create a Vertical Panel
  var vPanel = container.createVerticalPanel();
  vPanel.setWidth("810");
  vPanel.setStyleAttribute("padding","20px");
  vPanel.setStyleAttribute("fontSize", "12pt");
  vPanel.setId("panel");

  //USERNAME - label and txtbox
  var usernameLabel = container.createLabel().setText("1. Username");
  usernameLabel.setId('usernameLabel').setTag("1. Username");
  var usernameSubMessageLabel = container.createLabel().setText("(enter email)");
  usernameLabel.setWidth(LABEL_WIDTH);
  decorateLabel_(usernameLabel);
  decorateLabel1_(usernameSubMessageLabel);
  var usernameTextBox = container.createTextBox();
  usernameTextBox.setWidth(TEXTBOX_WIDTH);
  usernameTextBox.setMaxLength(80);
  usernameTextBox.setName("usernameTextBox");
  usernameTextBox.setId("usernameTextBox");

  //DATEPICKER
  var datePickedLabel = container.createLabel().setText("2. Select DATE");
  datePickedLabel.setWidth(LABEL_WIDTH);
  decorateLabel_(datePickedLabel);
  //var pickerHandler = container.createServerHandler('getUsersHandler');
  var datePicker = container.createDatePicker().setId("picker");
  //datePicker.addValueChangeHandler(pickerHandler);
  datePicker.setSize(50,20); datePicker.setWidth(50);
  
  //REFRESH PLAYERSLIST button
  var getUsersButton = container.createButton();
  getUsersButton.setText("Refresh User List");
  //decorateLabel_(getUsersButton);
  var getUsersSubMessageLabel = container.createLabel().setText("(Users available on selected date)");
  decorateLabel1_(getUsersSubMessageLabel);
  
  //CHECKBOX & SELECTION LABEL
  var selectionLabel = container.createLabel().setText("3. Do You Want To Come?");
  selectionLabel.setWidth(LABEL_WIDTH);
  decorateLabel_(selectionLabel);
  var check = container.createRadioButton('group1', 'Yes').setName('check').setId('check');
  var check2 = container.createRadioButton('group1', 'No').setName('check2').setId('check2');
  
  var radioHandler = container.createServerValueChangeHandler('updateRadioButton');
  radioHandler.addCallbackElement(vPanel);
  //Add this handler to the radio Buttons
  check.addValueChangeHandler(radioHandler);
  check2.addValueChangeHandler(radioHandler);
  
  //SUBMIT
  var submitButton = container.createButton();
  submitButton.setText("Submit Selection");
  decorateLabel_(submitButton);
  // submit handlers
  var submitServerHandler = container.createServerClickHandler('submitHandler_');
  submitServerHandler.addCallbackElement(vPanel);
  submitButton.addClickHandler(submitServerHandler);
  
 
  //PLAYERS LIST: table and label
  var playerListLabel = container.createLabel().setText("Users List").setId('playerlist');
  playerListLabel.setWidth(LABEL_WIDTH);
  decorateLabel_(playerListLabel);  
  var table = container.createFlexTable().setId('table').setTag('0'); //Here tag will count the number of members
  
  //HEADER: for the table
  var headerArray = ['Username', 'Timestamp (to select order)'];
  for(var i=0; i<headerArray.length; i++){
    table.setWidget(0, i, container.createLabel(headerArray[i]));
  }

  //ADD ROWS TO TABLE
  addUserRecordRow(container,MAXPLAYERCOUNT);
  
  // get current date's selection
  var timeStamp = new Date();
  datePicker.setValue(timeStamp);  
  var dateRecords = new DateRecords();
  dateRecords.getDateRecords(timeStamp);

  
  // Get Users for the date handler
  var getUsersServerHandler = container.createServerHandler('getUsersHandler');
  getUsersServerHandler.addCallbackElement(table)
  .addCallbackElement(vPanel);
  getUsersButton.addClickHandler(getUsersServerHandler);
  
  // add all the widgets to the application
  vPanel.add(usernameLabel);
  vPanel.add(usernameSubMessageLabel);
  vPanel.add(usernameTextBox);
  vPanel.add(datePickedLabel);
  vPanel.add(datePicker);
  vPanel.add(getUsersButton);
  vPanel.add(selectionLabel);
  vPanel.add(check);
  vPanel.add(check2);
  vPanel.add(submitButton);
  vPanel.add(playerListLabel);
  vPanel.add(table);
  container.add(vPanel);
}


function getUsersHandler(e){
  var app = UiApp.getActiveApplication();
  var datePicked = e.parameter.picker;
  var row = parseInt(e.parameter.table_tag);    
  
  // get current date's selection
  var dateRecords = new DateRecords();
  dateRecords.getDateRecords(datePicked);
  var day = getDayAndDate(datePicked);
  decorateLabel_(app.getElementById('playerlist').setText("Users List for " + day));
  for(var i=1; i <= dateRecords.userRecords.length; i++){
    var ts= new Date(dateRecords.userRecords[i-1].timestamp);
    if(e.parameter.usernameTextBox == dateRecords.userRecords[i-1].userID){
      app.getElementById('username'+i).setText(dateRecords.userRecords[i-1].userID).setVisible(true).setStyleAttribute('color','#008000').setStyleAttribute("font-weight","bold");;
      app.getElementById('timestamp'+i).setText(ts).setVisible(true).setStyleAttribute('color','#008000');
    }
    else{
      app.getElementById('username'+i).setText(dateRecords.userRecords[i-1].userID).setVisible(true).setStyleAttribute('color','black').setStyleAttribute("font-weight","normal");;
      app.getElementById('timestamp'+i).setText(ts).setVisible(true).setStyleAttribute('color','black');
    }
   }
 
  for(var k = i ; k <= row; k++){
     app.getElementById('username'+k).setText("").setVisible(false);
     app.getElementById('timestamp'+k).setText("").setVisible(false);
   }
  return app;
}

function addUserRecordRow(app, num){
  var table = app.getElementById('table');
  var tag = parseInt(table.getTag());  
  var numRows = tag+1;

  var flag = true;
  for(var i = 0; i< num; i++){
    if(i == 0){
      flag=true;
    }
    else
    {flag= false;}
    table.setWidget(numRows, 0, app.createTextBox().setId('username'+numRows).setName('username'+numRows).setVisible(flag));
    table.setWidget(numRows, 1, app.createTextBox().setId('timestamp'+numRows).setName('timestamp'+numRows).setVisible(flag));
    table.setTag(numRows.toString());
    numRows++;
  }
  Logger.log("Created rows:"+ numRows);
  return numRows;
}

function updateRadioButton(e){
  var app = UiApp.getActiveApplication();
  Logger.log(e.parameter.source);
  if(e.parameter.source == 'check'){
    app.getElementById('check2').setValue(false);
  }
  else {
    app.getElementById('check').setValue(false);
  }
  return app;
}

/*
* @param Event Callback method which is called when a user clicks on Submit.
*              This method name was provided to the ServerClickHandler class.
*
*/
function submitHandler_(e) {
  var app = UiApp.getActiveApplication();
  var userRecord = new UserRecord();
  userRecord.userID= e.parameter.usernameTextBox;
  
//EMPTY TextBox, prompt to enter email
  if(userRecord.userID == "")
  {
    decorateLabelRed_(app.getElementById('usernameLabel'));
    getUsersHandler(e);
    return app;
  }
  decorateLabel_(app.getElementById('usernameLabel'));
  userRecord.dateBooked=e.parameter.picker;
  if(e.parameter.check == "true"){
    Logger.log(e.parameter.check);
    userRecord.timestamp=new Date();
    userRecord.updateUserRecord("add");
  }
  else if (e.parameter.check2 == "true"){
    userRecord.updateUserRecord("remove");
  }
  getUsersHandler(e);
  return app;
}


/*
* Class that represents an individual's committed date
* Each UserRecord is made up of timestam, userid and datebook
* Each UserRecord is a row in spreadsheet
*/
function UserRecord() {
  this.timestamp = "";
  this.userID = "";
  this.dateBooked = "";
  
  this.updateUserRecord = function(addremove){
    var sheet  = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("TimeBooking");
    var endRange = sheet.getLastRow();
    var range = sheet.getRange("A2:C"+(endRange));
    var recordExists = false;
    var recordRowNum = endRange+1;
    var values = range.getValues();
    for(var ii=0; ii < values.length; ii++) {
     // check for values of id and similar
      if ((values[ii][1] == this.userID) && (getDate(values[ii][2]) == getDate(this.dateBooked))) {
        // we have a TimeRecord, update it
        recordExists = true;
        recordRowNum = ii+2;
        break;
      }
    }
  // get values
    var values1 = new Array(1);{
    values1[0] = new Array(3);
    values1[0][0] = this.timestamp;
    values1[0][1] = this.userID;
    values1[0][2] = getDate(this.dateBooked);
    }
    Logger.log(recordExists);
    Logger.log(addremove);
  // save the values
    var newrange = sheet.getRange("A"+recordRowNum+":C"+recordRowNum);
    if(addremove =="add"){
      var newrange = sheet.getRange("A"+recordRowNum+":C"+recordRowNum);
      newrange.setValues(values1);
    }

    else if((addremove=="remove") && recordExists){
     sheet.deleteRow(recordRowNum); 
    }
      
}
  
}

/*
* Class that represents a group of users record for a date.
* getDateRecords gets user for a dateBooked.
*/
function DateRecords() {
  this.userRecords = new Array();

  //this gets the date records of user for a particular date
  this.getDateRecords = function(dateBooked) {
    var sheet  = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETNAME);
    var lastRow = sheet.getLastRow();
    var range = sheet.getRange("A2:C"+lastRow);
    // iterate over the entire range to find TimeSheets
    var values = range.getValues();
    
    for(var ii=0; ii < values.length; ii++) {
     // check for values of id and similar
      var date = new Date(values[ii][2]);
      if ((date.getFullYear() == dateBooked.getFullYear()) && (date.getMonth() == dateBooked.getMonth()) && (date.getDate() == dateBooked.getDate())) {
        var userRecord = new UserRecord();
        userRecord.timestamp = values[ii][0];
        userRecord.userID = values[ii][1];
        userRecord.dateBooked = values[ii][2];
        
        var size = this.userRecords.length;
        this.userRecords[size] = userRecord;
      }
    }
  }
}

// Date is mm-dd-yyyy
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

/*
* Helper method to decorate a label.
*
* @param Label Label which needs to be decorated.
*/
function decorateLabel_(label) {
   label.setStyleAttribute("fontSize","12pt");
   label.setStyleAttribute("margin-top","20px");
   label.setStyleAttribute("font-weight","bold");
   label.setStyleAttribute("background", "white");
   label.setStyleAttribute("color","black");
}

function decorateLabelRed_(label) {
   label.setStyleAttribute("fontSize","12pt");
   label.setStyleAttribute("margin-top","20px");
   label.setStyleAttribute("font-weight","bold");
   label.setStyleAttribute("background", "red");
   label.setStyleAttribute("color","black");
}

/*
* Helper method to decorate a label using secondary style.
*
* @param Label Label which needs to be decorated.
*/
function decorateLabel1_(label) {
   label.setStyleAttribute("fontSize","8pt");
   label.setStyleAttribute("margin-top","2px");
   label.setStyleAttribute("font-weight","normal");
   label.setStyleAttribute("color","gray");
}


/*
* Below are the unit tests. Run them before embedding this webapp
*/
function testGetUserRecord() {
  var dateRecords = new DateRecords();
  var timeStamp = new Date();
  dateRecords.getDateRecords(timeStamp);
  for(var i =0; i < dateRecords.userRecords.length; i++){
    Logger.log("userid:"+dateRecords.userRecords[i].userID);
    Logger.log("Timestamp: " + dateRecords.userRecords[i].timestamp);
  }
}



function testInsertTimeSheet() {
 var userRecord1 = new UserRecord();
 var userRecord2 = new UserRecord();

 // set the values
 var timeStamp = new Date();
 
 userRecord1.timestamp = timeStamp;
 userRecord1.userID = "xyz2@hotmail.com";
 userRecord1.dateBooked = timeStamp;
 userRecord1.updateUserRecord("add");

 var timeStamp1 = new Date();
 userRecord2.timestamp = timeStamp1;
 userRecord2.userID = "abc2@hotmail.com";
 userRecord2.dateBooked = timeStamp1;
 userRecord2.updateUserRecord("add");
}

function testRemoveRecord(){
 var userRecord1 = new UserRecord();
 // set the values
 var timeStamp = new Date();
 
 userRecord1.timestamp = timeStamp;
 userRecord1.userID = "abc2@hotmail.com";
 userRecord1.dateBooked = timeStamp;
 userRecord1.updateUserRecord("remove");
}

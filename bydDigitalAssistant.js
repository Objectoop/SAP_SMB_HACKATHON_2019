/**
 * This code implements an integration of SAP Business by Design with Amazon Echo
 * 
 */

const axios = require('axios');
exports.handler = function (event, context) {
    try {

        if (event.session.new) {
            onSessionStarted({
                requestId: event.request.requestId
            }, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception Object: " + e);
        console.log('exception: ' + e.message);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    console.log(intentRequest);
    var intent = intentRequest.intent;
    var intentName;
    //intentName = extractValue('PreviousIntent', intent, session);

    console.log('CURRENT Intent is ' + intent.name);
    //console.log('PREVIOUS intent was ' + intentName);

    if ("AMAZON.StopIntent" === intent.name ||
        "AMAZON.CancelIntent" === intent.name) {
        handleSessionEndRequest(callback);
    }

    if (intentName == null) {
        intentName = intent.name;
    }

    // Dispatch to your skill's intent handlers
    switch (intentName) {
        case "SayHello":
            sayHello(intent, session, callback);
            break;
        case "CreateiStock":
            test_create_identified_stock(intent, session, callback);
            break;
        default:
            throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------
function getWelcomeResponse(callback) {

    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = getWelcomeMessage();

    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = 'What is my command, master?';
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function getWelcomeMessage() {
    var message = [];

   /* message[0] = "Welcome to BYD  Alexa Digitial Assistant. How can I help?"
    message[1] = "Hi, I am your BYD  Alexa Digitial Assistant. How can I help you today?"
    message[2] = "This is BYD  Alexa Digitial Assistant speaking. What is my command?"
    message[3] = "Hello! Here is BYD  Alexa Digitial Assistant. Let me know what do you wish."
*/
    message[0] = "Welcome to ByD";
    message[1] = "Welcome to ByD";
    message[2] = "Welcome to ByD";
    message[3] = "Welcome to ByD";
    return message[0];
}

function getFallbackIntentResponse(callback) {

    var sessionAttributes = {};
    var cardTitle = "FallbackIntent";
    var speechOutput = "";

    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    var speechOutput = "Okay.";

    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}


/**
 * BYD Interactions
 */
function sayHello(intent, session, callback) {

    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    var userFirstName = extractFirstNameValue('SayHello', intent, session);
        console.log("Say Hello to : "+userFirstName);
    speechOutput = "Hi "+userFirstName+", I am the ByD Alexa Digital Assistant. I am here to help you with S-A-P Business By Design! Just ask!"

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function test_create_identified_stock_bakup(intent, session, callback) {

    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
   // var userFirstName = extractFirstNameValue('SayHello', intent, session);
    //    console.log("Say Hello to : "+userFirstName);
    speechOutput = "Identified Stock has been created";



    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function test_create_identified_stock(intent, session, callback) {

  //Default
  var repromptText = null;
  var sessionAttributes = {};
  var shouldEndSession = false;
  var speechOutput = "";

  var start_from = extractValue('start_from', intent, session)
  var num_iden = extractValue('num_iden', intent, session)

  sessionAttributes = handleSessionAttributes(sessionAttributes, 'start_from', start_from);
  sessionAttributes = handleSessionAttributes(sessionAttributes, 'num_iden', num_iden);

  if (start_from == null) {
      speechOutput = "What number you want to start from?";
      repromptText = "Tell me the number you want to start from";
  } else if (num_iden == null) {
      speechOutput = "How many records do you need?";
      repromptText = "Tell me the number of records you need";
  } else {

    //TODO: call byd 
    const url = 'https://myxxxxxxxx.sapbydesign.com/sap/bc/srt/scs/sap/manageidentifiedstocksin?sap-vhost=my334089.sapbydesign.com';
    const headers = {
        'Authorization':'Basic X0JNQzpJbml0QDEyMzQ=',
        'Content-Type': 'text/xml;charset=UTF-8',
    };

    var xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:glob="http://sap.com/xi/SAPGlobal20/Global"> ';
    xml += '<soapenv:Header/>';
    xml += '<soapenv:Body>';
    xml += ' <glob:IdentifiedStockMaintainRequestMessage>';
    xml += '<BasicMessageHeader></BasicMessageHeader> ';

    for(var i = parseInt(start_from) ; i < parseInt(start_from) + parseInt(num_iden) ; i++)
    {
        xml += ' <IdentifiedStockMaintainBundle actionCode="01" activateIdentifiedStockIndicator="true" DescriptionListCompleteTransmissionIndicator="true" QuantityConversionListCompleteTransmissionIndicator="true">';
        xml += '<IdentifiedStockID>SAP_SMB-'+i+'</IdentifiedStockID>';
        xml += ' <ProductID>N-43-RC01AM1000JIS13</ProductID>';
        xml += ' <Description actionCode="01">';
        xml += '<Description languageCode="EN">SAP</Description>';
        xml += ' </Description>';
        xml += '<ProductionDateTime>2019-02-01T12:00:00.1234567Z</ProductionDateTime>';
        xml += '</IdentifiedStockMaintainBundle>';

    }
   
    xml += '</glob:IdentifiedStockMaintainRequestMessage>';
    xml += '</soapenv:Body>';
    xml += '</soapenv:Envelope>';

    axios({
        method: 'post',
        url,
        headers,
        data: xml,
        timeout: 50000,
      }).then((response) => {
        /*resolve({
          response: {
            body: response.data,
            statusCode: response.status,
          },
        });*/

      }).catch((error) => {
      if (error.response) {
        console.log(`SOAP FAIL: ${error}`);
       // reject(error.response.data);
      } else {
        console.log(`SOAP FAIL: ${error}`);
       // reject(error);
      }
    });


    speechOutput = "We have created Identified stock for board start from " + start_from+ " for " + num_iden + " records. ";
    var tmp = "";
    for(var i = parseInt(start_from) ; i < parseInt(start_from) + parseInt(num_iden) ; i++)
    {
        if(tmp != "") tmp += ", ";
        tmp += "SAP_TEST-"+i;

    }
    speechOutput = speechOutput + tmp;
    repromptText = "";
    shouldEndSession = true
  }

  //sessionAttributes = handleSessionAttributes(sessionAttributes, 'PreviousIntent', intent.name);


  // Call back while there still questions to ask
  callback(sessionAttributes,
      buildSpeechletResponse(
          intent.name, speechOutput,
          repromptText, shouldEndSession
      )
  );
}


function extractValue(attr, intent, session) {

    console.log("Extracting " + attr);

    if (session.attributes) {
        if (attr in session.attributes) {
            console.log("Session attribute " + attr + " is " + session.attributes[attr]);
            return session.attributes[attr];
        }
    }

    console.log("No session attribute for " + attr);

    if (intent.slots) {
        if (attr in intent.slots && 'value' in intent.slots[attr]) {
            return intent.slots[attr].value;
        }
    };
    return null;
}

function extractSessionAttributeValue(attr, session) {

    console.log("Extracting " + attr);

    if (session.attributes) {
        if (attr in session.attributes) {
            console.log("Session attribute " + attr + " is " + session.attributes[attr]);
            return session.attributes[attr];
        }
    }

    console.log("No session attribute for " + attr);

    return null;
}

function handleSessionAttributes(sessionAttributes, attr, value) {

    //if Value exists as attribute than returns it
    console.log("Previous " + attr + "is: " + value)
    if (value) {
        sessionAttributes[attr] = value;
    }
    return sessionAttributes;
}


function formatItemGrp(itemGrp) {
    //Assures the item group name is formatted correctly

    itemGrp = itemGrp.toLowerCase();

    if (itemGrp == 'pc') {
        return 'PC';
    }
    return toTitleCase(itemGrp)
}


function toTitleCase(str) {
    //Capitlize the first letter of each word on a given string
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
// --------------- Auxiliar Functions Formatting -----------------------



function getDateTime(withHour) {
    var currentdate = new Date();
    var datetime = currentdate.getFullYear() + "-"
        + (currentdate.getMonth() + 1) + "-"
        + currentdate.getDate();

    if (withHour) {
        datetime += " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();
    }

    return datetime;
}





function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
 
    console.log("ALEXA: "+output);
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Standard",
            title: title,
            text: output,
            image: {
                smallImageUrl: "https://i.imgur.com/ZJFFyRa.png"
            }
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}


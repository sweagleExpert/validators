// description: Check if hosts found in URLs correspond to authorised regex rule

// correctHostRegex.js
//
// No inputs except subset to parse
//
// Creator:   Dimitris for customer POC
// Version:   1.0
//

// defines list of keys or nodes to ignore in check
var exceptionList= ["KEYNAME"];
// Errors variables
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = '';
// Rules variables
var urlExpression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
var validUrlRegex = new RegExp(urlExpression);
var authorisedHostRegex = new RegExp(".priv$");

findValuesMatchingUrl(metadataset, validUrlRegex);

if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


// Function to match URL in values and extract host from it
function findValuesMatchingUrl(subset, regex) {
  for (var item in subset) {
    if (maxErrorDisplay !==0 && errors.length >= maxErrorDisplay) { break; }
    if  (typeof(subset[item]) === "object") {
      // If we are on a node call recursively the function
      findValuesMatchingUrl (subset[item], regex);
    } else if (regex.test(subset[item]) ) {
      // check if not in exception list
      var exception = false;
      for(var exc=0; exc < exceptionList.length; exc++) {
        if (item.toLowerCase() === exceptionList[exc].toLowerCase()) { exception=true; break; }
      }
      if (exception === false) {
        var host=getHost(subset[item]);
        if (! authorisedHostRegex.test(host)) {
          errorFound = true;
          errors.push("## ERROR: URL key "+item+" has invalid host ("+host+")");
        }
      }
    }
  }
}

// Function to extract host from URL
function getHost(argUrl) {
  // Code below doesn't work in live mode
  //var url = new URL(argUrl);
  //return url.hostname;

    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname
    if (argUrl.indexOf("//") != -1) { hostname = argUrl.split('/')[2]; }
    else { hostname = argUrl.split('/')[0]; }
    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];
    return hostname;
}

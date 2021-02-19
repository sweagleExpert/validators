// description: Check if all email values belongs to authorised domains

// emailCheck-domains.js
//
// No inputs except subset to parse
//
// Creator:   Dimitris for customer POC
// Version:   1.0
//

// Standard Validators variables
var errorFound = false;
var errors = [];
var description = '';
var maxErrorDisplay = 5;
// defines list of keys to ignore in check
var exceptionList= ["KEYNAME"];
// Defines if error must include full path of key found
var includePath = true;
var pathSeparator = ",";

// Rules variables
var authorisedDomains = ["credit-suisse.com", "cs.com"];
var emailExpression = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
var valueRegex = new RegExp(emailExpression);

findValuesMatchingRegex(cds[0], valueRegex, [], 0, pathSeparator);

if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


// Function to match regex in values and extract host from it
function findValuesMatchingRegex(subset, regex, prefix, level, pathSeparator) {
  for (var item in subset) {
    if (maxErrorDisplay !==0 && errors.length >= maxErrorDisplay) { break; }
    if  (typeof(subset[item]) === "object") {
      // If we are on a node call recursively the function
      prefix[level] = item;
      findValuesMatchingRegex (subset[item], regex, prefix, level+1, pathSeparator);
    } else if (regex.test(subset[item]) ) {
      // If the value match our regex
      // check if not in exception list
      //console.log("ITEM="+item);
      //console.log("VALUE="+subset[item]);
      var exception = false;
      for(var exc=0; exc < exceptionList.length; exc++) {
        if (item.toLowerCase() === exceptionList[exc].toLowerCase()) { exception=true; break; }
      }
      if (exception === false) {
        // Extract domain from the email value
        var domain=subset[item].split('@')[1];
        //console.log("DOMAIN="+domain);
        if (! authorisedDomains.includes(domain)) {
          errorFound = true;
          if (includePath) {
            var pre=prefix[0];
          	for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
            errors.push("## key "+pre+pathSeparator+item+" is not encrypted");
          } else {
            errors.push("## ERROR: key "+item+" has invalid domain ("+domain+")");
          }
        }
      }
    }
  }
}

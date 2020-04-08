// description: Check if no URL is used with LDAP (only LDAPS allowed)

// noLDAP.js
// Check if no URL is used with LDAP (only LDAPS allowed)
// Creator:   Dimitris Finas for customer POC
// Version:   1.2 - new format + correct path
//

var searchValue = "ldap:/";
// List of keys that won't be checked
var exceptionList= [
    "KEYNAME"
    ];

var includePath = false;
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = '';

searchSubstringWithPath(metadataset, searchValue.toLowerCase(), [], 0, "/");

if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


function searchSubstringWithPath (mds, searchValue, prefix, level, pathSeparator) {
  for (var item in mds) {
    // get out if we already reach max nb of errors to display
    if (errors.length >= maxErrorDisplay) { break; }
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      prefix[level] = item;
      searchSubstringWithPath (mds[item], searchValue, prefix, level+1, pathSeparator);
    } else {
      // check if the key contains the search term
      if (mds[item].toLowerCase().includes(searchValue)) {
        var exception = false;
        for(var exc=0; exc < exceptionList.length; exc++) {
          if (item.toLowerCase() === exceptionList[exc].toLowerCase()) { exception=true; break; }
        }
        if (exception === false) {
            errorFound = true;
            var pre=prefix[0];
            for (var i=1; i<level; i++) { pre = pre + pathSeparator + prefix[i]; }
            if (includePath) { errors.push("## key "+pre+pathSeparator+item+" contains an LDAP unsecure url"); }
            else { errors.push("## key "+item+" contains an LDAP unsecure url"); }
        }
      }
    }
  }
}

// description: Checks if MDS hosts (used in URLs) are in approved list

// hostsFromUrlsValidator.js
// Creator:   Dimitris for customer POC
// Version:   1.0 - first release
//
var rootName = Object.keys(metadataset)[0];
var root = metadataset[rootName];
var approvedNode = root.approved.hosts;
var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
var validUrlRegex = new RegExp(expression);

// Defines if error must include full path of key found
var includePath = true;
// Defines the max number of errors to return
var maxErrorDisplay = 3;
var errorFound = false;
var errors = [];
var description = '';

if (approvedNode != undefined) { var approvedArray = Object.keys(approvedNode); }
else { return {description: "## ERROR: Approved list not found ", result: false}; }

checkMatchingUrls(metadataset, [], 0, "/");

if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


function checkMatchingUrls(mds, prefix, level, pathSeparator) {
  for (var item in mds) {
    if (errors.length >= maxErrorDisplay) { break; }
    if  (typeof(mds[item]) === "object") {
      // If we are on a node call recursively the function
      if (item != "approved") {
        prefix[level] = item;
        checkMatchingUrls (mds[item], prefix, level+1, pathSeparator);
      }
    } else if (validUrlRegex.test(mds[item]) ) {
      var host=getHost(mds[item]);
      if (! approvedArray.includes(host)) {
        errorFound = true;
        var pre=prefix[0];
        for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
        if (includePath) { errors.push("## Key ("+pre+pathSeparator+item+") has not approved host in url: ("+host+")"); }
        else { errors.push("## Key ("+item+") has not approved host in url: ("+host+")"); }
      }
    }
  }
}

// Function to extract host from URL
function getHost(argUrl) {
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

// description: Checks if all endpoints defined in CDS can be resolved in DNS A record

var includePath = false;
// defines list of keys or nodes to ignore in check
var exceptionList= ["KEYNAME"];
// defines max errors to display in result, 0 means no limit
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = '';
var pathSeparator = "/";
// rules variables
var rootNode="";
var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
var urlRegex = new RegExp(expression);

if (cds.length != 2) {
  return {result: false, description: 'This exporter requires 2 configdatasets: application and dns zone'};
}

rootNode=Object.keys(cds[0]);
var appliCds = cds[0][rootNode];
rootNode=Object.keys(cds[1]);
var dnsCds = cds[1][rootNode];
//console.log(appliCds);
//console.log(dnsCds);

checkMatchingHosts(appliCds, '');


// Display result
if (errors.length > 0) {
  if (maxErrorDisplay == 0 || errors.length < maxErrorDisplay) {
    return {"result": false, "description": errors.length + " host(s) could not resolve to an authorised 'A'-record: " + errors.join(', ') };
  } else {
    return {"result": false, "description": "Only first "+maxErrorDisplay+" hosts are displayed:" + errors.join(', ') };
  }
} else { return {"result": true, "description": "All hosts resolved successfully"}; }


/// Function to return all values matching a specific regex in an array
function checkMatchingHosts(subset, path) {
  for (var item in subset) {
    if (maxErrorDisplay != 0 && errors.length >= maxErrorDisplay) { break; }
    if  ( typeof(subset[item]) === "object") {
      // If we are on a node call recursively the function, skipping approved node
      checkMatchingHosts (subset[item], path+pathSeparator+item);
    } else if (urlRegex.test(subset[item])) {
      var host=getHost(subset[item]);
      if (! hasARecord(host, [], dnsCds)) {
        if (includePath) { errors.push("## Key ("+path+pathSeparator+item+") has not approved host: ("+host+")"); }
        else { errors.push("## Key ("+item+") has not approved host: ("+host+")"); }
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


// Function to check if A-record exists for this host
function hasARecord(cname, checked, dnsSubset) {
  	// ignore all hosts put in exception list
  	if (exceptionList.includes(cname)) { return true; }
    // check for cyclical dependencies, ie host A pointing to host B
    // and host B pointing to host A
    if (checked.includes(cname)) { return false; }

    // if the host we are currently checking does not have a node in the
    // data model, it cannot be resolved to an A-record
    if (typeof(dnsSubset[cname]) === 'undefined') { return false; }
    // if the host does not have a 'type' attribute it is invalid and cannot be resolved
  	else if (typeof(dnsSubset[cname].type) === 'undefined') { return false; }

    if (dnsSubset[cname].type == 'A') {
        // if we found the A-record we can exit the function
        return true;
    } else {
        // if we haven't found the A-record yet, add it to the list of hosts that
        // we have already checked
        checked.push(cname);
        // recursively check for the host that is defined as 'canonical' attribute
        return hasARecord(dnsSubset[cname].canonical, checked, dnsSubset);
    }
}

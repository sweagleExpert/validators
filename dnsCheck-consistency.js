// description: Validates whether records in DNS cds can be resolved to an 'A'-record

var includePath = true;
// defines list of keys or nodes to ignore in check
var exceptionList= ["KEYNAME"];
// defines max errors to display in result, 0 means no limit
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = '';
var pathSeparator = "/";

var rootNode=Object.keys(cds[0]);
//console.log("rootNode="+rootNode);
if (rootNode == "dns") {
  // We are checking the full dns, check for each zone
  for (var zone in cds[0][rootNode]) {
//    console.log("zone="+zone);
    checkDnsZone(cds[0][rootNode][zone], zone);
  }
} else {
  // We are checking a single dns zone
  checkDnsZone(cds[0][rootNode], "");
}

function checkDnsZone(subset, zonePath) {
  // run over all hosts in the subset
  for (var host in subset) {
      // if we are over max errors, stop checking
      if (maxErrorDisplay>0 && errors.length>maxErrorDisplay) { break; }
      // check whether the host we're looping over can be resolved to an A-record, only if it is a node
      if (typeof(subset[host]) === 'object') { getARecord(host, [], subset, zonePath); }
  }
}

function getARecord(cname, checked, subset, recordPath) {
  	// ignore all hosts put in exception list
  	if (exceptionList.includes(cname)) { return; }
    // check for cyclical dependencies, ie host A pointing to host B
    // and host B pointing to host A
    if (checked.includes(cname)) {
        if (includePath) {
           if (!errors.includes(recordPath+"/"+cname)) { errors.push(recordPath+"/"+cname); }
        } else {
          if (!errors.includes(cname)) { errors.push(cname); }
    	}
        return;
    }

    // if the host we are currently checking does not have a node in the
    // data model, it cannot be resolved to an A-record
    if (typeof(subset[cname]) === 'undefined') {
      	if (includePath) { errors.push(recordPath + "/" + cname); }
      	else { errors.push(cname); }
        return;
    } else if (typeof(subset[cname].type) === 'undefined') {
        // if the host does not have a 'type' attribute it is invalid and cannot be resolved
      	if (includePath) { errors.push(recordPath + "/" + cname); }
      	else { errors.push(cname); }
        return;
    }

    if (subset[cname].type == 'A') {
        // if we found the A-record we can exit the function
        return;
    } else {
        // if we haven't found the A-record yet, add it to the list of hosts that
        // we have already checked
        checked.push(cname);
        // recursively check for the host that is defined as 'canonical' attribute
        getARecord(subset[cname].canonical, checked, subset, recordPath+pathSeparator+cname);
    }
}

// Display result
if (errors.length > 0) {
  if (errors.length < maxErrorDisplay) {
    return {"result": false, "description": errors.length + " host(s) could not resolve to an 'A'-record: " + errors.join(', ') };
  } else {
    return {"result": false, "description": "Only first "+maxErrorDisplay+" hosts are displayed:" + errors.join(', ') };
  }
} else { return {"result": true, "description": "All hosts resolved successfully"}; }

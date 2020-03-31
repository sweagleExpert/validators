// description: Checks if any orphans keys in MDS, orphans are keys not used in any tokens. Keys that contains tokens in their value are ignored

// orphansDetector.js
//
// No inputs except MDS to parse
// Outputs are: Error if any orphan detected
//
// Creator:   Anastasia, Dimitris for customer POC
// Version:   1.0

// defines list of keys or nodes to ignore in check
var exceptionList= ["KEYNAME"];
// Defines if error must include full path of key found
var includePath = true;
// Defines the max number of errors to return
var maxErrorDisplay = 10;
var errorFound = false;
var errors = [];
var description = '';
var pathSeparator = '/';

var maxTokensDisplay = 0;
var allTokens = [];
var allKeys = [];
var keysNotUsedInTokens = [];
var tokenRegex =  "{{(.*?)}}";
var globalRegex = new RegExp(tokenRegex,"g");

findAllTokensAndKeys(metadataset,'');

//console.log(allTokens);
//console.log(allKeys);

for (var i=0; i < allKeys.length; i++) {
	for (var j=0; j < allTokens.length; j++) {
    //console.log("key="+allKeys[i].keyName);
		if (allTokens.indexOf(allKeys[i].keyName)===-1) {
      if (includePath) { errors.push(allKeys[i].path + allKeys[i].keyName); }
      else { errors.push(allKeys[i].keyName); }
      break;
    }
	}
	if ( maxErrorDisplay !==0 && errors.length >= maxErrorDisplay) { break;}
}

if (errors.length > 0) {
  errorFound = true;
  if (errors.length < maxErrorDisplay) { description = "ERRORS: These keys are not used in any token: (" + errors.join(', ') + ")"; }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed. These keys are not used in any token: (" + errors.join(', ') + ")"; }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


// Funtion to find tokens or keys in MDS
function findAllTokensAndKeys(mds, path) {
	for (var item in mds) {
		if (maxErrorDisplay !==0 && allTokens.length >= maxErrorDisplay) { break; }
		if (!exceptionList.includes(item)) {
      if (typeof mds[item] === 'object') {
        findAllTokensAndKeys(mds[item], path + item + pathSeparator);
		  } else if ( globalRegex.test(mds[item]) ) {
        // this key has a tokenized value, register it in tokenArray
        // Get list of matches
        var matches = mds[item].match(globalRegex);
        for (var index in matches) {
          //console.log("match="+matches[index]);
          // Get only token name
          var token = matches[index].match(tokenRegex)[1];
          //console.log("token="+token);
          // Check if it doesn't already exists before adding it
          if (allTokens.indexOf(token)===-1) { allTokens.push(token); }
        }
			} else {
				// this value has no token, register key in allKeys array
        var tempkey = {};
				if (includePath) { tempkey = {'keyName': item, 'path': path}; }
				else { tempkey = {'keyName': item}; }
				if (allTokens.indexOf(tempkey)===-1) { allKeys.push(tempkey); }
			}
		}
	}
}

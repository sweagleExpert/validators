
// Validator to check that key values do not appear on a list of forbiddent key values.
// Can be use to check any forbidden list of values in a lookup cds with child nodes used as the list

var keyValuesWithDevValue = Object.keys(metadatasets[1][Object.keys(metadatasets[1])[0]]);

// List of keys that won't be checked
var exceptionList= [
    "KEYNAME"
];


// searches is list of all key matching the rule
// This will be used when validators allows custom error messages
var searches = {};
// errorFound is a local variable that founds errors
var errorFound = false;
var errorMsg = "";
/**
 * searchSubsting function searches the whole metadataset to find keys that include a given substring
 *
 * mds must be the given metadataset,
 * searchValue must be the string we want check in the values
 */
function searchSubstring (mds, searchValue) {

    for (var item in mds) {
        // check if the key has a value or points to an object
        if  (typeof (mds[item]) === "object") {
            // if value is an object call recursively the function to search this subset of the object
            searchSubstring (mds[item], searchValue);
        } else {
            // check if the key contains the search term
            if (mds[item].toLowerCase().includes(searchValue)) {
                var exception = false;
                for(var exc=0; exc < exceptionList.length; exc++) {
                    if (item.toLowerCase() === exceptionList[exc].toLowerCase()) {
                        exception=true;
                        break;
                    }
                }
                if (exception === false) {
                    errorFound = true;
                    errorMsg = errorMsg+"ERROR: key "+item+" contains Existing Service ID: "+mds[item]+".\n"
                    break;
                }
            }
        }
    }
}

// here we call our function with different search terms
console.log(keyValuesWithDevValue.length)
for(var i= 0; i < keyValuesWithDevValue.length; i++) {
    searchSubstring(metadatasets[0], keyValuesWithDevValue[i].toLowerCase());
}

return {"result":!errorFound,"description":errorMsg};

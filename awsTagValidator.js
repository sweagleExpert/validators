// Validates AWS Tags against a list of acceptable values
//
//
// First find all "Tags" in metadatset[0]
// Then lookup in Tags in Lookup tree in metatdatset[1][arg[0]]
// arg is a subnode of the lookup object for more granular list of tags
// if no arg searches entire lookup CDS
// First CDS is Dataset to validate
// Second CDS is used as a lookup for valid tags
//

var errorFound = false;
var errorMsg = "";
var tagList=[];
var lookUpBranch = JSON.parse(arg);

function findTags(mds, searchValue) {

    for (var item in mds) {
        // check if the key has a value or points to an object
        if (typeof (mds[item]) === "object") {
            // if value is an object call recursively the function to search this subset of the object
            findTags(mds[item], searchValue);
        } else {
            // check if the key contains the search term
            if (item == searchValue) {
                tagList.push(mds[item]);
            }
        }

    }

}

function searchSubstring(mds, searchValue) {
    var foundTag = false;
    for (var item in mds) {
        // check if the key has a value or points to an object
        if (typeof (mds[item]) === "object") {
            // if value is an object call recursively the function to search this subset of the object
            searchSubstring(mds[item], searchValue);
        } else {
            // check if the key contains the search term
            if (mds[item].includes(searchValue)) {
                foundTag = true;
                break;
            }

        }
    }
    if (foundTag === false) {
        errorFound = true;
        errorMsg = errorMsg + "ERROR: Tag " + searchValue + " not found in lookup: " + lookUpBranch + ".\n"

    }
}
//searchValue is the field we're checkin ing the lookup

findTags(metadatasets[0], "Tags");
for (var i = 0; i < tagList.length; i++) {
    searchSubstring(metadatasets[1][Object.keys(metadatasets[1])[0]][lookUpBranch], tagList[i]);
}

return {"result":!errorFound,"description":errorMsg};

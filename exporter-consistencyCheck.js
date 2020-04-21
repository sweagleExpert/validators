var res = true;
var errorMsg = '';
var arrays = {};
var result = [];
var finalCheck = {};

function hasOwnDeepProperty(obj, searchkey) {
    if (typeof (obj) === 'object' && obj !== null) {
        if (obj.hasOwnProperty(searchkey)) {
            if (typeof (arrays[searchkey]) === "undefined") {
                arrays[searchkey] = [];
            }
            arrays[searchkey].push(obj);
        }
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                hasOwnDeepProperty(obj[key], searchkey);
            }
        }
    }
}
function hasOwnDeepPropertyWithVal(obj, forbiddenKey, forbiddenValue, path) {
    if (typeof (obj) === 'object' && obj !== null) {
        if (obj.hasOwnProperty(forbiddenKey) && obj[forbiddenKey] === forbiddenValue) {
            return { res: true, path: path + "," + forbiddenKey };
        }
        for (var key in obj) {
            if (obj.hasOwnProperty(key) && hasOwnDeepPropertyWithVal(obj[key], forbiddenKey, forbiddenValue, path + "," + key).res) {
                return { res: true, path: hasOwnDeepPropertyWithVal(obj[key], forbiddenKey, forbiddenValue, path + "," + key).path };
            }
        }
    }
    return { res: false, path: path };
}
for (var prop in metadatasets[1].consistencyCheck) {
    if (metadatasets[1].consistencyCheck.hasOwnProperty(prop)) {
        var obj = metadatasets[1].consistencyCheck[prop];
        hasOwnDeepProperty(metadatasets[0], obj.whereKeyName);
    }
}
for (var prop in metadatasets[1].consistencyCheck) {
    if (metadatasets[1].consistencyCheck.hasOwnProperty(prop)) {
        obj = metadatasets[1].consistencyCheck[prop];
        //search through the objects containing the desired keyName
        for (var resobj in arrays[obj.whereKeyName]) {
            if (obj.whereKeyValueContains.includes(arrays[obj.whereKeyName][resobj][obj.whereKeyName])) {
                if (typeof (finalCheck[prop]) === "undefined") {
                    finalCheck[prop] = [];
                }
                var check = hasOwnDeepPropertyWithVal( metadatasets[0], obj.keyNameToBeConsistent, arrays[obj.whereKeyName][resobj][obj.keyNameToBeConsistent], "");
                if (check.res) {
                    if (!JSON.stringify(finalCheck[prop]).includes(check.path.substring(1))) {
                        finalCheck[prop].push({ "value": arrays[obj.whereKeyName][resobj][obj.keyNameToBeConsistent], "path":  check.path.substring(1) });
                    }
                }
            }
        }
    }
}

for (var entry in finalCheck) {
    if (finalCheck[entry].length <= 1) {
        delete finalCheck[entry];
    }
}


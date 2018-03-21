
var skipSameValue = false;


var found = true;
function duplicateKeyNames (mds) {
    var	keyNames = Object.keys(mds);
    for (var item in mds) {
        if  (typeof (mds[item]) === "object") {
        duplicateKeyNames (mds[item]);
        }
        else {
            for (var i = 0; i<keyNames.length; i++) {
                if (item.toUpperCase() === keyNames[i].toUpperCase() && item !== keyNames[i]) {
                    if ( skipSameValue === true) {
        				if (mds[item] !== mds[keyNames[i]]) {
        					found = false;
        					break;
        				}
                    }
                    else {
        				found = false;
        				break;
                    }

    			}

    		} 

		}
	}
}


duplicateKeyNames (metadataset);

return found;
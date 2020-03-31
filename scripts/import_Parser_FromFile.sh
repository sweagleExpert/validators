#!/usr/bin/env bash
source $(dirname "$0")/sweagle.env

##########################################################################
#############
#############   CREATE AND PUBLISH A PARSER FILE IN SWEAGLE
#############
############# Inputs: See error message below
############# Output: 0 if no errors, 1 + Details of errors if any
##########################################################################
if ! ([ -x "$(command -v python)" ] || [ -x "$(command -v jq)" ]) ; then
  echo "########## ERROR: PYTHON or JQ IS REQUIRED FOR THIS SCRIPT"
  exit 1
fi

if [ "$#" -lt "2" ]; then
    echo "########## ERROR: NOT ENOUGH ARGUMENTS SUPPLIED"
    echo "########## YOU SHOULD PROVIDE 1- PARSER FILENAME AND 2- PARSER TYPE"
    echo "########## PARSER TYPE MUST BE EXPORTER, VALIDATOR OR TEMPLATE"
    exit 1
fi
argSourceFile=$1
argParserType=$2
parserId=""

#filename without path and extension for import
#filename=$(basename "$argSourceFile" ".js")
filename=$(basename "$argSourceFile")
extension="${filename##*.}"
filename="${filename%.*}"

fileContent=`cat $argSourceFile`

#get description from firstline of file
read -r firstline<$argSourceFile
if [[ $firstline == "// description:"* ]] || [[ $firstline == "# description:"* ]]; then
  description=$(echo $firstline| cut -d':' -f 2)
else
  description="$filename"
fi

# Put json parsers list in variable parsersList
function getParsers {
  echo "### Get parsers list"
  #For debug
  #echo "curl -sk -X GET '$sweagleURL/api/v1/tenant/metadata-parser' -H 'Authorization: bearer $aToken' -H 'Accept: application/vnd.siren+json'"
  if [ "$argParserType" = "TEMPLATE" ]; then
    response=$(curl -sk -X GET "$sweagleURL/api/v1/tenant/template-parser" -H "Authorization: bearer $aToken" -H "Accept: application/vnd.siren+json")
  else
    response=$(curl -sk -X GET "$sweagleURL/api/v1/tenant/metadata-parser" -H "Authorization: bearer $aToken" -H "Accept: application/vnd.siren+json")
  fi
  # Check if any error before continue
  errorFound=$(echo $response | jsonValue "error_description")
  if [[ -z $errorFound ]]; then
    parsersList="$response"
  else
    echo -e "\n###########"
    echo "### Error getting parser list: $errorFound"
    exit 1
  fi
}

#Return Parser Id from Parsers list identified by its name
function getParserIdFromName {
# Try first to get Id with JQ if present
if [ -x "$(command -v jq)" ] ; then
  parserName="$1"
  jsonValue="$2"
  id=$(echo ${jsonValue} | jq --arg parser_name ${parserName} '.entities[].properties | select(.name|index($parser_name)) | .id')
  echo ${id}
else
# Else, do it with PYTHON
parserName="$1" jsonValue="$2" python - <<EOF_PYTHON
#!/usr/bin/python
import json
import os
parserName = os.environ['parserName']
#print("### Use python to get Id for Parser "+parserName)
json1 = json.loads(os.environ['jsonValue'])
for item in json1["entities"]:
  if item["properties"]["name"] == parserName:
      print item["properties"]["id"]
EOF_PYTHON
fi
}

# Create parser from file and put new created Id in variable parserId
function createParser {
  local argName=$1
  local argDescription=$2
  local argScript=$3
  echo "### Create parser with name: $argName"
  if [ "$argParserType" = "TEMPLATE" ]; then
    #for debug
    #echo "curl -sk -X POST '$sweagleURL/api/v1/tenant/template-parser?name=$filename&parserType=$argParserType&errorDescriptionDraft=error+in+parser+$filename' --data-urlencode 'description=$argDescription' --data-urlencode 'template=$argScript' -H 'Authorization: bearer $aToken' -H 'Accept: application/vnd.siren+json'"
    response=$(curl -sk -X POST "$sweagleURL/api/v1/tenant/template-parser?name=$filename" --data-urlencode "description=$argDescription" --data-urlencode "template=$argScript" -H "Authorization: bearer $aToken" -H "Accept: application/vnd.siren+json")
  else
    response=$(curl -sk -X POST "$sweagleURL/api/v1/tenant/metadata-parser?name=$filename&parserType=$argParserType&errorDescriptionDraft=error+in+parser+$filename" --data-urlencode "description=$argDescription" --data-urlencode "scriptDraft=$argScript" -H "Authorization: bearer $aToken" -H "Accept: application/vnd.siren+json")
  fi
  # Check if any error before continue
  errorFound=$(echo $response | jsonValue "error_description")
  if [[ -z $errorFound ]]; then
    parserId=$(echo "$response" | jsonValue "id")
    echo "### Created parser with id: $parserId"
  else
    echo -e "\n###########"
    echo "### Error creating parser: $errorFound"
  fi
}

# Update parser from Id + script
function updateParser {
  local argId=$1
  local argDescription=$2
  local argScript=$3
  echo "### Update parser $argId"
  # to debug
  #echo "curl -sk -X POST '$sweagleURL/api/v1/tenant/metadata-parser/$argId' --data-urlencode 'description=$argDescription' --data-urlencode 'scriptDraft=$argScript' -H 'Authorization: bearer $aToken' -H 'Accept: application/vnd.siren+json'"
  if [ "$argParserType" = "TEMPLATE" ]; then
    response=$(curl -sk -X POST "$sweagleURL/api/v1/tenant/template-parser/$argId" --data-urlencode "description=$argDescription" --data-urlencode "template=$argScript" -H "Authorization: bearer $aToken" -H "Accept: application/vnd.siren+json")
  else
    response=$(curl -sk -X POST "$sweagleURL/api/v1/tenant/metadata-parser/$argId" --data-urlencode "description=$argDescription" --data-urlencode "scriptDraft=$argScript" -H "Authorization: bearer $aToken" -H "Accept: application/vnd.siren+json")
  fi
  # Check if any error before continue
  errorFound=$(echo $response | jsonValue "error_description")
  if [[ -z $errorFound ]]; then
    echo "### Updated parser with id: $argId"
  else
    echo -e "\n**********"
    echo "### Error updating parser: $errorFound"
  fi
}

function publishParser {
  local argId=$1
  local argScript=$2
  echo "### Publish parser with id: $argId"
  if [ "$argParserType" = "TEMPLATE" ]; then
    response=$(curl -sk -X POST "$sweagleURL/api/v1/tenant/template-parser/$argId/publish" --data-urlencode "template=$argScript" -H "Authorization: bearer $aToken" -H "Accept: application/vnd.siren+json" )
  else
    response=$(curl -sk -X POST "$sweagleURL/api/v1/tenant/metadata-parser/$argId/publish" -H "Authorization: bearer $aToken" -H "Accept: application/vnd.siren+json" )
  fi
  errorFound=$(echo $response | jsonValue "error_description")
  if [[ -z $errorFound ]]; then
    echo "### Published parser $argId"
  else
    echo -e "\n###########"
    echo "### Error publishing parser: $errorFound"
  fi
}

function getNextParserId {
  echo "### Get parser list"
  if [ "$argParserType" = "TEMPLATE" ]; then
    response=$(curl -sk -X GET -H "Authorization: bearer $aToken" -H "Accept: application/vnd.siren+json" "$sweagleURL/api/v1/tenant/template-parser")
  else
    response=$(curl -sk -X GET -H "Authorization: bearer $aToken" -H "Accept: application/vnd.siren+json" "$sweagleURL/api/v1/tenant/metadata-parser")
  fi
  # Check if any error before continue
  errorFound=$(echo $response | jsonValue "error_description")
  if [[ -z $errorFound ]]; then
    # Extract next Parser Id from list
    parserId=$(echo $response | jsonValue "id")
    echo "Next parser Id is $parserId"
  else
    echo -e "\n###########"
    echo "### Error getting parser list: $errorFound"
    exit 1
  fi
}

function deleteParser {
  local argId=$1
  echo "### Deleting parser $argId"
  if [ "$argParserType" = "TEMPLATE" ]; then
    response=$(curl -sk -X DELETE "$sweagleURL/api/v1/tenant/template-parser/$argId" -H "Authorization: bearer $aToken" -H "Accept: application/vnd.siren+json")
  else
    response=$(curl -sk -X DELETE "$sweagleURL/api/v1/tenant/metadata-parser/$argId" -H "Authorization: bearer $aToken" -H "Accept: application/vnd.siren+json")
  fi
  # Check if any error before continue
  errorFound=$(echo $response | jsonValue "error_description")
  if [[ -z $errorFound ]]; then
    echo "### Parser $argId deleted"
  else
    echo -e "\n###########"
    echo "### Error deleting parser: $errorFound"
    exit 1
  fi
}


echo -e "\n###########"
createParser "$filename" "$description" "$fileContent"
# Check if error returned because parser already exists
if [[ $response == *"already exists"* ]]; then
  echo "It's already there! Updating it"
  getParsers
  parserId=$(getParserIdFromName "$filename" "$parsersList")
  updateParser $parserId "$description" "$fileContent"
fi
if [[ ! -z $parserId ]]; then
  publishParser $parserId "$fileContent"
else
  echo -e "\n###########"
  echo "### ERROR CREATING PARSER: $filename"
  exit 1
fi

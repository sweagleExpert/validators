#!/usr/bin/env bash

##########################################################################
#############
#############   UPLOAD A DIRECTORY OR FILE OF PARSERS TO SWEAGLE
#############
############# Input: see error message below
############# Output: 0 if no errors, 1 + Details of errors if any
##########################################################################
if [ "$#" -lt "2" ]; then
    echo "########## ERROR: NOT ENOUGH ARGUMENTS SUPPLIED"
    echo "########## YOU SHOULD PROVIDE 1- PARSER FILENAME OR DIRECTORY AND 2- PARSER TYPE"
    echo "########## PARSER TYPE MUST BE EXPORTER, VALIDATOR OR TEMPLATE"
    exit 1
fi
argSourceDir=$1
argParserType=$2

sweagleScriptDir="$PWD"/$(dirname "$0")
# OR
#SCRIPT_NAME=$(readlink -f $0)
#SCRIPT_DIR=$( dirname ${SCRIPT_NAME} )
#SCRIPT_NAME=${SCRIPT_NAME##*/}

if [[ -f "$argSourceDir" ]] ; then
  # the arg is a file, call the upload script only once
  $sweagleScriptDir/import_Parser_FromFile.sh "$argSourceDir" "$argParserType"
elif [[ -d "$argSourceDir" ]] ; then
  # The arg is a directory, call the api for all files
  cd "$argSourceDir"
  # Execute only for javascript files in the target directory
  for file in *.js; do
    $sweagleScriptDir/import_Parser_FromFile.sh "$file" "$argParserType"
  done
  for file in *.py; do
    $sweagleScriptDir/import_Parser_FromFile.sh "$file" "$argParserType"
  done
else
    echo "########## ERROR: Argument $argSourceDir is not a directory or file, exiting";
    exit 1
fi

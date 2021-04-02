"""
Check that all keys have values
"""

# VARIABLES
NO_VALUE = 0
BAD_KEYS = []

def find_no_value(subset: dict) -> None:
  """Recursive function to iterate through values."""
  for key, value in subset.items():
    if isinstance(value, str) and len(value) == 0 :
      global NO_VALUE, BAD_KEYS
      NO_VALUE += 1
      BAD_KEYS.append(key)
    elif isinstance(value, dict):
      find_no_value(value)


"""Call the function to check the values in the CDS."""
for item in cds:
  global NO_VALUE, BAD_KEYS
  find_no_value(item)
  if NO_VALUE == 0:
    return {"result": True, "description": "Successfully validated metadataset."}
  else:
    output = "ERROR: {} keys containing empty value found in {}".format(NO_VALUE, BAD_KEYS)
    return {"result": False, "description": output}

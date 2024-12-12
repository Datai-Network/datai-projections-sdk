module.exports = `syntax = "proto3";

package ethereum;

enum ValueKindPb {
  ADDRESS = 0;
  FIXED_BYTES = 1;
  BYTES = 2;
  INT = 3;
  UINT = 4;
  BOOL = 5;
  STRING = 6;
  FIXED_ARRAY = 7;
  ARRAY = 8;
  TUPLE = 9;
}

message ValuePb {
  ValueKindPb kind = 1;
  optional bytes bytesData = 102; // = addressData, fixedBytesData, intData, uintData (uses little-ended two's-complement signed int)
  optional bool boolData = 105;
  optional string stringData = 106;
  optional ValuesPb arrayData = 108; // = fixedArrayData, tupleData
}

message ValuesPb {
  repeated ValuePb values = 1;
}

message SmartContractCallPb {
  string contractName = 1;
  bytes contractAddress = 2;
  string functionName = 3;
  string functionSignature = 4;
  ValuesPb functionParams = 5;
}`

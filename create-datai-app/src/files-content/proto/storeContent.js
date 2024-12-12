module.exports = `syntax = "proto3";

package store;

import "bigDecimal.proto";

enum ValueKindPb {
  STRING = 0;
  INT = 1;
  BIGDECIMAL = 2;
  BOOL = 3;
  ARRAY = 4;
  NULL = 5;
  BYTES = 6;
  BIGINT = 7;
  INT8 = 8;
  TIMESTAMP = 9;
}

message ValuePb {
  ValueKindPb kind = 1;
  optional string stringData = 100;
  optional int32 intData = 101;
  optional bigDecimal.BigDecimalPb bigdecimalData = 102;
  optional bool boolData = 103;
  optional ValuesPb arrayData = 104;
  // null = 105;
  optional bytes bytesData = 106; // = bigintData (uses little-ended two's-complement signed int)
  optional int64 int8Data = 108; // = timestampData
}

message ValuesPb {
  repeated ValuePb values = 1;
}

message EntityPb {
  map<string, ValuePb> entries = 1;
}

message EntitiesPb {
  repeated EntityPb items = 1;
}

message EntityWithMetaPb {
  EntityPb entity = 1;
  string idField = 2;
  bool isImmutable = 3; 
}

/*

export namespace store {
  function get(entity: string, id: string): Entity | null;
  // If the entity was not created in the block, this function will return null.
  // Matches the host function https://github.com/graphprotocol/graph-node/blob/9f4a1821146b18f6f49165305e9a8c0795120fad/runtime/wasm/src/module/mod.rs#L1091-L1099
  function get_in_block(entity: string, id: string): Entity | null;
  function loadRelated(entity: string, id: string, field: string): Entities;
  function set(entity: string, id: string, data: Entity): void;
  function remove(entity: string, id: string): void;
}

*/`

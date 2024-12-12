module.exports = `syntax = "proto3";

package bigDecimal;

message BigDecimalPb {
  bytes digits = 1; // little-ended two's-complement signed BigInt
  int32 exp = 2;
}`

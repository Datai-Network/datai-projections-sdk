module.exports = `syntax = "proto3";

package activePositions;

import "google/protobuf/timestamp.proto";

message TokenBalancePb {
  bytes tokenAddressBytes = 1;
  bytes tokenIdBytes = 2; // for ERC721 or ERC1155
  bytes balanceBytes = 3; // little-ended two's-complement signed BigInt, for ERC20 or ERC1155
}

message ActivePositionsResultPb {
    repeated TokenBalancePb supplyTokens = 1;
    repeated TokenBalancePb borrowTokens = 2;
    repeated TokenBalancePb rewardTokens = 3;
    TokenBalancePb positionToken = 4;
    google.protobuf.Timestamp unlockTimestamp = 5; // Unix time
    bytes poolAddressBytes = 6;
}
`

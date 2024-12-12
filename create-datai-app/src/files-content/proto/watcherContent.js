module.exports = `syntax = "proto3";

package watcher;

import "google/protobuf/any.proto";

message WatcherResultPb {
  string updateTrigger = 1;
  google.protobuf.Any payload = 2; 
}
`

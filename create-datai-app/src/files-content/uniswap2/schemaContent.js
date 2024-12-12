module.exports = `# common entities

type User @entity(immutable: true) {
  id: ID!
  positions: [UserPosition!]! @derivedFrom(field: "user")
}

enum UpdateType {
  SCHEDULE
  EVENT
}

type UpdateTrigger @entity {
  id: ID!
  updateType: UpdateType!
  nonce: Bytes!
}

type PositionUpdateTrigger @entity {
  id: ID!
  user: User!
  updateTrigger: UpdateTrigger!
}

interface UserPosition {
  id: ID!
  user: User!
}

# protocol-specific entities

type Uniswap2UserPosition implements UserPosition @entity(immutable: true) {
  id: ID!
  user: User!
}

type Uniswap2Pool @entity(immutable: true) {
  id: ID!
  token0: Bytes!
  token1: Bytes!
}
`

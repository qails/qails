export default `
  input HotelInput {
    name: String
  }

  interface Model {
    id: ID
  }

  type Hotel implements Model {
    id: ID
    name: String
    logo: String
    rooms: [Room]
  }

  type Query {
    hotels(withRelated: [String], page: Int, pageSize: Int, limit: Int, offset: Int): [Hotel]
    hotel(id: ID!, withRelated: [String]): Hotel
  }

  type Mutation {
    updateHotel(id: ID!, input: HotelInput): Hotel
    deleteHotel(id: ID!): Int
  }

`;

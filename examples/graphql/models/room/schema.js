export default `
  type Room {
    id: ID
    name: String
    hotelId: Int
  }

  type Query {
    rooms(withRelated: [String], page: Int, pageSize: Int, limit: Int, offset: Int): [Room]
    room(id: ID!, withRelated: [String]): Room
  }
`;

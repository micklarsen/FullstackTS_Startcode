import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';

const typeDefs = `#graphql
    type Friend {
        id: ID
        firstName: String
        lastName: String
        email: String
        role: String
    }

    type Position {
        email: String
        name: String
        location: Point
    }    

    type Coordinate {
        latitude: Float!
        longitude:Float!
    }
    type Coordinates {
        coordinates: [Coordinate]
    }
    type Point {
 
        """Will ALWAYS have the value Point"""
        type: String
        
        """Array with longitude followed by latitude [lon,lat]"""
        coordinates: [Float]
    }

    """
    Queries available for Friends
    """
     type Query {
        """
        Returns all details for all Friends
        (Should probably require 'admin' rights if your are using authentication)
        """
        getAllFriends : [Friend]!
        """
        Only required if you ALSO wan't to try a version where the result is fetched from the existing endpoint
        """
        getAllFriendsProxy: [Friend]!
        
        getFriendByEmail(input: String): Friend
        getFriendById(input: ID): Friend
    }

    input FriendInput {
        firstName: String!
        lastName: String!
        password: String!
        email: String!
    }
    input FriendEditInput {
        firstName: String
        lastName: String
        password: String
        email: String!
    }
    input PositionInput {
        email: String!
        longitude: Float!
        latitude: Float!
    }
    input PositionNearby {
        email: String!
        password: String
        longitude: Float!
        latitude: Float!
        distance: Int!
    }
    
    type Mutation {
        """
        Allows anyone (non authenticated users) to create a new friend
        """
        createFriend(input: FriendInput): Friend
        
        updateFriend(input: FriendEditInput): Friend
        
        deleteFriend(id: ID!): String
        
        addPosition(input: PositionInput): Boolean

        findNearbyFriends(input: PositionNearby): [Position]!
    }
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export { schema };
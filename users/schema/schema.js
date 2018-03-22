const graphql = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
} = graphql;

/**
 * Define the graphql type to shorten
 */
const String = { type: GraphQLString };
const StringNonNull = { type: GraphQLNonNull(GraphQLString) };
const Number = { type: GraphQLInt };
const NumberNonNull = { type: GraphQLNonNull(GraphQLInt) };

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: String,
        name: String,
        description: String,
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(res => res.data);
            }
        },
    }),
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: String,
        firstName: String,
        age: Number,
        company: {
            type: CompanyType,
            resolve({ companyId }, args) {
                return axios.get(`http://localhost:3000/companies/${companyId}`)
                    .then(res => res.data);
            },
        },
    }),
});

const RootQuery = new GraphQLObjectType({
    name:'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: String },
            resolve(parentValue, { id }) {
                return axios.get(`http://localhost:3000/users/${id}`)
                    .then(res => res.data);
            },
        },
        company: {
            type: CompanyType,
            args: { id: String },
            resolve(parentValue, { id }) {
                return axios.get(`http://localhost:3000/companies/${id}`)
                    .then(res => res.data);
            }
        }
    },
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: StringNonNull,
                age: NumberNonNull,
                companyId: StringNonNull,
            },
            resolve(parentValue, { firstName, age, companyId }) {
                return axios.post(`http://localhost:3000/users`, { firstName, age, companyId })
                    .then(res => res.data);
            },
        },
        deleteUser: {
            type: UserType,
            args: {
                id: StringNonNull,
            },
            resolve(parentValue, { id }) {
                return axios.delete(`http://localhost:3000/users/${id}`)
                    .then(res => res.data);
            }
        },
        editUser: {
            type: UserType,
            args: {
                id: StringNonNull,
                firstName: String,
                age: Number,
                companyId: String,
            },
            resolve(parentValue, args) {
                return axios.patch(`http://localhost:3000/users/${args.id}`, args)
                    .then(res => res.data);
            }
        }
    },
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation,
});

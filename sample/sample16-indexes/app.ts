import "reflect-metadata";
import {createConnection, ConnectionOptions} from "../../src/index";
import {Post} from "./entity/Post";
import {BasePost} from "./entity/BasePost";

const options: ConnectionOptions = {
    driver: {
        type: "sqlite",
        storage: "temp/sqlitedb.db"
    },
    logging: {
        logQueries: true,
        logFailedQueryError: true,
        logOnlyFailedQueries: true,
        logSchemaCreation: true
    },
    autoSchemaSync: true,
    entities: [Post, BasePost]
};

createConnection(options).then(connection => {

    let post = new Post();
    post.text = "Hello how are you?";
    post.title = "hello";
    post.likesCount = 0;

    let postRepository = connection.getRepository(Post);

    postRepository
        .persist(post)
        .then(post => console.log("Post has been saved"));

}, error => console.log("Cannot connect: ", error));

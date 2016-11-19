import "reflect-metadata";
import {expect} from "chai";
import {setupSingleTestingConnection} from "../../utils/test-utils";
import {ConnectionOptions} from "../../../src/connection/ConnectionOptions";
import {ConnectionManager} from "../../../src/connection/ConnectionManager";
import {SqliteDriver} from "../../../src/driver/sqlite/SqliteDriver";
import {PrimaryGeneratedColumn} from "../../../src/decorator/columns/PrimaryGeneratedColumn";
import {Column} from "../../../src/decorator/columns/Column";
import {Entity} from "../../../src/decorator/entity/Entity";

describe("ConnectionManager", () => {

    @Entity()
    class Post {

        @PrimaryGeneratedColumn()
        id: number;

        @Column()
        title: string;

        constructor(id: number, title: string) {
            this.id = id;
            this.title = title;
        }
    }

    describe("create", function() {

        it("should create a sqlite connection when sqlite driver is specified", () => {

            const options: ConnectionOptions = setupSingleTestingConnection("sqlite", {
                name: "default",
                entities: []
            });
            const connectionManager = new ConnectionManager();
            const connection = connectionManager.create(options);
            connection.name.should.be.equal("default");
            connection.driver.should.be.instanceOf(SqliteDriver);
            connection.isConnected.should.be.false;
        });


    });

    describe("createAndConnect", function() {

        it("should create a sqlite connection when sqlite driver is specified AND connect to it", async () => {
            const options: ConnectionOptions = setupSingleTestingConnection("sqlite", {
                name: "default",
                entities: []
            });
            const connectionManager = new ConnectionManager();
            const connection = await connectionManager.createAndConnect(options);
            connection.name.should.be.equal("default");
            connection.driver.should.be.instanceOf(SqliteDriver);
            connection.isConnected.should.be.true;
            await connection.close();
        });

    /*    it("should create a postgres connection when postgres driver is specified AND connect to it", async () => {
            const options: ConnectionOptions = {
                name: "mySqliteConnection",
                driver: createTestingConnectionOptions("postgres")
            };
            const connectionManager = new ConnectionManager();
            const connection = await connectionManager.createAndConnect(options);
            connection.name.should.be.equal("mySqliteConnection");
            connection.driver.should.be.instanceOf(PostgresDriver);
            connection.isConnected.should.be.true;
            await connection.close();
        });*/

    });

    describe("get", function() {

        it("should give connection with a requested name", () => {
            const options: ConnectionOptions = setupSingleTestingConnection("sqlite", {
                name: "mySqliteConnection",
                entities: []
            });
            const connectionManager = new ConnectionManager();
            const connection = connectionManager.create(options);
            connection.driver.should.be.instanceOf(SqliteDriver);
            connectionManager.get("mySqliteConnection").should.be.equal(connection);
        });

        it("should throw an error if connection with the given name was not found", () => {
            const options: ConnectionOptions = setupSingleTestingConnection("sqlite", {
                name: "mySqliteConnection",
                entities: []
            });
            const connectionManager = new ConnectionManager();
            const connection = connectionManager.create(options);
            connection.driver.should.be.instanceOf(SqliteDriver);
            expect(() => connectionManager.get("mySqliteConnection")).to.throw(Error);
        });

    });

    describe("create connection options", function() {

        it("should not drop the database if dropSchemaOnConnection was not specified", async () => {
            const options: ConnectionOptions = setupSingleTestingConnection("sqlite", {
                name: "mySqliteConnection",
                schemaCreate: true,
                entities: [Post]
            });
            const connectionManager = new ConnectionManager();

            // create connection, save post and close connection
            let connection = await connectionManager.createAndConnect(options);
            const post = new Post(1, "Hello post");
            await connection.entityManager.persist(post);
            await connection.close();

            // recreate connection and find previously saved post
            connection = await connectionManager.createAndConnect(options);
            const loadedPost = (await connection.entityManager.findOneById(Post, 1))!;
            loadedPost.should.be.instanceof(Post);
            loadedPost.should.be.eql({ id: 1, title: "Hello post" });
            await connection.close();
        });

        it("should drop the database if dropSchemaOnConnection was set to true (sqlite)", async () => {
            const options: ConnectionOptions = setupSingleTestingConnection("sqlite", {
                name: "mySqliteConnection",
                schemaCreate: true,
                dropSchemaOnConnection: true,
                entities: [Post]
            });
            const connectionManager = new ConnectionManager();

            // create connection, save post and close connection
            let connection = await connectionManager.createAndConnect(options);
            const post = new Post(1, "Hello post");
            await connection.entityManager.persist(post);
            await connection.close();

            // recreate connection and find previously saved post
            connection = await connectionManager.createAndConnect(options);
            const loadedPost = await connection.entityManager.findOneById(Post, 1);
            expect(loadedPost).to.be.undefined;
            await connection.close();
         });

    });

});

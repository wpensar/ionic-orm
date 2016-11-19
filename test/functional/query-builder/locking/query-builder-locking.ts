import "reflect-metadata";
import {createTestingConnections, closeTestingConnections, reloadTestingDatabases} from "../../../utils/test-utils";
import {Connection} from "../../../../src/connection/Connection";
import {PostWithVersion} from "./entity/PostWithVersion";
import {expect} from "chai";
import {PostWithoutVersionAndUpdateDate} from "./entity/PostWithoutVersionAndUpdateDate";
import {PostWithUpdateDate} from "./entity/PostWithUpdateDate";
import {PostWithVersionAndUpdatedDate} from "./entity/PostWithVersionAndUpdatedDate";
import {OptimisticLockVersionMismatchError} from "../../../../src/query-builder/error/OptimisticLockVersionMismatchError";
import {OptimisticLockCanNotBeUsedError} from "../../../../src/query-builder/error/OptimisticLockCanNotBeUsedError";
import {NoVersionOrUpdateDateColumnError} from "../../../../src/query-builder/error/NoVersionOrUpdateDateColumnError";
import {PessimisticLockTransactionRequiredError} from "../../../../src/query-builder/error/PessimisticLockTransactionRequiredError";
import {SqliteDriver} from "../../../../src/driver/sqlite/SqliteDriver";
import {LockNotSupportedOnGivenDriverError} from "../../../../src/query-builder/error/LockNotSupportedOnGivenDriverError";

describe("query builder > locking", () => {

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        schemaCreate: true,
        dropSchemaOnConnection: true,
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));


    it("should throw error if optimistic lock used with getMany method", () => Promise.all(connections.map(async connection => {

       return connection.entityManager.createQueryBuilder(PostWithVersion, "post")
           .setLock("optimistic", 1)
           .getMany().should.be.rejectedWith(OptimisticLockCanNotBeUsedError);
    })));

    it("should throw error if optimistic lock used with getCount method", () => Promise.all(connections.map(async connection => {

        return connection.entityManager.createQueryBuilder(PostWithVersion, "post")
           .setLock("optimistic", 1)
           .getCount().should.be.rejectedWith(OptimisticLockCanNotBeUsedError);
    })));

    it("should throw error if optimistic lock used with getManyAndCount method", () => Promise.all(connections.map(async connection => {

       return connection.entityManager.createQueryBuilder(PostWithVersion, "post")
           .setLock("optimistic", 1)
           .getManyAndCount().should.be.rejectedWith(OptimisticLockCanNotBeUsedError);
    })));

    it("should throw error if optimistic lock used with getRawMany method", () => Promise.all(connections.map(async connection => {

       return connection.entityManager.createQueryBuilder(PostWithVersion, "post")
           .setLock("optimistic", 1)
           .getRawMany().should.be.rejectedWith(OptimisticLockCanNotBeUsedError);
    })));

    it("should throw error if optimistic lock used with getRawOne method", () => Promise.all(connections.map(async connection => {

       return connection.entityManager.createQueryBuilder(PostWithVersion, "post")
           .setLock("optimistic", 1)
           .where("post.id = :id", { id: 1 })
           .getRawOne().should.be.rejectedWith(OptimisticLockCanNotBeUsedError);
    })));

    it("should not throw error if optimistic lock used with getOne method", () => Promise.all(connections.map(async connection => {

       return connection.entityManager.createQueryBuilder(PostWithVersion, "post")
           .setLock("optimistic", 1)
           .where("post.id = :id", { id: 1 })
           .getOne().should.not.be.rejected;
    })));

    it("should throw error if entity does not have version and update date columns", () => Promise.all(connections.map(async connection => {

        const post = new PostWithoutVersionAndUpdateDate();
        post.title = "New post";
        await connection.entityManager.persist(post);

        return connection.entityManager.createQueryBuilder(PostWithoutVersionAndUpdateDate, "post")
           .setLock("optimistic", 1)
           .where("post.id = :id", { id: 1 })
           .getOne().should.be.rejectedWith(NoVersionOrUpdateDateColumnError);
    })));

    it("should throw error if actual version does not equal expected version", () => Promise.all(connections.map(async connection => {

        const post = new PostWithVersion();
        post.title = "New post";
        await connection.entityManager.persist(post);

       return connection.entityManager.createQueryBuilder(PostWithVersion, "post")
           .setLock("optimistic", 2)
           .where("post.id = :id", { id: 1 })
           .getOne().should.be.rejectedWith(OptimisticLockVersionMismatchError);
    })));

    it("should not throw error if actual version and expected versions are equal", () => Promise.all(connections.map(async connection => {

        const post = new PostWithVersion();
        post.title = "New post";
        await connection.entityManager.persist(post);

       return connection.entityManager.createQueryBuilder(PostWithVersion, "post")
           .setLock("optimistic", 1)
           .where("post.id = :id", { id: 1 })
           .getOne().should.not.be.rejected;
    })));

    it("should throw error if actual updated date does not equal expected updated date", () => Promise.all(connections.map(async connection => {

        const post = new PostWithUpdateDate();
        post.title = "New post";
        await connection.entityManager.persist(post);

       return connection.entityManager.createQueryBuilder(PostWithUpdateDate, "post")
           .setLock("optimistic", new Date(2017, 1, 1))
           .where("post.id = :id", { id: 1 })
           .getOne().should.be.rejectedWith(OptimisticLockVersionMismatchError);
    })));

    it("should not throw error if actual updated date and expected updated date are equal", () => Promise.all(connections.map(async connection => {

        const post = new PostWithUpdateDate();
        post.title = "New post";
        await connection.entityManager.persist(post);

       return connection.entityManager.createQueryBuilder(PostWithUpdateDate, "post")
           .setLock("optimistic", post.updateDate)
           .where("post.id = :id", { id: 1 })
           .getOne().should.not.be.rejected;
    })));

    it("should work if both version and update date columns applied", () => Promise.all(connections.map(async connection => {

        const post = new PostWithVersionAndUpdatedDate();
        post.title = "New post";
        await connection.entityManager.persist(post);

        return Promise.all([
            connection.entityManager.createQueryBuilder(PostWithVersionAndUpdatedDate, "post")
                .setLock("optimistic", post.updateDate)
                .where("post.id = :id", { id: 1 })
                .getOne().should.not.be.rejected,

            connection.entityManager.createQueryBuilder(PostWithVersionAndUpdatedDate, "post")
                .setLock("optimistic", 1)
                .where("post.id = :id", { id: 1 })
                .getOne().should.not.be.rejected
        ]);
    })));

    it("should throw error if pessimistic locking not supported by given driver", () => Promise.all(connections.map(async connection => {
        if (connection.driver instanceof SqliteDriver)
            return connection.entityManager.transaction(entityManager => {
                return Promise.all([
                    entityManager.createQueryBuilder(PostWithVersion, "post")
                        .setLock("pessimistic_read")
                        .where("post.id = :id", { id: 1 })
                        .getOne().should.be.rejectedWith(LockNotSupportedOnGivenDriverError),

                    entityManager.createQueryBuilder(PostWithVersion, "post")
                        .setLock("pessimistic_write")
                        .where("post.id = :id", { id: 1 })
                        .getOne().should.be.rejectedWith(LockNotSupportedOnGivenDriverError)
                ]);
            });
    })));

});

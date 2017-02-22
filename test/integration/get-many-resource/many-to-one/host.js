const path = require('path');
const request = require('supertest');
const app = require('../../../../server/app');
const getDb = require('../../../../lib/database');
const wipeDatabase = require('../../../../lib/database/wipe');
const validators = require('../../../helpers/json-api-validators');
const applyMigrations = require('../../../helpers/apply-migrations');
const seed = require('../../../helpers/seed');

const db = getDb();

describe('Resource GET (many) many-to-one (host)', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(done => {
    wipeDatabase(db).then(() => done());
  });

  describe('when the request succeeds', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'many-to-one'),
        apiVersion: 5
      };

      const personSeeds = [
        {first_name: 'sandwiches'},
        {first_name: 'what'},
        {first_name: 'pls'}
      ];

      const catSeeds = [
        {name: 'james', owner_id: '1'},
        {name: 'pragya', owner_id: '3'},
        {name: 'tim', owner_id: null},
      ];

      applyMigrations(this.options)
        .then(() => seed('person', personSeeds))
        .then(() => seed('cat', catSeeds))
        .then(() => done());
    });

    it('should return a 200 OK, with the resource and links', (done) => {
      const expectedData = [
        {
          type: 'cats',
          id: '1',
          attributes: {
            name: 'james',
          },
          relationships: {
            owner: {
              data: {
                id: '1',
                type: 'people'
              },
              links: {
                self: '/v5/cats/1/relationships/owner',
                related: '/v5/cats/1/owner'
              }
            }
          }
        },
        {
          type: 'cats',
          id: '2',
          attributes: {
            name: 'pragya',
          },
          relationships: {
            owner: {
              data: {
                id: '3',
                type: 'people'
              },
              links: {
                self: '/v5/cats/2/relationships/owner',
                related: '/v5/cats/2/owner'
              }
            }
          }
        },
        {
          type: 'cats',
          id: '3',
          attributes: {
            name: 'tim',
          },
          relationships: {
            owner: {
              links: {
                self: '/v5/cats/3/relationships/owner'
              }
            }
          }
        }
      ];

      const expectedMeta = {
        page_number: 1,
        page_size: 10,
        total_count: 3
      };

      const expectedLinks = {
        self: '/v5/cats?page[size]=10&sandwiches=tasty',
        first: '/v5/cats?page[size]=10&page[number]=1&sandwiches=tasty',
        last: '/v5/cats?page[size]=10&page[number]=1&sandwiches=tasty',
        prev: null,
        next: null
      };

      request(app(this.options))
        .get('/v5/cats')
        .query('page[size]=10&sandwiches=tasty')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertMeta(expectedMeta))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });
});
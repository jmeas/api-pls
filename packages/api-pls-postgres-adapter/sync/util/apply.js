'use strict';

// `migrations`: A list of migrations
// `options`: An object of the api-pls options
// Returns a Promise that resolves if the migrations are successfully applied,
// and that errors if they fail to be applied.
module.exports = function(db, migrations) {
  const query = db.$config.pgp.helpers.concat(migrations);
  return db.query(query);
};

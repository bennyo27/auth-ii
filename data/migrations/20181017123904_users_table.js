exports.up = function(knex, Promise) {
  return knex.schema.createTable("users", tbl => {
    // id
    tbl.increments();
    tbl.string("username").notNullable();
    tbl.string("password").notNullable();
    tbl.string("department");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("users");
};

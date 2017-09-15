export const up = knex => knex.schema
  .createTable('hotels', (table) => {
    table.comment('酒店基本信息表');
    table.increments().comment('自动编号');
    table.string('name', 50).notNullable().defaultTo('').comment('酒店名称');
    table.timestamp('createdAt').defaultTo(knex.fn.now()).comment('新增时间');
    table.timestamp('updatedAt').notNullable().defaultTo('1971-01-01 00:00:00').comment('修改时间');
  })
  .createTable('rooms', (table) => {
    table.comment('酒店房间表');
    table.increments().comment('自动编号');
    table.integer('hotelId').notNullable().defaultTo(0).comment('酒店编号');
    table.string('name', 50).notNullable().defaultTo('').comment('酒店房间名称');
    table.timestamp('createdAt').defaultTo(knex.fn.now()).comment('新增时间');
    table.timestamp('updatedAt').notNullable().defaultTo('1971-01-01 00:00:00').comment('修改时间');
  })
;

export const down = knex => knex.schema
  .dropTableIfExists('hotels')
  .dropTableIfExists('rooms')
;

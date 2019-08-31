const mysql = require("mysql");
const pool = mysql.createPool({
    host: '123.207.227.206',
    user: 'user',
    password: '123456',
    database: 'travel',
    port: 3306,
    acquireTimeout: 30000
});

const query = function (sql, options, callback) {
    return new Promise((resolve, reject) => {
        pool.getConnection(async function (err, conn) {
            if (err) {
                await callback(err, null, null);
                reject();
            } else {
                conn.query(sql, options, async function (err, results, fields) {
                    //释放连接  
                    conn.release();
                    //事件驱动回调  
                    await callback(err, results, fields);
                    resolve();
                });
            }
        });
    })
};

module.exports = query;
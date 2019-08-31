const Koa = require('koa')
const static = require('koa-static')
const staticCache = require("koa-static-cache");
const compress = require('koa-compress')
const Router = require('koa-router')
const cors = require('koa2-cors')
const bodyParser = require('koa-bodyparser')
const fs = require('fs')
const path = require('path')
const query = require('./mysql_pool')
const app = new Koa()

const router = new Router()

const urlParser = async (ctx, next) => {
    var url = ctx.request.url
    var param = url.split('?')[1]
    if (param) {
        var params = param.split('&')
        var urlParam = {}
        params.forEach(item => {;
            [key, val] = item.split('=')
            urlParam[key] = decodeURIComponent(val)
        })
        ctx.state.urlParam = urlParam
    }
    await next()
}


router.use(bodyParser());
router.use(urlParser);


// 登录
router.get('/login', async ctx => {
    await query('select * from user', {}, function (err, results, fields) {
        if (err) {
            console.log(err)
            return
        }
        // console.log(results);
        ctx.response.type = 'json'
        ctx.response.status = 200
        ctx.body = {
            code: 1 //代表失败
        }
        const param = ctx.state.urlParam
        results.every(obj => {
            if (obj.uname == param.user && obj.ucode == param.password) {
                ctx.body = {
                    code: 0, // 0代表成功
                    userName: obj.uname,
                    userId: obj.uid
                }
                return false
            }
            return true
        })
    })
})

// 注册
router.post('/signup', async ctx => {
    const param = ctx.request.body
    console.log(param)
    // 先获取max_id
    await query('select max(uid) as maxId from user', {}, async function (err, results, fields) {
        ctx.response.type = 'json'
        ctx.response.status = 200
        if (err) {
            console.log(err)
            ctx.body = {
                code: 2
            }
            return
        }
        const uid = parseInt(results[0].maxId) + 1
        await query(
            `insert into user (uid, uname, ucode) values ('${uid}', '${param.userName}', '${
                param.password
            }')`, {},
            function (err, results, fields) {

                if (err) {
                    console.log(err)
                    ctx.body = {
                        code: 1 //代表失败
                    }
                    return
                }
                ctx.body = {
                    code: 0
                }
            }
        )
    })
})

// 获取路线
router.get('/route', async ctx => {
    await query('select * from route', {}, function (err, results, fields) {
        ctx.response.type = 'json'
        ctx.response.status = 200
        if (err) {
            console.log(err)
            ctx.body = {
                code: 1 //代表失败
            }
            return
        }
        // console.log(results);

        ctx.body = {
            code: 0,
            routes: results
        }
    })
})

// 获取线路详情
router.get('/route/detail', async ctx => {
    const param = ctx.state.urlParam
    await query(
        `select r.origin, r.destination, r.duration, r.attractions, r.price, r.rid, t.sdate, t.pnum from route as r, team as t, route_team as rt where r.rid = '${
            param.rid
        }' and r.rid = rt.rid and rt.tid = t.tid and t.pnum < 16`, {},
        async function (err, results, fields) {
            ctx.response.type = 'json'
            ctx.response.status = 200
            if (err) {
                console.log(err)
                ctx.body = {
                    code: 1 //代表失败
                }
                return
            }
            // console.log(results);

            ctx.body = {
                code: 0,
                route: results
            }

            // 获取酒店信息
            await query(
                `select h.hname from hotel as h, route_hotel as rh, route as r where rh.rid = r.rid and h.hid = rh.hid and r.rid = '${
                    param.rid
                }'`, {},
                function (err, results, fields) {
                    if (err) {
                        console.log(err)
                        ctx.body = {
                            code: 1 //代表失败
                        }
                        return
                    }

                    ctx.body.hotel = results
                }
            )
        }
    )
})

// 搜索路线
router.get('/route/search', async ctx => {
    const param = ctx.state.urlParam
    await query(
        `select * from route where origin='${
            param.depature
        }' and destination='${param.destination}'`, {},
        function (err, results, fields) {
            ctx.response.type = 'json'
            ctx.response.status = 200
            if (err) {
                console.log(err)
                ctx.body = {
                    code: 1 //代表失败
                }
                return
            }
            // console.log(results);

            ctx.body = {
                code: 0,
                routes: results
            }
        }
    )
})

// 游客号搜索订单
router.get('/visitor', async ctx => {
    const param = ctx.state.urlParam
    console.log(param)
    // 获取人数
    await query(
        `select oid, count(*) as count from orders_visitor group by oid having oid in (select oid from orders_visitor where vid='${
            param.vid
        }')`, {},
        function (err, results, fields) {
            ctx.response.type = 'json'
            ctx.response.status = 200
            if (err) {
                console.log(err)
                ctx.body = {
                    code: 1 //代表失败
                }
                return
            }
            console.log(results)
            console.log(fields)
            ctx.body = {
                code: 0,
                order: results
            }
        }
    )
    // 获取旅行信息
    await query(
        `select r.destination, r.price, r.rid from route as r, route_team as rt, visitor_team as vt where r.rid = rt.rid and rt.tid = vt.tid and vt.vid = '${
            param.vid
        }';
    `, {},
        function (err, results, fields) {
            if (err) {
                console.log(err)
                ctx.body = {
                    code: 1
                }
                return
            }
            console.log(results)
            ctx.body.route = results
        }
    )
})

// 新建游客并拼团
router.post('/visitor', async ctx => {
    const param = ctx.request.body
    console.log(param)
    // 先获取visitor的Max_vid
    await query('select max(vid) as maxId from visitor', {}, async function (
        err,
        results,
        fields
    ) {
        ctx.response.type = 'json'
        ctx.response.status = 200
        if (err) {
            console.log(err)
            ctx.body = {
                code: 1 //代表失败
            }
            return
        }
        const vid = parseInt(results[0].maxId) + 1
        // 获取加入的团号
        await query(
            `select t.tid from team as t, route_team as rt, route as r where r.rid = '${
                param.rid
            }' and r.rid = rt.rid and rt.tid = t.tid and t.sdate = '${
                param.sdate
            }'`, {},
            async function (err, results, fields) {
                if (err) {
                    console.log(err)
                    ctx.body = {
                        code: 2 //代表失败
                    }
                    return
                }
                const tid = results[0].tid
                // 异步新建旅客visitor
                query(
                    `insert into visitor values ('${vid}', '${param.vname}', '${
                        param.vsex
                    }', '${param.vage}', '${param.id}', '${param.vphone}')`, {},
                    function (err) {
                        if (err) console.log(err)
                    }
                )

                // 异步插入visitor_team
                query(
                    `insert into visitor_team values ('${vid}', '${tid}')`, {},
                    function (err) {
                        if (err) {
                            console.log(err)
                            return;
                        }
                        // 异步让team pun加一
                        query(`update team set pnum = pnum + 1 where tid = '${tid}'`, {}, function (err) {
                            if (err) console.log(err)
                        })
                    }
                )

                // 异步新建订单orders
                query('select max(oid) as maxId from orders', {}, function (
                    err,
                    results
                ) {
                    if (err) {
                        console.log(err)
                        return
                    }
                    const oid = parseInt(results[0].maxId) + 1
                    // 异步新建订单orders
                    query(
                        `insert into orders values ('${oid}', '${
                            param.price
                        }')`, {},
                        function (err) {
                            if (err) console.log(err)
                        }
                    )

                    // 异步插入orders_visitor
                    query(
                        `insert into orders_visitor values ('${oid}', '${vid}')`, {},
                        function (err) {
                            if (err) console.log(err)
                        }
                    )

                    // 异步插入user_orders
                    query(
                        `insert into user_orders values ('${
                            param.uid
                        }', '${oid}')`, {},
                        function (err) {
                            if (err) console.log(err)
                        }
                    )
                })

                // 同步查询一下该team的导游、航班信息
                await query(
                    `select t.tid, a.date, a.duration, a.price, a.aid, g.gname, g.gphone, g.gsex, g.level from airplane as a, guide as g, team as t, guide_team as gt, team_airplane as ta where a.aid = ta.aid and ta.tid = t.tid and gt.gid = g.gid and gt.tid = t.tid and t.tid = '${tid}' and a.date = '${
                        param.sdate
                    }'`, {},
                    function (err, results, fields) {
                        if (err) {
                            console.log(err)
                            ctx.body = {
                                code: 3 //代表失败
                            }
                            return
                        }

                        ctx.body = {
                            code: 0,
                            team: results
                        }
                    }
                )
            }
        )
    })
})

// 用户号搜索订单
router.get('/order/uname', async ctx => {
    const param = ctx.state.urlParam
    await query(
        `select distinct r.destination, r.price, r.rid, uo.oid from route as r, route_team as rt, visitor_team as vt, orders_visitor as ov, user_orders as uo where r.rid = rt.rid and rt.tid = vt.tid and vt.vid = ov.vid and ov.oid = uo.oid and uo.uid = '${
            param.uid
        }'`, {},
        async function (err, results, fields) {
            if (err) {
                console.log(err)
                ctx.body = {
                    code: 1
                }
                return
            }
            console.log(results)
            ctx.body = {
                code: 0,
                route: results
            }
            await query(
                `select oid, count(*) as count from orders_visitor group by oid having oid in (select oid from user_orders where uid = '${
                    param.uid
                }')`, {},
                function (err, results, fields) {
                    if (err) {
                        console.log(err)
                        ctx.body = {
                            code: 1
                        }
                        return
                    }
                    console.log(results)
                    ctx.body.route.forEach((item, index) => {
                        for (let i = results.length - 1; i >= 0; --i) {
                            if (item.oid == results[i].oid) {
                                ctx.body.route[index].pnum = results[i].count
                                results.splice(i, 1)
                                break
                            }
                        }
                    })
                }
            )
        }
    )
})

app.use(cors())
app.use(router.routes())
app.use(router.allowedMethods())

app.use(compress({
    threshold: 2048
}))
app.use(staticCache(path.join(__dirname, '../dist'), {
    maxAge: 365 * 24 * 60 * 60
}))
app.use(static(path.join(__dirname, '../dist')))

app.listen(3000)
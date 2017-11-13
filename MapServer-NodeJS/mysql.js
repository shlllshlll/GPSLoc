/*
 * @Author: SHLLL
 * @Date:   2017-11-12 21:13:24
 * @Last Modified by:   SHLLL
 * @Last Modified time: 2017-11-12 23:20:35
 */
// 获取mysql模块
var mysql = require('mysql');

// 为String对象添加格式化功能
String.prototype.format = function() {
    var result = this.split("").join(""),
        reg = /\{\d*\}/g,
        res = reg.exec(result);
    if (res) {
        for (var i = 0; i < arguments.length; i++) {
            var n = i;
            result = result.replace(eval('/\\{' + i + '\\}/g'), arguments[i]);
            // result = result.replace(new RegExp('/\\{' + i + '\\}/g'), arguments[i]);
        }
    }

    //replace()中的正则加变量必须转换，否则使用new RegExp()创建； /\{' + i + '\}/g只能解析为｛0｝，而不是字符串'{0}';
    return result;
};

// 按指定参数创建了一个MySQL数据连接
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'shihaolei',
    database: 'mapcache'
});

// 连接数据库
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

/**
 * 读取数据库中瓦片地图数据函数
 * @param  {array} reqArray 传递参数的数组
 * @param  {[type]} response 相应头对象
 * @param  {[type]} request  请求头对象
 * @return {undefined}          未定义
 */
function getTileImg(reqArray, request, response) {
    var type = reqArray[1];
    var zoom = reqArray[2];
    var x = reqArray[3];
    var y = reqArray[4];
    var sql = 'select Tile from gmapnetcache where Type={0} and Zoom={1} and X={2} and Y={3}'.format(type, zoom, x, y);

    connection.query(sql, function (error, results, fields) {
        if (error || !results || !results[0]) {
            response.statusCode = 500;
            response.setHeader("Content-Type", "text/plain");
            response.write(error + "\n");
            response.end();
            return;
        }
        response.statusCode = 200;
        response.setHeader('Content-Type', 'image/png');
        response.write(results[0].Tile, "binary");
        response.end();
    });
}

// 将接口暴露出去
exports.getTileImg = getTileImg;

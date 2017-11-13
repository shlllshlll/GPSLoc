/*
 * @Author: SHLLL
 * @Date:   2017-11-11 20:36:21
 * @Last Modified by:   SHLLL
 * @Last Modified time: 2017-11-12 23:20:23
 */

var http = require("http");
var url = require("url");

var hostname = '127.0.0.1';
var port = 3001;

/**
 * 服务器启动函数
 * @param  {function} route  路由处理函数
 * @param  {function} handle 数据库处理函数
 * @return {undefined}        未定义返回值
 */
function start(route, handle) {
    var server = http.createServer(function(request, response) {
        var postData = '';
        var pathname = url.parse(request.url).pathname;
        // 判断是否在请求网页图标
        if (pathname != 'favicon.ico') {
            // console.log("Request for " + pathname + " received.");

            route(handle, pathname, request, response);
        }
    });

    server.listen(port, hostname, function(){
    	 console.log('Server running at http://' + hostname + ':' + port);
    });
}

exports.start = start;

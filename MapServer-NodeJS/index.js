/*
* @Author: SHLLL
* @Date:   2017-11-11 21:50:42
* @Last Modified by:   SHLLL
* @Last Modified time: 2017-11-12 21:43:01
*/

var server = require('./server');
var router = require('./router');
var mysql = require('./mysql');

server.start(router.route, mysql.getTileImg);

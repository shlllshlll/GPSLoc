/*
* @Author: SHLLL
* @Date:   2017-11-12 21:34:31
* @Last Modified by:   SHLLL
* @Last Modified time: 2017-11-12 23:20:27
*/

function route(handle, pathname, request, response) {
	// console.log("About to toute a request for " + pathname);

	// 将请求的URL按/分割成数组
	var reqArry = pathname.split('/');

	handle(reqArry, request, response);
}

exports.route = route;

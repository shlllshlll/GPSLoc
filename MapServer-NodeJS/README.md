# GPS轨迹重现离线地图服务器端

这是一个NodeJS的离线地图服务器端程序
## 运行要求
本程序依赖与Node.js以及Node.js的MySQL模块，并要求安装MySQL服务端。同时使用时需要自行修改程序中数据库连接参数配置。

## 使用说明
首先请到[Release](https://github.com/shlllshlll/GPSLoc/releases)页面下载相应的文件，或者可以直接打包下载Github master分支。然后在命令行中切换到当前目录下运行“node index.js”即可。
*注意*需要首先使用[MapDownloader](http://www.cnblogs.com/luxiaoxun/p/4454880.html)将瓦片地图数据下载到MySQL数据库中！

## TODO
- 增加未找到地图瓦片时返回error.jpg的功能
- 优化服务器的响应时间

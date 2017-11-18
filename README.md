# GPS轨迹重现项目

>关于我，欢迎关注  
>项目文档： [Gitbook](https://shlllshlll.gitbooks.io/gpsloc_doc/)  [GithubPages](https://shlllshlll.github.io/GPSLoc_Doc)
>我的博客： [SHLLL的小站](http://shlll.me)  
>我的博客： [SHLLL's blog](https://shlllshlll.github.io/)


本项目是电子信息系统综合设计中运动参数提取与轨迹重现实验的实现。这个项目包括以下几个子项目：
1. 基于LeafletJS的GPS轨迹重现的WEB前端  
2. 基于Qt WebEngine的桌面端程序  
3. 基于NodeJS和MySQL数据库的地图离线服务器  

## Web-LeafletJS
![项目效果展示](https://i.loli.net/2017/11/13/5a09648b66c54.gif "GPS轨迹重现效果")
使用LeafletJS为基础，并全面扩展了LeafletJS的功能，实现了读取GPS数据并重现轨迹的功能。
阅读项目[README.md](https://github.com/shlllshlll/GPSLoc/tree/master/Web-LeafletJS/README.md)以获取更多信息

[在线演示地址1](http://shlll.me/amap/)

[在线演示地址2](https://shlllshlll.github.io/GPSLoc)

## Browser-Qt
![项目效果展示](https://i.loli.net/2017/11/13/5a0967937a0a4.gif "GPS轨迹重现效果")
基于Qt5的QWebEngineWidget实现了一个Windows客户端，从而使得不需要浏览器环境即可运行轨迹重现项目。
阅读项目[README.md](https://github.com/shlllshlll/GPSLoc/tree/master/Browser-Qt/README.md)以获取更多信息

## MapServer-NodeJS
基于Node.JS实现的离线地图服务端，读取存储至MySQL中的离线瓦片地图数据，并家庭本地端口实现本地服务器。
阅读项目[README.md](https://github.com/shlllshlll/GPSLoc/tree/master/MapServer-NodeJS/README.md)以获取更多信息

## 下载安装
到[Release](https://github.com/shlllshlll/GPSLoc/releases)页面下载并使用。

## TODO
- 各子项目的开发计划见子项目README.md
- 基于Hybrid技术开发Android地图客户端
- 开发基于Python以及PHP的离线地图客户端



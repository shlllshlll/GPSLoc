/*
 * @Author: SHLLL
 * @Date:   2017-10-30 16:31:50
 * @Last Modified by:   SHLLL
 * @Last Modified time: 2017-12-04 00:08:04
 */

// 新建地图图层
// 谷歌地图支持的缩放范围为0~21
var googleNormalMap = L.tileLayer.olineTileLayer('Google.Normal.Map', {
    maxZoom: 16,
    minZoom: 3
});
var googleSatelliteMap = L.tileLayer.olineTileLayer('Google.Satellite.Map', {
    maxZoom: 18,
    minZoom: 3
});
var googleHybridMap = L.tileLayer.olineTileLayer('Google.Hybrid.Map', {
    maxZoom: 16,
    minZoom: 3
});
// 创建离线地图图层
var amapSatelliteOfflineMap = L.tileLayer('http://127.0.0.1:3001/47626774/{z}/{x}/{y}', {
    maxZoom: 16,
    minZoom: 3
});

var baseLayers = {
    "谷歌地图": googleNormalMap,
    "谷歌卫星": googleSatelliteMap,
    "谷歌混合": googleHybridMap,
    "谷歌离线": amapSatelliteOfflineMap
};

// 新建一个地图实例
var map = L.map("mapid", {
    crs: L.CRS.GCJ02,
    center: [30.657589, 104.065708], // 天府广场GCJ-02坐标
    zoom: 16,
    layers: [googleSatelliteMap],
    attributionControl: false,
    zoomControl: false,
    preferCanvas: true,
    zoomAnimation: false
    // renderer: L.canvas()
});

// 添加图层选择控件到地图
L.control.layers(baseLayers, null).addTo(map);
// 添加缩放控件到地图
L.control.zoom({
    zoomInTitle: '放大',
    zoomOutTitle: '缩小'
}).addTo(map);
// 添加GPS输入文件到地图
L.control.fileinput().addTo(map);

// function mapPan(){
//     map.panBy([20, 20], {animate: false});
//     // var startPos = L.DomUtil.getPosition(map._mapPane);
//     // var offset = L.point([20, 20]).round();
// }
// window.setInterval(mapPan, 1000);

// 开启自动定位
// map.locate({
//     setView: true,
//     maxZoom: 16,
// });
// 监听定位完成事件
// map.on('locationfound', function(pos){
//     L.marker(pos).addTo(map);
// });

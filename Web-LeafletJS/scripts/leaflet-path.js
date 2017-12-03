/*
 * @Author: SHLLL
 * @Date:   2017-11-04 20:38:20
 * @Last Modified by:   SHLLL
 * @Last Modified time: 2017-12-03 23:18:59
 */

// 这个地方定义了一个立即执行的匿名函数function(){}()
// 采用UMD魔法代码的形式同时支持CommonJS、AMD和一般的全局定义法
(function(global, factory) {
    // 真正执行的函数语句为(factory((global.L = {})))
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
        (factory((global.L)));
}(this, (function(exports) {
    // 从全局环境中获取L命名空间
    var L = exports;

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

    // 取消默认的右键菜单
    document.oncontextmenu = function() {　　
        return false;
    };

    // 定义Bounds对象clone方法创建一个当前bounds的克隆对象
    L.Bounds.prototype.clone = function() {
        return new L.Bounds(this.min, this.max);
    };

    // 直接覆盖掉Map中原_handleGeolocationResponse方法定义
    L.Map.include({
        _handleGeolocationResponse: function(pos) {
            var lat = pos.coords.latitude,
                lng = pos.coords.longitude,
                latlng = new L.LatLng(lat, lng),
                bounds = latlng.toBounds(pos.coords.accuracy),
                options = this._locateOptions;

            if (this.options.crs.code === 'GCJ:02') {
                latlng = LnglatConvert.wgs84togcj02(latlng);
            }

            if (options.setView) {
                var zoom = this.getBoundsZoom(bounds);
                this.setView(latlng, options.maxZoom ? Math.min(zoom, options.maxZoom) : zoom);
            }

            var data = {
                latlng: latlng,
                bounds: bounds,
                timestamp: pos.timestamp
            };

            // for (var i in pos.coords) {
            //     if (typeof pos.coords[i] === 'number') {
            //         data[i] = pos.coords[i];
            //     }
            // }

            // @event locationfound: LocationEvent
            // Fired when geolocation (using the [`locate`](#map-locate) method)
            // went successfully.
            this.fire('locationfound', latlng);
        }
    });

    // 定义了一个经纬度坐标转换对象
    // 下面是天安门的参考坐标
    // GCJ02 [39.908692, 116.397477]
    // BD09 [39.915119, 116.403963]
    // WGS [39.9072885060602,116.39123343289631]
    var LnglatConvert = {
        _x_PI: Math.PI * 3000.0 / 180.0,
        _a: 6378245.0,
        _ee: 0.00669342162296594323,
        bd09togcj02: function(latlng) {
            latlng = L.latLng(latlng);
            var bd_lon = latlng.lng;
            var bd_lat = latlng.lat;
            var x = bd_lon - 0.0065;
            var y = bd_lat - 0.006;
            var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * _x_PI);
            var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * _x_PI);
            latlng.lng = z * Math.cos(theta);
            latlng.lat = z * Math.sin(theta);
            return latlng;
        },
        gcj02tobd09: function(latlng) {
            latlng = L.latLng(latlng);
            var lat = latlng.lat;
            var lng = latlng.lng;
            var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * _x_PI);
            var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * _x_PI);
            latlng.lng = z * Math.cos(theta) + 0.0065;
            latlng.lat = z * Math.sin(theta) + 0.006;
            return latlng;
        },
        wgs84togcj02: function(latlng) {
            latlng = L.latLng(latlng);
            var lat = latlng.lat;
            var lng = latlng.lng;
            if (this._out_of_china(lng, lat)) {
                return latlng;
            } else {
                var dlat = this._transformlat(lng - 105.0, lat - 35.0);
                var dlng = this._transformlng(lng - 105.0, lat - 35.0);
                var radlat = lat / 180.0 * Math.PI;
                var magic = Math.sin(radlat);
                magic = 1 - this._ee * magic * magic;
                var sqrtmagic = Math.sqrt(magic);
                dlat = (dlat * 180.0) / ((this._a * (1 - this._ee)) / (magic * sqrtmagic) * Math.PI);
                dlng = (dlng * 180.0) / (this._a / sqrtmagic * Math.cos(radlat) * Math.PI);
                latlng.lat = lat + dlat;
                latlng.lng = lng + dlng;
                return latlng;
            }
        },
        gcj02towgs84: function(latlng) {
            latlng = L.latLng(latlng);
            var lat = latlng.lat;
            var lng = latlng.lng;
            if (this._out_of_china(lng, lat)) {
                return latlng; // 如果超出中国的范围则不做变换
            } else {
                var dlat = this._transformlat(lng - 105.0, lat - 35.0);
                var dlng = this._transformlng(lng - 105.0, lat - 35.0);
                var radlat = lat / 180.0 * Math.PI;
                var magic = Math.sin(radlat);
                magic = 1 - this._ee * magic * magic;
                var sqrtmagic = Math.sqrt(magic);
                dlat = (dlat * 180.0) / ((this._a * (1 - this._ee)) / (magic * sqrtmagic) * Math.PI);
                dlng = (dlng * 180.0) / (this._a / sqrtmagic * Math.cos(radlat) * Math.PI);
                var mglat = lat + dlat;
                var mglng = lng + dlng;
                latlng.lat = lat * 2 - mglat;
                latlng.lng = lng * 2 - mglng;
                return latlng;
            }
        },
        _out_of_china: function(lng, lat) {
            // 纬度3.86~53.55,经度73.66~135.05
            return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
        },
        _transformlat: function(lng, lat) {
            var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
            ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
            ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
            return ret;
        },
        _transformlng: function(lng, lat) {
            var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
            ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
            ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
            return ret;
        }
    };
    // 定义GCJ02 CRS系统即外挂一个坐标转换
    var GCJ02 = L.Util.extend({}, L.CRS.EPSG3857, {
        code: 'GCJ:02'
    });

    // 定义了一个在线瓦片地图数据集
    var OlineTileLayer = L.TileLayer.extend({

        initialize: function(type, options) { // (type, Object)
            var parts = type.split('.');
            var providerName = parts[0];
            var mapName = parts[1];
            var mapType = parts[2];

            var url = this.providers[providerName][mapName][mapType];
            if (this.providers[providerName].subdomains) {
                options.subdomains = this.providers[providerName].subdomains;
            }

            L.TileLayer.prototype.initialize.call(this, url, options);
        },

        providers: {
            TianDiTu: {
                Normal: {
                    Map: "http://t{s}.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}",
                    Annotion: "http://t{s}.tianditu.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}",
                },
                Satellite: {
                    Map: "http://t{s}.tianditu.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}",
                    Annotion: "http://t{s}.tianditu.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}",
                },
                Terrain: {
                    Map: "http://t{s}.tianditu.cn/DataServer?T=ter_w&X={x}&Y={y}&L={z}",
                    Annotion: "http://t{s}.tianditu.cn/DataServer?T=cta_w&X={x}&Y={y}&L={z}",
                },
                subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
            },

            GaoDe: {
                Normal: {
                    Map: 'http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
                },
                Satellite: {
                    Map: 'http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
                    Annotion: 'http://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}'
                },
                subdomains: ['1', '2', '3', '4']
            },

            Google: {
                Normal: {
                    Map: "http://mt{s}.google.cn/vt/lyrs=m&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}"
                },
                Satellite: {
                    Map: "http://mt{s}.google.cn/vt/lyrs=s&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}"
                },
                Hybrid: {
                    Map: "http://mt{s}.google.cn/vt/lyrs=y&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}"
                },
                subdomains: ["0", "1", "2", "3"],
            },

            Geoq: {
                Normal: {
                    Map: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}",
                    Color: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetColor/MapServer/tile/{z}/{y}/{x}",
                    PurplishBlue: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
                    Gray: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}",
                    Warm: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}",
                    Cold: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetCold/MapServer/tile/{z}/{y}/{x}"
                },
            }
        }
    });

    var olineTileLayer = function(type, options) {
        return new OlineTileLayer(type, options);
    };

    // 创建一个MultiPolyline专用绘图器
    var MultiCanvas = L.Renderer.extend({
        getEvents: function() {
            var events = L.Renderer.prototype.getEvents.call(this);
            events.viewprereset = this._onViewPreReset;
            return events;
        },

        initialize: function(options) {
            L.Renderer.prototype.initialize.call(this, options);
            this._polylineDrawing = false;
        },

        _onViewPreReset: function() {
            // Set a flag so that a viewprereset+moveend+viewreset only updates&redraws once
            this._postponeUpdatePaths = true;
        },

        onAdd: function() {
            L.Renderer.prototype.onAdd.call(this);

            // Redraw vectors since canvas is cleared upon removal,
            // in case of removing the renderer itself from the map.
            this._dataQueue = [];
            this.on('run', this._runDrawing, this);
            this.on('pause', this._pauseDrawing, this);
            this._draw();
        },

        _runDrawing: function() {
            this._polylineDrawing = true;
            this._updatePaths();
        },

        _pauseDrawing: function() {
            cancelAnimationFrame(this._requestID);
        },

        _initContainer: function() {
            // 由Renderer类里的onAdd函数调用
            var container = this._container = document.createElement('canvas');
            // 暂时不需要做事件交互
            // L.DomEvent.on(container, 'mousemove', L.Util.throttle(this._onMouseMove, 32, this), this);
            // L.DomEvent.on(container, 'click dblclick mousedown mouseup contextmenu', this._onClick, this);
            // L.DomEvent.on(container, 'mouseout', this._handleMouseOut, this);
            // 获取CanvasRenderingContext2D绘图上下文
            this._ctx = container.getContext('2d');
        },

        _destroyContainer: function() {
            delete this._ctx;
            remove(this._container);
            off(this._container);
            delete this._container;
        },

        _updatePaths: function() {
            if (this._postponeUpdatePaths) { return; }

            var layer;
            this._redrawBounds = null;
            for (var id in this._layers) {
                layer = this._layers[id];
                layer._update();
            }
            this._redraw();
        },

        _update: function() {
            if (this._map._animatingZoom && this._bounds) { return; }

            // this._drawnLayers = {};

            L.Renderer.prototype._update.call(this);

            var b = this._bounds,
                container = this._container,
                size = b.getSize(),
                m = L.Browser.retina ? 2 : 1;

            L.DomUtil.setPosition(container, b.min);

            // set canvas size (also clearing it); use double size on retina
            container.width = m * size.x;
            container.height = m * size.y;
            container.style.width = size.x + 'px';
            container.style.height = size.y + 'px';

            if (L.Browser.retina) {
                this._ctx.scale(2, 2);
            }

            // translate so we use the same path coordinates after canvas element moves
            this._ctx.translate(-b.min.x, -b.min.y);

            // Tell paths to redraw themselves
            this.fire('update');
        },

        _reset: function() {
            // 调用fitbounds后会调用此函数，自此开始一次巡航
            // this._polylineDrawing = true;

            L.Renderer.prototype._reset.call(this);

            if (this._postponeUpdatePaths) {
                this._postponeUpdatePaths = false;
                this._updatePaths();
            }
        },

        _initPath: function(layer) {
            // layer指向polyline
            // this指向polyline._renderer
            //this._updateDashArray(layer);
            this._layers[L.Util.stamp(layer)] = layer;

            var order = layer._order = {
                layer: layer,
                prev: this._drawLast,
                next: null
            };
            if (this._drawLast) { this._drawLast.next = order; }
            this._drawLast = order;
            this._drawFirst = this._drawFirst || this._drawLast;
        },

        _addPath: function(layer) {
            this._requestRedraw(layer);
        },

        _removePath: function(layer) {
            var order = layer._order;
            var next = order.next;
            var prev = order.prev;

            if (next) {
                next.prev = prev;
            } else {
                this._drawLast = prev;
            }
            if (prev) {
                prev.next = next;
            } else {
                this._drawFirst = next;
            }

            delete layer._order;

            delete this._layers[L.stamp(layer)];

            this._requestRedraw(layer);
        },

        _updatePath: function(layer) {
            // Redraw the union of the layer's old pixel
            // bounds and the new pixel bounds.
            this._extendRedrawBounds(layer);
            layer._project();
            layer._update();
            // The redraw will extend the redraw bounds
            // with the new pixel bounds.
            this._requestRedraw(layer);
        },

        _updateStyle: function(layer) {
            //this._updateDashArray(layer);
            this._requestRedraw(layer);
        },
        // 用于画虚线的方法，这里不需要
        // _updateDashArray: function(layer) {
        //     if (layer.options.dashArray) {
        //         var parts = layer.options.dashArray.split(','),
        //             dashArray = [],
        //             i;
        //         for (i = 0; i < parts.length; i++) {
        //             dashArray.push(Number(parts[i]));
        //         }
        //         layer.options._dashArray = dashArray;
        //     }
        // },

        _requestRedraw: function(layer) {
            if (!this._map) { return; }

            this._extendRedrawBounds(layer);
            this._redrawRequest = this._redrawRequest || L.Util.requestAnimFrame(this._redraw, this);
        },

        _extendRedrawBounds: function(layer) {
            if (layer._pxBounds) {
                var padding = (layer.options.weight || 0) + 1;
                this._redrawBounds = this._redrawBounds || new L.Bounds();
                this._redrawBounds.extend(layer._pxBounds.min.subtract([padding, padding]));
                this._redrawBounds.extend(layer._pxBounds.max.add([padding, padding]));
            }
        },

        _redraw: function() {
            this._redrawRequest = null;

            if (this._redrawBounds) {
                this._redrawBounds.min._floor();
                this._redrawBounds.max._ceil();
            }

            this._clear(); // clear layers in redraw bounds
            this._draw(); // draw layers

            this._redrawBounds = null;
        },

        _clear: function() {
            var bounds = this._redrawBounds;
            if (bounds) {
                var size = bounds.getSize();
                this._ctx.clearRect(bounds.min.x, bounds.min.y, size.x, size.y);
            } else {
                this._ctx.clearRect(0, 0, this._container.width, this._container.height);
            }
        },

        _draw: function() {
            var layer, bounds = this._redrawBounds;
            this._ctx.save(); // 保存当前的状态
            if (bounds) {
                var size = bounds.getSize();
                this._ctx.beginPath(); // 开始绘图
                this._ctx.rect(bounds.min.x, bounds.min.y, size.x, size.y);
                this._ctx.clip(); // 将绘图区域限制在一个矩形内
            }

            this._drawing = true;

            for (var order = this._drawFirst; order; order = order.next) {
                layer = order.layer;
                if (!bounds || (layer._pxBounds && layer._pxBounds.intersects(bounds))) {
                    layer._updatePath();
                }
            }

            this._drawing = false;

            this._ctx.restore(); // Restore state before clipping.
        },

        _getAngle: function(px, py, mx, my) { //获得人物中心和鼠标坐标连线，与y轴正半轴之间的夹角
            var x = Math.abs(px - mx);
            var y = Math.abs(py - my);
            var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            var cos = y / z;
            var radina = Math.acos(cos); //用反三角函数求弧度
            var angle = Math.floor(180 / (Math.PI / radina)); //将弧度转换成角度

            if (mx > px && my > py) { //鼠标在第四象限
                angle = 180 - angle;
            }

            if (mx == px && my > py) { //鼠标在y轴负方向上
                angle = 180;
            }

            if (mx > px && my == py) { //鼠标在x轴正方向上
                angle = 90;
            }

            if (mx < px && my > py) { //鼠标在第三象限
                angle = 180 + angle;
            }

            if (mx < px && my == py) { //鼠标在x轴负方向
                angle = 270;
            }

            if (mx < px && my < py) { //鼠标在第二象限
                angle = 360 - angle;
            }

            return angle;
        },

        _dataFilter: function(data) {
            if (!isNaN(data)) {
                this._dataQueue.push(data);
            }
            if (this._dataQueue.length > 10) {
                this._dataQueue.shift();
            }

            var sum = 0;

            for (var i = 0; i < this._dataQueue.length; i++) {
                sum += this._dataQueue[i];
            }
            sum /= this._dataQueue.length;

            return sum;
        },

        // 画MutiPoly的核心方法
        _updateMultiPoly: function(layer) {
            if (!this._drawing) { return; }

            var i = 0,
                ctx = this._ctx;

            var drawAnimFramePoly = function() {
                var lp, p;
                // var options = layer.options;
                var groupNum = layer._curGroupNum;
                var parts = layer._groupArray[groupNum].parts;

                if (!layer._curGroupCount && !groupNum) {
                    layer._curGroupCount++;
                } else {
                    if (!layer._curGroupCount && groupNum) {
                        var lastParts = layer._groupArray[groupNum - 1].parts;
                        lp = lastParts[lastParts.length - 1];
                    } else {
                        lp = parts[layer._curGroupCount - 1];
                    }
                    this._curPointPos = [groupNum, layer._curGroupCount];
                    p = parts[layer._curGroupCount++];
                    this._curAngle = this._dataFilter(this._getAngle(lp.x, lp.y, p.x, p.y));
                    this._curColor = layer._groupArray[groupNum].color;
                    var offset = L.point([p.x - lp.x, p.y - lp.y]);

                    if (layer._curGroupCount >= parts.length) {
                        layer._curGroupCount = 0;
                        layer._curGroupNum++;
                        if (layer._curGroupNum >= layer._groupArray.length) {
                            this._isAnimationNextFrame = false;
                            this._curPointPos = undefined;
                        }
                    }
                    map.panBy(offset, { animate: false });
                }

                // 请求下一帧动画
                if (this._isAnimationNextFrame) {
                    this._requestID = requestAnimationFrame(drawAnimFramePoly.bind(this));
                } else {
                    cancelAnimationFrame(this._requestID);
                    this.fire('pathdrawingend');
                }
            };
            if (this._curPointPos) {
                var tp = layer._groupArray[this._curPointPos[0]].parts[this._curPointPos[1]];
                ctx.save();
                ctx.translate(tp.x, tp.y);
                ctx.rotate(this._curAngle * Math.PI / 180);
                ctx.translate(-12, -20);
                ctx.scale(0.3, 0.3);
                this._drawCruise(ctx, this._curColor);
                ctx.restore();
            }
            // 重新绘制已绘制的部分
            for (i = 0; i < layer._curGroupNum; i++) {
                this._updatePolyOneGroup(layer, ctx, i, -1);
            }
            if (layer._curGroupCount && (layer._curGroupNum < layer._groupArray.length)) {
                this._updatePolyOneGroup(layer, ctx, layer._curGroupNum, layer._curGroupCount);
            }


            // 如果开始巡航标志被置位
            if (this._polylineDrawing) {
                this._polylineDrawing = false;
                this.fire('pathdrawingbegin');
                this._isAnimationNextFrame = true;
                this._requestID = requestAnimationFrame(drawAnimFramePoly.bind(this));
            }
        },

        _updatePolyOneGroup: function(layer, ctx, groupNum, curCount) {
            var p;
            var options = layer.options;
            var parts = layer._groupArray[groupNum].parts;
            var len = (curCount == -1) ? parts.length : curCount;
            if (!len) {
                return;
            }
            ctx.beginPath();
            if (groupNum) {
                var lastParts = layer._groupArray[groupNum - 1].parts;
                p = lastParts[lastParts.length - 1];
                ctx.moveTo(p.x, p.y);
            }
            for (j = 0; j < len; j++) {
                p = parts[j];
                ctx[(groupNum || j) ? 'lineTo' : 'moveTo'](p.x, p.y);
            }

            if (options.stroke && options.weight !== 0) {
                ctx.globalAlpha = options.opacity;
                ctx.lineWidth = options.weight;
                ctx.strokeStyle = layer._groupArray[groupNum].color;
                ctx.lineCap = options.lineCap;
                ctx.lineJoin = options.lineJoin;
                ctx.stroke();
            }
        },

        _drawCruise: function(ctx, color) {
            ctx.save();
            ctx.strokeStyle = "rgba(0,0,0,0)";
            ctx.miterLimit = 4;
            ctx.font = "normal normal 400 normal 15px / 21.4286px ''";
            ctx.font = "   15px ";
            ctx.scale(0.4, 0.4);
            ctx.scale(0.1953125, 0.1953125);
            ctx.save();
            ctx.fillStyle = color;
            ctx.font = "   15px ";
            ctx.beginPath();
            ctx.moveTo(512.030699, 2.118244);
            ctx.bezierCurveTo(482.132762, 2.118244, 455.19115600000003, 19.501146000000002, 443.48658, 46.328142);
            ctx.lineTo(62.697971, 920.890644);
            ctx.bezierCurveTo(49.836035, 950.3823289999999, 58.353013000000004, 984.6262469999999, 83.615373, 1005.079068);
            ctx.bezierCurveTo(97.347119, 1016.20343, 114.26646400000001, 1021.881756, 131.243113, 1021.881756);
            ctx.bezierCurveTo(145.496745, 1021.881756, 159.86498699999999, 1017.883699, 172.381046, 1009.772974);
            ctx.lineTo(520.664334, 784.3815969999999);
            ctx.lineTo(850.174046, 1008.78753);
            ctx.bezierCurveTo(863.037005, 1017.535775, 877.9281569999999, 1021.881756, 892.818285, 1021.881756);
            ctx.bezierCurveTo(909.447011, 1021.881756, 926.075736, 1016.43572, 939.692872, 1005.65826);
            ctx.bezierCurveTo(965.477118, 985.262744, 974.283691, 950.672948, 961.304076, 920.8916670000001);
            ctx.lineTo(580.575842, 46.329165);
            ctx.bezierCurveTo(568.871265, 19.50217, 541.870308, 2.118244, 512.030699, 2.118244);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            ctx.restore();
        },

        // Canvas obviously doesn't have mouse events for individual drawn objects,
        // so we emulate that by calculating what's under the mouse on mousemove/click manually

        // _onClick: function(e) {
        //     var point = this._map.mouseEventToLayerPoint(e),
        //         layer, clickedLayer;

        //     for (var order = this._drawFirst; order; order = order.next) {
        //         layer = order.layer;
        //         if (layer.options.interactive && layer._containsPoint(point) && !this._map._draggableMoved(layer)) {
        //             clickedLayer = layer;
        //         }
        //     }
        //     if (clickedLayer) {
        //         L.DomEvent.fakeStop(e);
        //         this._fireEvent([clickedLayer], e);
        //     }
        // },

        // _onMouseMove: function(e) {
        //     if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) { return; }

        //     var point = this._map.mouseEventToLayerPoint(e);
        //     this._handleMouseHover(e, point);
        // },


        // _handleMouseOut: function(e) {
        //     var layer = this._hoveredLayer;
        //     if (layer) {
        //         // if we're leaving the layer, fire mouseout
        //         L.DomUtil.removeClass(this._container, 'leaflet-interactive');
        //         this._fireEvent([layer], e, 'mouseout');
        //         this._hoveredLayer = null;
        //     }
        // },

        // _handleMouseHover: function(e, point) {
        //     var layer, candidateHoveredLayer;

        //     for (var order = this._drawFirst; order; order = order.next) {
        //         layer = order.layer;
        //         if (layer.options.interactive && layer._containsPoint(point)) {
        //             candidateHoveredLayer = layer;
        //         }
        //     }

        //     if (candidateHoveredLayer !== this._hoveredLayer) {
        //         this._handleMouseOut(e);

        //         if (candidateHoveredLayer) {
        //             L.DomUtil.addClass(this._container, 'leaflet-interactive'); // change cursor
        //             this._fireEvent([candidateHoveredLayer], e, 'mouseover');
        //             this._hoveredLayer = candidateHoveredLayer;
        //         }
        //     }

        //     if (this._hoveredLayer) {
        //         this._fireEvent([this._hoveredLayer], e);
        //     }
        // },

        // _fireEvent: function(layers, e, type) {
        //     this._map._fireDOMEvent(e, type || e.type, layers);
        // },

        _bringToFront: function(layer) {
            var order = layer._order;
            var next = order.next;
            var prev = order.prev;

            if (next) {
                next.prev = prev;
            } else {
                // Already last
                return;
            }
            if (prev) {
                prev.next = next;
            } else if (next) {
                // Update first entry unless this is the
                // signle entry
                this._drawFirst = next;
            }

            order.prev = this._drawLast;
            this._drawLast.next = order;

            order.next = null;
            this._drawLast = order;

            this._requestRedraw(layer);
        },

        _bringToBack: function(layer) {
            var order = layer._order;
            var next = order.next;
            var prev = order.prev;

            if (prev) {
                prev.next = next;
            } else {
                // Already first
                return;
            }
            if (next) {
                next.prev = prev;
            } else if (prev) {
                // Update last entry unless this is the
                // signle entry
                this._drawLast = prev;
            }

            order.prev = null;

            order.next = this._drawFirst;
            this._drawFirst.prev = order;
            this._drawFirst = order;

            this._requestRedraw(layer);
        }
    });

    // @factory L.canvas(options?: Renderer options)
    // Creates a Canvas renderer with the given options.
    function multiCanvas(options) {
        return new MultiCanvas(options);
    }

    var MultiPolyline = L.Layer.extend({

        // @section
        // @aka Path options
        options: {
            // @option stroke: Boolean = true
            // Whether to draw stroke along the path. Set it to `false` to disable borders on polygons or circles.
            stroke: true,

            // @option color: String = '#3388ff'
            // Stroke color
            color: '#3388ff',

            // @option weight: Number = 3
            // Stroke width in pixels
            weight: 5,

            // @option opacity: Number = 1.0
            // Stroke opacity
            opacity: 1.0, // 定义透明度 1为完全不透明

            // @option lineCap: String= 'round'
            // A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
            lineCap: 'round', // 定义线的末端以圆角结束

            // @option lineJoin: String = 'round'
            // A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
            lineJoin: 'round', // 定义不同线的连接部分以圆角的形式呈现

            // @option dashArray: String = null
            // A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
            // dashArray: null,   // 画虚线属性暂时用不上

            // @option dashOffset: String = null
            // A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
            // dashOffset: null,  // 画虚线属性暂时用不上

            // className: '',

            // Option inherited from "Interactive layer" abstract class
            interactive: true,

            // @option bubblingMouseEvents: Boolean = true
            // When `true`, a mouse event on this path will trigger the same event on the map
            // (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
            bubblingMouseEvents: true,

            // @option smoothFactor: Number = 1.0
            // How much to simplify the polyline on each zoom level. More means
            // better performance and smoother look, and less means more accurate representation.
            smoothFactor: 1.0,

            // @option noClip: Boolean = false
            // Disable polyline clipping.
            noClip: true,

            // 设置绘图引擎为MultiCanvas
            renderer: multiCanvas(),

            // 设置是否适应缩放大小为整个路径
            // 默认选取一个较大的比例尺
            fitbounds: false
        },

        initialize: function(latlngs, speeds, options) {
            L.Util.setOptions(this, options);
            this._setLatLngs(latlngs, speeds);
        },

        beforeAdd: function(map) {
            // Renderer is set here because we need to call renderer.getEvents
            // before this.getEvents.
            this._renderer = map.getRenderer(this);
            this._renderer._redrawTime = this._groupSize * 10;
        },

        onAdd: function() {
            // this指向polyline
            this._renderer._initPath(this);
            this._reset();
            // this._renderer._addPath(this);
        },

        onRemove: function() {
            this._renderer._removePath(this);
        },

        // @method redraw(): this
        // Redraws the layer. Sometimes useful after you changed the coordinates that the path uses.
        redraw: function() {
            if (this._map) {
                this._renderer._updatePath(this);
            }
            return this;
        },

        // @method setStyle(style: Path options): this
        // Changes the appearance of a Path based on the options in the `Path options` object.
        setStyle: function(style) {
            setOptions(this, style);
            if (this._renderer) {
                this._renderer._updateStyle(this);
            }
            return this;
        },

        // @method bringToFront(): this
        // Brings the layer to the top of all path layers.
        bringToFront: function() {
            if (this._renderer) {
                this._renderer._bringToFront(this);
            }
            return this;
        },

        // @method bringToBack(): this
        // Brings the layer to the bottom of all path layers.
        bringToBack: function() {
            if (this._renderer) {
                this._renderer._bringToBack(this);
            }
            return this;
        },

        getElement: function() {
            return this._path;
        },

        // @method getLatLngs(): LatLng[]
        // Returns an array of the points in the path, or nested arrays of points in case of multi-polyline.
        // getLatLngs: function() {
        //     return this._latlngs;
        // },

        // @method setLatLngs(latlngs: LatLng[]): this
        // Replaces all the points in the polyline with the given array of geographical points.
        setLatLngs: function(latlngs, speeds) {
            this._setLatLngs(latlngs, speeds);
            return this.redraw();
        },

        beginCruise: function() {
            // 设置标志量开始巡航模式
            this._renderer._polylineDrawing = true;
            this._curGroupNum = 0;
            this._curGroupCount = 0;
            if (!this.options.fitbounds) {
                this._fitBeginZoom(this._map, this._bounds, this._latlngs[0]);
            } else {
                this._map.fitBounds(this._bounds);
            }
        },

        // @method isEmpty(): Boolean
        // Returns `true` if the Polyline has no LatLngs.
        // isEmpty: function() {
        //     return !this._latlngs.length;
        // },

        // closestLayerPoint: function(p) {
        //     var minDistance = Infinity,
        //         minPoint = null,
        //         closest = _sqClosestPointOnSegment,
        //         p1, p2;

        //     for (var j = 0, jLen = this._parts.length; j < jLen; j++) {
        //         var points = this._parts[j];

        //         for (var i = 1, len = points.length; i < len; i++) {
        //             p1 = points[i - 1];
        //             p2 = points[i];

        //             var sqDist = closest(p, p1, p2, true);

        //             if (sqDist < minDistance) {
        //                 minDistance = sqDist;
        //                 minPoint = closest(p, p1, p2);
        //             }
        //         }
        //     }
        //     if (minPoint) {
        //         minPoint.distance = Math.sqrt(minDistance);
        //     }
        //     return minPoint;
        // },

        // @method getCenter(): LatLng
        // Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the polyline.
        // getCenter: function() {
        //     // throws error when not yet added to map as this center calculation requires projected coordinates
        //     if (!this._map) {
        //         throw new Error('Must add layer to map before using getCenter()');
        //     }

        //     var i, halfDist, segDist, dist, p1, p2, ratio,
        //         points = this._rings[0],
        //         len = points.length;

        //     if (!len) { return null; }

        //     // polyline centroid algorithm; only uses the first ring if there are multiple

        //     for (i = 0, halfDist = 0; i < len - 1; i++) {
        //         halfDist += points[i].distanceTo(points[i + 1]) / 2;
        //     }

        //     // The line is so small in the current view that all points are on the same pixel.
        //     if (halfDist === 0) {
        //         return this._map.layerPointToLatLng(points[0]);
        //     }

        //     for (i = 0, dist = 0; i < len - 1; i++) {
        //         p1 = points[i];
        //         p2 = points[i + 1];
        //         segDist = p1.distanceTo(p2);
        //         dist += segDist;

        //         if (dist > halfDist) {
        //             ratio = (dist - halfDist) / segDist;
        //             return this._map.layerPointToLatLng([
        //                 p2.x - ratio * (p2.x - p1.x),
        //                 p2.y - ratio * (p2.y - p1.y)
        //             ]);
        //         }
        //     }
        // },

        // @method getBounds(): LatLngBounds
        // Returns the `LatLngBounds` of the path.
        getBounds: function() {
            return this._bounds;
        },

        // 将起点作为中心，比map._getBoundsCenterZoom()方法大一级zoom
        _fitBeginZoom: function(map, bounds, center) {
            var targetBounds = map._getBoundsCenterZoom(bounds);
            var targetZoom = targetBounds.zoom;
            var targetCenter = targetBounds.center;
            var maxZoom = map.getMaxZoom();
            if (maxZoom > targetZoom + 2) {
                targetZoom += 3;
            } else if (maxZoom > targetZoom + 1) {
                targetZoom += 2;
            } else if (maxZoom > targetZoom) {
                targetZoom += 1;
            }

            map.setView(center, targetZoom);
        },

        // @method addLatLng(latlng: LatLng, latlngs? LatLng[]): this
        // Adds a given point to the polyline. By default, adds to the first ring of
        // the polyline in case of a multi-polyline, but can be overridden by passing
        // a specific ring as a LatLng array (that you can earlier access with [`getLatLngs`](#polyline-getlatlngs)).
        // addLatLng: function(latlng, latlngs) {
        //     latlngs = latlngs || this._defaultShape();
        //     latlng = L.latLng(latlng);
        //     latlngs.push(latlng);
        //     this._bounds.extend(latlng);
        //     return this.redraw();
        // },

        _reset: function() {
            // defined in child classes
            this._project(); // 调用函数进行坐标转换及bounds计算
            this._update();
        },

        _clickTolerance: function() {
            // used when doing hit detection for Canvas layers
            return (this.options.stroke ? this.options.weight / 2 : 0) + (L.Browser.touch ? 10 : 0);
        },

        // 设置经纬度数据
        _setLatLngs: function(latlngs, speeds) {
            this._bounds = new L.LatLngBounds();
            this._latlngs = latlngs;

            // var groupSize = this._groupSize = Math.ceil(latlngs.length / 100);
            var groupSize = this._groupSize = 20;
            // var groupCount = this._groupCount = Math.ceil(latlngs.length / groupSize);
            this._groupArray = [];

            var groupResult = [],
                tempCount = 0,
                averSpeed = 0,
                j = 0;
            i = 0;
            while (tempCount < latlngs.length) {
                this._bounds.extend(latlngs[tempCount]);
                averSpeed += speeds[tempCount];
                groupResult[i++] = latlngs[tempCount++];
                if ((i >= groupSize) || (tempCount == latlngs.length)) {
                    this._groupArray[j] = {};
                    this._groupArray[j].speed = averSpeed / i;
                    this._groupArray[j].color = this._setColor(this._groupArray[j].speed);
                    averSpeed = 0;
                    i = 0;
                    this._groupArray[j++].latlngs = groupResult;
                    groupResult = [];
                }
            }
            this._curGroupNum = j;
        },

        _project: function() {
            var w = this._clickTolerance(),
                p = new L.Point(w, w);

            var pxBounds = new L.Bounds();
            // 遍历一遍数组
            for (var i = 0; i < this._groupArray.length; i++) {
                var groupPxBounds = new L.Bounds();
                var rings = [];
                for (var j = 0; j < this._groupArray[i].latlngs.length; j++) {
                    rings[j] = this._map.latLngToLayerPoint(this._groupArray[i].latlngs[j]);
                    pxBounds.extend(rings[j]);
                    groupPxBounds.extend(rings[j]);
                }
                this._groupArray[i].rings = rings;
                this._groupArray[i].pxBounds = groupPxBounds;
            }

            if (this._bounds.isValid() && pxBounds.isValid()) {
                pxBounds.min._subtract(p);
                pxBounds.max._add(p);
                this._pxBounds = pxBounds;
            }
        },

        // recursively turns latlngs into a set of rings with projected coordinates
        // 递归的将经纬度坐标转换为投影坐标系
        _projectLatlngs: function(latlngs, result, projectedBounds) {
            var len = latlngs.length,
                i, ring;

            ring = [];
            for (i = 0; i < len; i++) {
                ring[i] = this._map.latLngToLayerPoint(latlngs[i]);
                projectedBounds.extend(ring[i]); // 这里计算了四个点相对于当前屏幕坐标的点同时计算了bounds
            }
            result.push(ring);
        },

        // clip polyline by renderer bounds so that we have less to render for performance
        // 根据渲染的范围剪切曲线以减少资源消耗
        // TODO: 此函数需要去除旧代码
        _clipPoints: function() {
            var bounds = this._renderer._bounds,
                i = 0;

            this._parts = [];
            // 当当前线段的pxBounds和绘图引擎bounds有重叠部分的时候才进行绘制
            if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
                return;
            }

            if (this.options.noClip) {
                // 如果不剪切点则返回全部的点
                for (i = 0; i < this._groupArray.length; i++) {
                    this._groupArray[i].parts = this._groupArray[i].rings;
                }
                return;
            }

            // var parts = this._parts,
            //     j, k, len, len2, segment, points;

            // for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
            //     points = this._rings[i];

            //     for (j = 0, len2 = points.length; j < len2 - 1; j++) {
            //         segment = L.LineUtil.clipSegment(points[j], points[j + 1], bounds, j, true);

            //         if (!segment) { continue; }

            //         parts[k] = parts[k] || [];
            //         parts[k].push(segment[0]);

            //         // if segment goes out of screen, or it's the last one, it's the end of the line part
            //         if ((segment[1] !== points[j + 1]) || (j === len2 - 2)) {
            //             parts[k].push(segment[1]);
            //             k++;
            //         }
            //     }
            // }
        },
        // 设置每段线的颜色函数
        _setColor: function(speed) {
            var color;

            // 颜色码表基于http://tool.oschina.net/commons?type=3
            if (speed <= 20) {
                color = '#FF0000'; // Red1
            } else if (speed <= 40) {
                color = '#FF4500'; // OrangeRed
            } else if (speed <= 60) {
                color = '#FF3030'; // Firebrick1
            } else if (speed <= 80) {
                color = '#FFA500'; // Orange1
            } else if (speed <= 100) {
                color = '#FFD700'; // Gold1
            } else if (speed <= 120) {
                color = '#FFFF00'; // Yellow1
            } else if (speed <= 150) {
                color = '#C0FF3E'; // OliveDrab1
            } else if (speed <= 250) {
                color = '#7FFF00'; // Chartreuse1
            } else {
                color = '#00FF00'; // Green1
            }

            return color;
        },

        // simplify each clipped part of the polyline for performance
        // _simplifyPoints: function() {
        //     var parts = this._parts,
        //         tolerance = this.options.smoothFactor;

        //     for (var i = 0, len = parts.length; i < len; i++) {
        //         parts[i] = L.LineUtil.simplify(parts[i], tolerance);
        //     }
        // },

        _update: function() {
            if (!this._map) { return; }

            this._clipPoints();
            // this._simplifyPoints();
            this._updatePath();
        },

        _updatePath: function() {
            // this._renderer._updatePoly(this);
            this._renderer._updateMultiPoly(this);
        },

        // Needed by the `Canvas` renderer for interactivity
        _containsPoint: function(p, closed) {
            var i, j, k, len, len2, part,
                w = this._clickTolerance();

            if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

            // hit detection for polylines
            for (i = 0, len = this._parts.length; i < len; i++) {
                part = this._parts[i];

                for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
                    if (!closed && (j === 0)) { continue; }

                    if (L.LineUtil.pointToSegmentDistance(p, part[k], part[j]) <= w) {
                        return true;
                    }
                }
            }
            return false;
        }
    });

    var multiPolyline = function(latlngs, speeds, options) {
        return new MultiPolyline(latlngs, speeds, options);
    };


    // 创建一个GPS文件输入控件
    var FileInput = L.Control.extend({
        options: {
            position: 'topleft',
            inputTitle: '请选择GPS数据文件',
        },
        initialize: function(options) {
            L.Util.setOptions(this, options);
        },
        onAdd: function(map) {
            this._map = map;
            var parDiv = L.DomUtil.create('div', 'leaflet-navigate-section');
            var div = L.DomUtil.create('div', 'leaflet-navigate-toolbar leaflet-bar enable', parDiv);
            var a = L.DomUtil.create('a', null, div);
            a.setAttribute('role', 'button');
            a.setAttribute('title', this.options.inputTitle);
            a.setAttribute('aria-label', this.options.inputTitle);
            a.setAttribute('href', '#');
            var input = L.DomUtil.create('input', null, div);
            input.setAttribute('type', 'file');
            input.setAttribute('accept', '.txt');
            this._createActionDom(parDiv);
            this._inputDiv = div;
            this._inputButton = a;
            this._inputElement = input; // 将文件输入控件保存到当前对象中

            // 添加DOM事件监听器
            L.DomEvent.on(input, 'change', this._fileReader, this);

            return parDiv;
        },
        onRemove: function(map) {},
        _createActionDom: function(parentDiv) {
            var actionUl = L.DomUtil.create('ul', 'leaflet-navigate-actions', parentDiv);
            var actionLi = L.DomUtil.create('li', null, actionUl);
            var actionA = L.DomUtil.create('a', null, actionLi);
            var textNode = document.createTextNode('❚❚');
            actionUl.style.display = 'none';
            actionA.appendChild(textNode);
            actionA.setAttribute('href', '#');
            actionA.setAttribute('title', '暂停');
            this._actionRunning = true;
            this._actionUl = actionUl;
            this._actionA = actionA;
            this._actionText = textNode;
            L.DomEvent.on(actionA, 'click', this._actionCallback, this);
        },

        _setActionVisible: function(visibled) {
            if (visibled) {
                this._actionUl.style.display = 'inline';
            } else {
                this._actionUl.style.display = 'none';
            }
        },

        _setActionRun: function(running) {
            if (running) {
                this._actionText.nodeValue = '►';
                this._actionA.setAttribute('title', '继续');
            } else {
                this._actionText.nodeValue = '❚❚';
                this._actionA.setAttribute('title', '暂停');
            }
        },

        _actionCallback: function() {
            var div = this._inputDiv;
            var input = this._inputElement;

            if (this._actionRunning === false) {
                this._setActionRun(false);
                this._renderer.fire('run');
                this._actionRunning = true;
                div.classList.remove('enable');
                div.classList.add('disable');
                input.setAttribute('disabled', 'disabled');
            } else {
                div.classList.remove('disable');
                div.classList.add('enable');
                input.removeAttribute('disabled', 'disabled');
                this._setActionRun(true);
                this._renderer.fire('pause');
                this._actionRunning = false;
            }
        },

        _setEnable: function() {
            var input = this._inputElement;
            var a = this._inputButton;
            var map = this._map;
            var div = this._inputDiv;

            div.classList.remove('disable');
            div.classList.add('enable');

            input.removeAttribute('disabled', 'disabled');

            this._setActionVisible(false);
            this._setActionRun(false);

            if (this._markerEnd) {
                this._markerEnd.setOpacity(1);
                this._markerEnd.setLatLng(this._endLatlng);
            } else {
                this._markerEnd = L.marker(this._endLatlng, {
                    icon: L.icon({
                        iconUrl: 'images/marker-end.png',
                        iconRetinaUrl: 'images/marker-end-2x.png',

                        iconSize: [31, 45],
                        iconAnchor: [15, 41],
                        popupAnchor: [1, -28]
                    })
                }).addTo(map);
            }
        },
        _setDisable: function() {
            var input = this._inputElement;
            var a = this._inputButton;
            var map = this._map;
            var div = this._inputDiv;

            div.classList.remove('enable');
            div.classList.add('disable');

            input.setAttribute('disabled', 'disabled');

            this._setActionVisible(true);

            if (this._markerEnd) {
                this._markerEnd.setOpacity(0);
            }

            if (this._markerStart) {
                this._markerStart.setLatLng(this._startLatlng);
            } else {
                this._markerStart = L.marker(this._startLatlng, {
                    icon: L.icon({
                        iconUrl: 'images/marker-start.png',
                        iconRetinaUrl: 'images/marker-start-2x.png',

                        iconSize: [31, 45],
                        iconAnchor: [15, 41],
                        popupAnchor: [1, -28]
                    })
                }).addTo(map);
            }
        },
        _fileReader: function() {
            var map = this._map;
            var file = this._inputElement.files[0];
            this._inputElement.value = '';
            var reader = new FileReader();
            reader.readAsText(file);
            // 定义reader读取完成回调方法
            reader.onload = function(event) {
                // 新建一个用于存放坐标的数组
                var pathArray = [],
                    speedArray = [],
                    speed = 0;
                // 按行分割字符串\r\r\n两回车一换行
                var GPSDataArray = event.target.result.split("\r");
                for (var i = 0; i < GPSDataArray.length; i++) {
                    // 查找以$GPGGA开头的数据行
                    if (GPSDataArray[i].search("GPRMC") != -1) {
                        var GPSLocateArray = GPSDataArray[i].split(",");
                        if ((GPSLocateArray[2] != 'A') || (!GPSLocateArray[3]) || (!GPSLocateArray[5])) {
                            continue;
                        }
                        // 将度分秒形式的经纬度转换为度
                        var gslat = parseInt(GPSLocateArray[3].slice(0, 2)) + parseFloat(GPSLocateArray[3].slice(2)) / 60;
                        var gslng = parseInt(GPSLocateArray[5].slice(0, 3)) + parseFloat(GPSLocateArray[5].slice(3)) / 60;
                        if (!isNaN(parseFloat(GPSLocateArray[7]))) {
                            speed = parseFloat(GPSLocateArray[7]) * 1.852;
                        }
                        speedArray.push(speed);
                        // 将WGS84格式的经纬度转换为GCJ02格式的经纬度
                        var amaploc = LnglatConvert.wgs84togcj02([gslat, gslng]);
                        pathArray.push(amaploc);
                    }
                }
                this._startLatlng = pathArray[0];
                this._endLatlng = pathArray[pathArray.length - 1];
                if (this._multiPolyline) {
                    this._multiPolyline.setLatLngs(pathArray, speedArray);
                } else {
                    this._multiPolyline = L.multiPolyline(pathArray, speedArray);
                    this._multiPolyline.addTo(map);
                    this._renderer = this._multiPolyline.options.renderer;
                    this._renderer.on('pathdrawingend', this._setEnable, this);
                    this._renderer.on('pathdrawingbegin', this._setDisable, this);
                }
                this._multiPolyline.beginCruise(); // 触发一次巡航
            }.bind(this);
        },
    });

    var fileInput = function(options) {
        return new FileInput(options);
    };

    L.CRS.GCJ02 = GCJ02;
    L.TileLayer.OlineTileLayer = OlineTileLayer;
    L.tileLayer.olineTileLayer = olineTileLayer;
    L.LnglatConvert = LnglatConvert;
    L.MultiCanvas = MultiCanvas;
    L.multiCanvas = multiCanvas;
    L.MultiPolyline = MultiPolyline;
    L.multiPolyline = multiPolyline;
    L.Control.FileInput = FileInput;
    L.control.fileinput = fileInput;
})));

# -*- coding: utf-8 -*-
# @Author: SHLLL
# @Date:   2017-11-23 14:25:54
# @Last Modified by:   SHLLL
# @Last Modified time: 2017-11-26 17:43:19

import sys
import math
import random

import requests
import progressbar

import _mysql as mysql


class MapDownloader(object):
    """地图下载器类

    地图下载器，将给定的经纬度和缩放范围内的瓦片地图下载到数据库中

    Attributes:
        None
    """

    def __init__(self):
        self._mysql = mysql.MySQL()

    def process_latlng(self, north, west, south, east, sZoom, eZoom):
        """根据经纬度下载地图到数据库

        Args:
            north: 最北面经纬度
            west: 最西面经纬度
            south: 最南面经纬度
            east: 最东面经纬度
            sZoom: 起始下载经纬度
            eZoom：结束下载经纬度

        Returns:
            None

        Raises:
            AssertionError: assert函数检查失败错误
        """

        # 规范化输入的数据
        north = float(north)
        west = float(west)
        south = float(south)
        east = float(east)
        sZoom = int(sZoom)
        eZoom = int(eZoom)

        # 检查输入的参数是否满足条件
        assert(east > -180 and east < 180)
        assert(west > -180 and west < 180)
        assert(north > -90 and north < 90)
        assert(south > -90 and south < 90)
        assert(west < east)
        assert(north > south)
        assert(sZoom > 0 and sZoom < 19)
        assert(eZoom > 0 and eZoom < 19)
        assert(sZoom <= eZoom)

        # 针对每一个缩放级别分别进行下载
        for zoom in range(sZoom, eZoom + 1):
            print("正在下载第%u级地图数据" % zoom)
            # 将经纬度转换为xy坐标
            left, top = self.latlng2tilenum(north, west, zoom)
            right, bottom = self.latlng2tilenum(south, east, zoom)
            print(left, top, right, bottom)
            # 下载坐标范围内的数据
            self.process_tilenum(left, right, top, bottom, zoom)

    def process_tilenum(self, left, right, top, bottom, zoom):
        """处理瓦片地图函数

        本函数根据传入的四个瓦片数字以及对应的缩放级别下载瓦片数据

        Args:
            left: 最左瓦片地图编号
            right: 最右瓦片地图编号
            top: 最上瓦片地图编号
            bottom: 最下瓦片地图编号
            zoom: 要下载的瓦片地图缩放级别

        Returns:
            None

        Rasies:
            AssertionError: assert函数检查失败错误
        """

        # 规范化输入的数据
        left = int(left)
        right = int(right)
        top = int(top)
        bottom = int(bottom)
        zoom = int(zoom)

        # 检查输入的参数是否满足条件
        assert(right >= left)
        assert(bottom >= top)

        # 调用下载函数
        # self.download(left, right, top, bottom, zoom)
        total_count = (right - left + 1) * (bottom - top + 1)
        count = 0
        with progressbar.ProgressBar(max_value=total_count) as bar:
            for x in range(left, right + 1):
                for y in range(top, bottom + 1):
                    self._download(x, y, zoom)
                    count += 1
                    bar.update(count)

    def _download(self, x, y, z):
        """下载指定编号瓦片地图函数

        Args:
            x: 瓦片地图x编号
            y: 瓦片地图y编号
            z: 瓦片地图z编号

        Returns:
            None

        Raises:
            None
        """
        url = "http://mt{s}.google.cn/vt/lyrs=m&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}"
        map_url = url.format(s=random.randrange(4), x=x, y=y, z=z)   # 格式化url
        r = requests.get(map_url)
        self._mysql.set_SQL_data(1, x, y, z, r.content)
        self._mysql.save_SQL_data()

    def latlng2tilenum(self, lat_deg, lng_deg, zoom):
        """将地理坐标转换为瓦片坐标

        根据输入的经纬度和缩放级别转换出瓦片坐标中的x和y坐标

        Args:
            lat_deg: 纬度坐标
            lng_deg: 经度坐标
            zoom: 缩放级别

        Returns:
            返回两个参数，分别是瓦片坐标系下的x坐标和y坐标

        Raises:
            None
        """
        n = math.pow(2, int(zoom))
        xtile = ((lng_deg + 180) / 360) * n
        lat_rad = lat_deg / 180 * math.pi
        ytile = (1 - (math.log(math.tan(lat_rad) + 1 /
                               math.cos(lat_rad)) / math.pi)) / 2 * n
        return math.floor(xtile), math.floor(ytile)


def main():
    # 检查输入参数个数是否为六个
    if len(sys.argv) != 7:
        print('''Please input 6 parameter as below:
    1.northeast latitude
    2.northeast longitude
    3.southeast latitude
    4.southeast longitude
    5.start zoom
    6.end zoom''')
        return

    map_downloader = MapDownloader()

    # 参数如果没有错误则进行处理
    map_downloader.process_latlng(float(sys.argv[1]), float(sys.argv[2]), float(sys.argv[3]), float(
        sys.argv[4]), int(sys.argv[5]), int(sys.argv[6]))


if __name__ == '__main__':
    map_downloader = MapDownloader()
    map_downloader.process_latlng(30.636113, 104.076308, 30.624802, 104.091425, 3, 16)

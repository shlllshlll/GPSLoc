# -*- coding: utf-8 -*-
# @Author: SHLLL
# @Date:   2017-11-25 01:08:24
# @Last Modified by:   SHLLL
# @Last Modified time: 2017-11-26 02:10:32

import configparser
import pymysql.cursors


class MySQL(object):
    """存储图片数据到MySQL类

    本类初始化了MySQL连接，并提供了写入数据到数据中
    的方法

    Attributes:
        _cf: 读取的配置文件对象实例
    """

    _connection = None
    _cursor = None

    def __init__(self):
        self._cf = configparser.ConfigParser()
        self._cf.read("databasecong.ini")

        host = self._cf['MySQL']['host']
        user = self._cf['MySQL']['username']
        port = self._cf['MySQL']['port']
        password = self._cf['MySQL']['password']
        database = self._cf['MySQL']['database']

        self.__class__._connection = pymysql.connect(
            host=host,
            user=user,
            port=int(port),
            password=password,
            db=database,
            charset='utf8',
            cursorclass=pymysql.cursors.DictCursor)

        self.__class__._cursor = self.__class__._connection.cursor()

    def __del__(self):
        self.__class__._connection.close()

    def set_SQL_data(self, type, x, y, z, img):
        try:
            self.__class__._cursor.execute(
                "INSERT INTO mapcache VALUES (%s,%s,%s,%s,%s)", (type, z, x, y, img))
        except pymysql.err.IntegrityError as integrityError:
            pass

    def save_SQL_data(self):
        self.__class__._connection.commit()


if __name__ == '__main__':
    mysql = MySQL()

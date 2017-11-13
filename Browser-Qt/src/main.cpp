#include "mainwindow.h"
#include <QApplication>
#include <QtWebEngineWidgets>

int main(int argc, char *argv[])
{
    QCoreApplication::setAttribute(Qt::AA_UseOpenGLES);
    QApplication a(argc, argv);
    QString runPath = QCoreApplication::applicationDirPath();
    QString htmlPath = "file:///" + runPath + "/index.html";

//    qDebug() << htmlPath;
//    MainWindow w;

    QWebEngineView *webView = new QWebEngineView();
    webView->setWindowTitle(QString("GPS Locus Recur Program"));
    webView->setWindowIcon(QIcon(":logo.ico"));
    webView->setUrl(QUrl(htmlPath));
    webView->show();

//    w.show();
    return a.exec();
}

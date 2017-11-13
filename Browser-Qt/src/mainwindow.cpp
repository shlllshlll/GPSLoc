#include "mainwindow.h"
#include "ui_mainwindow.h"

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    setWindowTitle(QString("GPS Locus Recur Program"));
    setWindowIcon(QIcon(":logo.ico"));
}

MainWindow::~MainWindow()
{
    delete ui;
}

//класс Canvas отвечает за отображение фигуры на канвасе
class Canvas {
    constructor(canvas, width = 1000, height = 600) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        this.ctx.translate(width / 2, height / 2);
    }
}

//класс Point реализует объект точки
class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

//класс PointList реализовывает список точек (хранит массив точек)
class PointList {
    constructor(...points) {
        this.pointList = [];
        this.constCoordinates = [];
        points.forEach(point => {
            this.pointList.push(new Point(point.x, point.y, point.z));
            this.constCoordinates.push(new Point(point.x, point.y, point.z));
        });
    }
}

//класс MyFigure реализовывает методы работы с объемной фигурой
class MyFigure {
    constructor(canvas, list, fl = 6500, center = 1500) {
        //канвас, на котором отображается фигура
        this.canvas = canvas;

        //список точек фигуры
        this.points = list.pointList;

        //поле fl отвечает за масштабирование фигуры
        this.fl = fl;
        this.center = center;

        //флаг для обновления
        this.needsRefresh = true;

        //номера точек (нужно для изначального построения фигуры по точкам this.points)
        this.knots = null;
        this.constCoordinates = list.constCoordinates;
    }

    //определение точек под канвас
    figure() {
        for (let i = 0; i < this.points.length; i++) {
            let scale = this.fl / (this.fl + this.points[i].z + this.center);
            this.points[i].sx = this.points[i].x * scale;
            this.points[i].sy = this.points[i].y * scale;
        }
    }

    //метод drawLine отрисовывает линии (от 1-й точки до n-й)
    drawLine(numbersArr) {
        let point = this.points[numbersArr[0]];
        this.canvas.ctx.moveTo(point.sx, point.sy);
        for (let i = 1; i < numbersArr.length; i++) {
            point = this.points[numbersArr[i]];
            this.canvas.ctx.lineTo(point.sx, point.sy);
        }
    }

    //метод drawFigure отрисовывает нашу фигуру
    drawFigure(...numberArr) {
        this.knots = numberArr;
        for (let i = 0; i < numberArr.length; i++) {
            this.drawLine(numberArr[i]);
        }
        this.canvas.ctx.stroke();
    }

    //метод translate отвечает за передвижение фигуры по осям x, y, z
    translate(x, y, z) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].x += x;
            this.points[i].y += y;
            this.points[i].z += z;
        }
        this.needsRefresh = true;
    }

    rotateX(angle) {
        let cos = Math.cos(angle),
            sin = Math.sin(angle);
        this.points.forEach(point => {
            point.y = point.y * cos - point.z * sin;
            point.z = point.z * cos + point.y * sin;
        });
        this.needsRefresh = true;
    }

    rotateY(angle) {
        let cos = Math.cos(angle),
            sin = Math.sin(angle);
        this.points.forEach(point => {
            point.x = point.x * cos - point.z * sin;
            point.z = point.z * cos + point.x * sin;
        });
        this.needsRefresh = true;
    }

    rotateZ(angle) {
        let cos = Math.cos(angle),
            sin = Math.sin(angle);
        this.points.forEach(point => {
            point.x = point.x * cos - point.y * sin;
            point.y = point.y * cos + point.x * sin;
        });
        this.needsRefresh = true;
    }

    //проекция вида спереди
    viewFrontProjection() {
        this.refresh();
        this.points.forEach(point => {
            point.z = 0;
        });
        this.needsRefresh = true;
    }

    //получение косоугольной проекции
    viewSideProjection() {
        this.refresh();
        let a = Math.cos(0.79) / 2,
            b = Math.sin(0.79) / 2;
        this.points.forEach(point => {
            point.x = point.x + point.z * a;
            point.y = point.y + point.z * b;
            point.z = 0;
        });
        this.needsRefresh = true;
    }

    //получение одноточечной перспективной проекции
    viewCentralProjection() {
        this.refresh();
        const r = -0.005;
        this.points.forEach(point => {
            point.x = point.x / (r * point.z + 1);
            point.y = point.y / (r * point.z + 1);
            point.z = point.z / (r * point.z + 1);
        });
        this.needsRefresh = true;
    }

    //обновление канвас (сброс действий)
    refresh() {
        this.needsRefresh = true;
        this.points = this.constCoordinates;
        this.redraw(this.knots);
    }

    //перерисовка канваса
    redraw(...numberArr) {
        let update = () => {
            if (this.needsRefresh) {
                let w = this.canvas.width,
                    h = this.canvas.height;
                this.canvas.ctx.clearRect(-w / 2, -h / 2, w, h);
                this.figure();
                this.canvas.ctx.beginPath();
                this.drawFigure(...numberArr);
                this.needsRefresh = false;
            }
            requestAnimationFrame(update);
        }
        update();
    }
}


//обработка событий
function eventControl(figure) {
    // const frontProjection = document.querySelector('#front-projection'),
    //     sideProjection = document.querySelector('#side-projection'),
    //     centralProjection = document.querySelector('#central-projection'),
    //     reset = document.querySelector('#reset'),
    //     buttons = document.querySelector('.buttons');

    // buttons.addEventListener('mousedown', () => {
    //     let t = event.target;
    //     if (t === frontProjection) figure.viewFrontProjection();
    //     if (t === sideProjection) figure.viewSideProjection();
    //     if (t === centralProjection) figure.viewCentralProjection();
    //     if (t === reset) figure.refresh();
    // });

    document.body.addEventListener("keydown", function(event) {
        switch (event.keyCode) {
            case 37: // левая стрелочка
                if (event.ctrlKey) figure.rotateY(0.05);
                else figure.translate(-20, 0, 0);
                break;
            case 39: // правая стрелочка
                if (event.ctrlKey) figure.rotateY(-0.05);
                else figure.translate(20, 0, 0);
                break;
            case 38: // стрелочка вверх
                if (event.shiftKey) {
                    figure.translate(0, 0, 20);
                } else if (event.ctrlKey) {
                    figure.rotateX(0.05);
                } else {
                    figure.translate(0, -20, 0);
                }
                break;
            case 40: // стрелочка вниз
                if (event.shiftKey) {
                    figure.translate(0, 0, -20);
                } else if (event.ctrlKey) {
                    figure.rotateX(-0.05);
                } else {
                    figure.translate(0, 20, 0);
                }
                break;
        }
    });
}


window.onload = function() {
    const canvasElement = document.querySelector("#canvas");
    let canvas = new Canvas(canvasElement);
    //нижнее основание фигуры варианта 17
    let p0 = { x: 0, y: 0, z: 0 },
        p1 = { x: 0, y: 100, z: 0 },
        p2 = { x: 100, y: 100, z: 0 },
        p3 = { x: 100, y: 0, z: 0 };

    //верхнее основание фигуры варианта 17
    let p4 = { x: 0, y: 0, z: 100 },
        p5 = { x: 0, y: 100, z: 100 },
        p6 = { x: 100, y: 100, z: 100 },
        p7 = { x: 100, y: 0, z: 100 };

    //точка в центре фигуры варианта 17
    let p8 = { x: 50, y: 50, z: 50 };
    let pointList = new PointList(p0, p1, p2, p3, p4, p5, p6, p7, p8),
        myFigure = new MyFigure(canvas, pointList);
    let n = [
        [0, 1, 2, 3, 0],
        [4, 5, 6, 7, 4],
        [4, 8],
        [5, 8],
        [6, 8],
        [7, 8],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7]

    ];

    eventControl(myFigure);
    myFigure.redraw(n[0], n[1], n[2], n[3], n[4], n[5], n[6], n[7], n[8], n[9]);
}
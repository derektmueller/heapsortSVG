

/**
 * Array shuffle algorithm
 */
Array.prototype.fisherYates = function () {
    var temp, j;
    for (var i = this.length - 1; i >= 0; i--) {
        j = Math.floor (Math.random () * i);
        temp = this[i];
        this[i] = this[j]; 
        this[j] = temp;
    }
    return this;
};



var Ring = (function () {

/**
 * Manages drawing and animation of a ring
 */
function Ring (x, y, r1, r2, color) {
    this.x = x;
    this.y = y;
    this.r1 = r1;
    this.r2 = r2;
    this.color = color;
    this._angle = 0;
    this._elements = [];
};

/**
 * Remove svg elements
 */
Ring.prototype.clear = function () {
    this._elements.forEach (function (elem) { elem.remove (); });
    this._elements = [];
};

/**
 * Draws the ring 
 * @param bool clear if true, previously created ring elements will be
 *  deleted before drawing/creating a new ring
 */
Ring.prototype.draw = function (clear) {
    var clear = typeof clear === 'undefined' ? false : clear; 
    if (clear) 
        this.clear ();
    this._elements.push (d3.select ('svg')
        .append ('path')
        .attr ({
            d: 'M' + (this.x - this.r2) + ' ' + 
                    (this.y) +
                ' A' + this.r2 + ' ' + this.r2 + ' ' +
                    0 + ' ' + 0 + ' ' + 0 + ' ' +
                    (this.x + this.r2) + ' ' + 
                    (this.y) +
                ' L' + (this.x + this.r1) + ' ' + 
                    (this.y) +
                ' A' + this.r1 + ' ' + this.r1 + ' ' +
                    0 + ' ' + 0 + ' ' + 1 + ' ' +
                    (this.x - this.r1) + ' ' + 
                    (this.y) + 
                ' L' + (this.x - this.r1) + ' ' + 
                    (this.y) +
                'Z',
            transform: 
                'rotate(' + this._angle +
                ' ' + this.x + ' ' + this.y + ')',
        }).style ({
            fill: 'rgb(' + 
                this.color[0] + ',' + 
                this.color[1] + ',' + 
                this.color[2] +
            ')',
            stroke: 'black',
            'stroke-width': '1px',
        })
    );
};

/**
 * Animate rotation from current angle to current angle plus specified
 *  offset
 * @param number degrees offset
 * @return Promise
 */
Ring.prototype.rotate = function (degrees) {
    var that = this;
    var startAngle = this._angle;
    var endAngle = startAngle + degrees;
    var step = (endAngle - startAngle) / 20;
    return new Promise (function (resolve, reject) {
        var timeout = window.setInterval (function () {
            that._angle += step;
           //console.log ('that._angle = ');
           //console.log (that._angle);
            if (startAngle <= endAngle && that._angle >= endAngle ||
                startAngle >= endAngle && that._angle <= endAngle) {

                that._angle = (startAngle + degrees) % 360;
                that.draw (true);
                window.clearInterval (timeout);
                resolve ();      
            } else {
                that.draw (true);
            }
        }, 20);
    });
};

/**
 * Animate rotation from current angle to current angle plus specified
 *  offset
 * @param number degrees offset
 * @return Promise
 */
Ring.prototype.moveTo = function (newR1) {
    var that = this;
    var startR1 = this.r1;
    var width = this.r2 - this.r1;
    var step = (newR1 - startR1) / 20;
    return new Promise (function (resolve, reject) {
        var timeout = window.setInterval (function () {
            if (startR1 <= newR1 && that.r1 >= newR1 ||
                startR1 >= newR1 && that.r1 <= newR1) {

                that.r1 = newR1;
                that.r2 = newR1 + width;
                that.draw (true);
                window.clearInterval (timeout);
                resolve ();      
            } else {
                that.r1 += step;
                that.r2 += step;
                that.draw (true);
            }
        }, 20);
    });
};

return Ring;

}) ();

var RingSet = (function () {

/**
 * Creates and manages a set of Ring objects, providing methods to
 * sort and swap rings.
 */
function RingSet (numberOfRings, x, y, r, colors) {
    this.numberOfRings = numberOfRings;
    this.x = x;
    this.y = y;
    this.colors = colors;
    this._ringWidth = r / this.numberOfRings;
    this._rings = [];
    this._init (); 
};

/**
 * Draw all rings
 */
RingSet.prototype.draw = function () {
    var that = this;
    this._rings.forEach (function (ring) {
        ring.draw ();
    });
};

/**
 * Animate swap of rings at index i and j
 * @param number i
 * @param number j
 */
RingSet.prototype.swap = function (i, j) {
    var that = this;
    var ring1R1Start = that._rings[i].r1;
    return new Promise (function (resolve, reject) {
        Promise.all ([
            that._rings[i].rotate (180),
            that._rings[j].rotate (-180)
        ]).then (function () {
            return Promise.all ([
                that._rings[i].moveTo (that._rings[j].r1),
                that._rings[j].moveTo (ring1R1Start)]);
        }).then (function () {
            return Promise.all ([
                that._rings[i].rotate (180),
                that._rings[j].rotate (-180)
            ]);
        }).then (function () {
            var temp = that._rings[i];
            that._rings[i] = that._rings[j];
            that._rings[j] = temp;
            resolve ();
        });
    });
};

/**
 * Helper method of heapsort () which performs deletion and swap steps
 * @param Heap heap
 * @param i keeps track of the number of deletions that have been 
 *  performed
 * @return Promise
 */
RingSet.prototype._heapsortPrime = function (heap, i) {
    var that = this;
    return new Promise (function (resolve) {
        if (i + 1 < that._rings.length) {
            var outerDeleted;
            heap.delete ().then (function (deleted) {
                outerDeleted = deleted;
                return outerDeleted.rotate (180);
            }).then (function () {
                return outerDeleted.moveTo (
                    (that._rings.length - (i + 1)) * that._ringWidth);
            }).then (function () {
                return outerDeleted.rotate (180);
            }).then (function () {
                that._rings[that._rings.length - (i + 1)] = outerDeleted;
                return that._heapsortPrime (heap, i + 1);
            }).then (function () {
                resolve ();
            });
        } else {
            resolve ();
        }
    });

};

/**
 * Performs heapsort on the rings by color, animating swaps that occur
 * during heapsort's execution
 * @return Promise
 */
RingSet.prototype.heapsort = function () {
    var that = this;
    return new Promise (function (resolve) {
        var heap = new Heap (function (a, b) {
            return a.color[0] > b.color[0];
        }, function (i, j) {
            return new Promise (function (resolve) {
                that._rings[i].rotate (180).then (function () {
                    return that._rings[i].moveTo (that._rings[j].r1);
                }).then (function () {
                    return that._rings[i].rotate (180);
                }).then (function () {
                    heap._heap[j] = heap._heap[i];
                    resolve ();
                });
            });
        }, function (i, j) {
            return new Promise (function (resolve) {
                that.swap (i, j).then (function () {
                    resolve ();
                });
            });
        });
        heap.buildHeap (that._rings).then (function () {
            return that._heapsortPrime (heap, 0)
        }).then (function () {
            resolve ();
        });
    });

    return this;
};

/**
 * Instantiate rings
 */
RingSet.prototype._init = function () {
    for (var i = 0; i < this.numberOfRings; i++) {
        this._rings.push (new Ring (
            this.x, this.y, i * this._ringWidth,
            i * this._ringWidth + this._ringWidth, this.colors[i]));
    }
};

return RingSet;

}) ();



var ColorSet = (function () {

function ColorSet (numberOfColors) {
    this.numberOfColors = numberOfColors;
    this._colors = [];
    this._generate ();
};

ColorSet.prototype.getColors = function () {
    return this._colors;
};

/**
 * Genertes range of colors between start and end colors. Currently
 * hard-coded to generate gradient between white and gray
 */
ColorSet.prototype._generate = function () {
    var end = [200, 200, 200];
    var start = [255, 255, 255];
    var steps = [
        (end[0] - start[0]) / (this.numberOfColors - 1),
        (end[1] - start[1]) / (this.numberOfColors - 1),
        (end[2] - start[2]) / (this.numberOfColors - 1),
    ];
    var currColor = start;
    var colors = [];
    for (var i = 0; i < this.numberOfColors; i++) {
        currColor = [
            currColor[0] + steps[0],
            currColor[1] + steps[1],
            currColor[2] + steps[2],
        ];
        colors.push ([
            currColor[0],
            currColor[1],
            currColor[2]
        ]);
    }
    this._colors = colors.map (function (color) {
        return [
            Math.floor (color[0]),
            Math.floor (color[1]),
            Math.floor (color[2])
        ];
    });
};

return ColorSet;

}) ();


var ringNum = 35;
//var ringNum = 3;
var center = Math.floor ($('svg').width () / 2);
var radius = Math.floor ($('svg').width () / 3);
var ringSet = new RingSet (
    ringNum, center, center, radius,
    new ColorSet (ringNum).getColors ().fisherYates ());
ringSet.draw ();

setTimeout (function () { ringSet.heapsort (); }, 1000);


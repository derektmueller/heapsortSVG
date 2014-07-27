

String.prototype.repeat = function (count) {
    var result = '';
    for (var i = 0; i < count; i++) {
        result += this;
    }
    return result;
};

Math.log2 = function (val) {
    return Math.log (val) / Math.LN2;
};


var Heap = (function () {

function Heap (compare, move, swap) {
    var that = this;
    if (typeof compare === 'undefined') {
        this.compare = function (a, b) {
            return a < b;
        };
    } else {
        this.compare = compare;
    }
    if (typeof move === 'undefined') {
        this.move = function (i, j) {
            that[j] = that[i]
        };
    } else {
        this.move = move;
    }
    if (typeof swap === 'undefined') {
        this.swap = function (i, j) {
            var temp = that[i];
            that[i] = that[j]
            that[j] = temp;
        };
    } else {
        this.swap = swap;
    }
    this.min = false;
    this._scale = 9;
    this.length = 0;

    this._heap = [];
};

Heap.prototype.toString = function () {
    var that = this;
    var heightOfTree = this._heightOfTree ();
    var maxNodesAtBase = this._maxNodesAtDepth (heightOfTree);
    if (!heightOfTree) {
        return '';
    }
    var str = '';
    this._heap.slice (0, this.length).forEach (function (elem, i) {
        if (Math.log2 (i + 1) === Math.floor (Math.log2 (i + 1))) {
            str += "\n" + ' '.repeat (
                that._leftPaddingAtDepth (
                    that._depthOfNode (i)));
        }
        str += elem.color[0] + ' '.repeat (
            that._spaceBetweenNodesAtDepth (
                that._depthOfNode (i)));
    });
    return str;
};

Heap.prototype._leftPaddingAtDepth = function (d) {
    var heightOfTree = this._heightOfTree ();
    var maxNodesAtBase = this._maxNodesAtDepth (heightOfTree);
    return ((heightOfTree - d) * 
        ((maxNodesAtBase * this._scale) / 2 / heightOfTree));
};

Heap.prototype._spaceBetweenNodesAtDepth = function (d) {
    var heightOfTree = this._heightOfTree ();
    var maxNodesAtBase = this._maxNodesAtDepth (heightOfTree);
    var widthOfRow = (((maxNodesAtBase - 1) * this._scale) - 
        this._leftPaddingAtDepth (d)) /
        this._maxNodesAtDepth (d);
    if (widthOfRow > 1) return widthOfRow;
    else return 0;
};

Heap.prototype._depthOfNode = function (i) {
    return Math.floor (Math.log2 (i + 1));
};

Heap.prototype._heightOfTree = function () {
    if (!this._heap.length) return null;
    return this._depthOfNode (this._heap.length - 1);
};

Heap.prototype._maxNodesAtDepth = function (d) {
    return Math.pow (2, d);
};

/**
 * O(log n)
 */
Heap.prototype.delete = function () {
    var that = this;
    var deleted = that._heap[0];
    return new Promise (function (resolve) {
        that.move (that.length - 1, 0).then (function () {
            that.length--;
            return that.heapify (0);
        }).then (function () {
            resolve (deleted);
        });
    });
};

/**
 * O(h)
 */
Heap.prototype.heapify = function (i) {
    var that = this;
    return new Promise (function (resolve) {
        var currIndex = i, leftChildIndex, rightChildIndex,
            swapIndex;
        leftChildIndex = 2 * currIndex + 1; 
        rightChildIndex = 2 * currIndex + 2; 
        swapIndex = currIndex;
        if (leftChildIndex < that.length && 
            that.compare (
                that._heap[leftChildIndex], that._heap[swapIndex])) {
            swapIndex = leftChildIndex;
        }
        if (rightChildIndex < that.length && 
            that.compare (
                that._heap[rightChildIndex], that._heap[swapIndex])) {
            swapIndex = rightChildIndex;
        }
        if (swapIndex !== currIndex) {
            that.swap (currIndex, swapIndex).then (function () {
                return that.heapify (swapIndex);
            }).then (function () {
                resolve ();
            });
        } else {
            resolve ();
        }
    });
};

Heap.prototype._buildHeapPrime = function (i) {
    var that = this;
    if (i >= 0) {
        return new Promise (function (resolve) {
            that.heapify (i).then (function () {
                return that._buildHeapPrime (i - 1);
            }).then (function () {
                resolve ();
            });
        });
    }
};

/**
 * O(n)
 */
Heap.prototype.buildHeap = function (arr) {
    var that = this;
    this._heap = arr;
    this.length = arr.length;
    return new Promise (function (resolve) {
        that._buildHeapPrime (Math.floor ((that.length - 1) / 2)).
            then (function () {
                resolve ();
            });
    });
};

return Heap;

}) ();

//module.exports = Heap;

/***********************************************************************
* test 
***********************************************************************/

//GLOBAL.test = function () {
//
//var heap = new Heap ();
////heap.insert (6);
////heap.insert (5);
////heap.insert (4);
////heap.insert (3);
////heap.insert (2);
////heap.insert (1);
////heap.insert (6);
////heap.insert (5);
////heap.insert (4);
////heap.insert (3);
////heap.insert (2);
////heap.insert (1);
////heap.insert (1);
////heap.insert (1);
////heap.insert (1);
////console.log (heap.toString ());
//var heap = new Heap ().buildHeap (
//        [6, 5, 4, 3, 2, 1, 6, 5, 4, 3, 2, 1, 1, 1, 1])
//console.log (heap + '');
////console.log (heap._heightOfTree ());
////console.log (heap._maxNodesAtDepth (0));
////console.log (heap._maxNodesAtDepth (1));
////console.log (heap._maxNodesAtDepth (2));
////console.log (heap._leftPaddingAtDepth (0));
////console.log (heap._leftPaddingAtDepth (1));
////console.log (heap._leftPaddingAtDepth (2));
////console.log (heap._leftPaddingAtDepth (3));
////console.log (heap._spaceBetweenNodesAtDepth (0));
////console.log (heap._spaceBetweenNodesAtDepth (1));
////console.log (heap._spaceBetweenNodesAtDepth (3));
////console.log (heap._depthOfNode (0));
////console.log (heap._depthOfNode (1));
////console.log (heap._depthOfNode (2));
////console.log (heap._depthOfNode (3));
////console.log (heap._depthOfNode (4));
////console.log (heap._depthOfNode (5));
////console.log (heap._depthOfNode (6));
////console.log (heap._depthOfNode (7));
////console.log (heap._depthOfNode (7));
////console.log (heap.toString ());
////heap.delete ();
////console.log (heap.toString ());
////heap.delete ();
////console.log (heap.toString ());
////heap.delete ();
////console.log (heap.toString ());
//
//}


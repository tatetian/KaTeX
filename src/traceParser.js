/*
This module traces the execution of Parser so that I can get a better
understanding of how Parser works. After all, I am not the author.
*/

function TraceNode()
{
    this._parent = null;
    this._children = [];
    this._log = '';
}
TraceNode.prototype.addChild = function(node) {
    node.parent(this);
    this._children.push(node);
}
TraceNode.prototype.children = function() {
    return this._children;
}
TraceNode.prototype.parent = function(parent) {
    if (parent !== undefined) this._parent = parent;
    else return this._parent;
}
TraceNode.prototype.log = function(log) {
    if (log !== undefined) this._log = log;
    else return this._log;
}

function Tracer() {
    this.reset();
}
Tracer.prototype.enter = function() {
    var newChildNode = new TraceNode();
    this._currentNode.addChild(newChildNode);
    this._currentNode = newChildNode;
}
Tracer.prototype.leave = function() {
    var parent = this._currentNode.parent();
    if (!parent) throw 'top level! cannot leave';
    this._currentNode = parent;
}
Tracer.prototype.log = function(msg) {
    this._currentNode.log(msg);
}
Tracer.prototype.reset = function() {
    this._currentNode = new TraceNode();
}
Tracer.prototype.flush = function() {
    this._flush(this._currentNode, 0);
}
Tracer.prototype._flush = function(node, level) {
    var indent = '';
    for (var i = 0; i < level; i++) indent += '  ';
    console.log(indent + node.log());

    var children = node.children();
    for (var ci = 0; ci < children.length; ci++) {
        var c = children[ci];
        this._flush(c, level + 1);
    }
}

var Parser = require('./Parser');

function traceParser() {
    var tracer = new Tracer();

    Parser.prototype._parse = Parser.prototype.parse;
    Parser.prototype.parse = function(input) {
        this._input = input;
        tracer.reset();
        tracer.log('Parser call stack for "' + input + '":')
        var res = Parser.prototype._parse.apply(this, arguments);
        tracer.flush();
        return res;
    }

    function decorateWithTracer(fn) {
        Parser.prototype['_' + fn] = Parser.prototype[fn];
        Parser.prototype[fn] = function(pos, mode) {
            tracer.enter();
            var res = Parser.prototype['_' + fn].apply(this, arguments);
            tracer.log('> ' + fn + '(' + pos + ', "' + mode + '")' +
                ' --> "' + (res ? this._input.slice(pos, res.position) : '')+ '"');
            tracer.leave();
            return res;
        }
    }

    // Get a list of parseXXXX functions
    var parseFuncNames = [];
    for (var fn in Parser.prototype) {
        if (fn.indexOf('parse') != 0) continue;
        if (fn === 'parse') continue;

        parseFuncNames.push(fn);
    }
    for (var fi in parseFuncNames) {
        var fn = parseFuncNames[fi];
        decorateWithTracer(fn);
    }
}

module.exports = traceParser;

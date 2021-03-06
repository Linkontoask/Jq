(function() {

// 重写jQuery
// JQuery version : "3.2.1"
// 目前只支持ID,Class,标签选择器
// 支持IE10+

    var Link = {
        type: function (name) {
            return Object.prototype.toString.call(name);
        },

        isFunction: function (val) {
            return this.type(val) === '[object Function]' ? true : false;
        },

        isArray: function (val) {
            return this.type(val) === '[object Array]' ? true : false;
        },

        isObject: function (val) {
            return this.type(val) === '[object Object]' ? true : false;
        },

        isDomDoc: function (o) {
            var brek;
            if (this.isXMLDoc(o)) {
                brek = o.isConnected;
            } else {
                this.error (`Failed to execute 'isDomDoc' on 'Element' : '${o}' is not of type 'Element'`)
            };
            return brek && brek;
        },

        isXMLDoc: function (o) {
            return (o !== null) && !!(o.ownerDocument && (o.ownerDocument.defaultView || o.ownerDocument.parentWindow).alert);
        },

        // false 为空
        isEmptyObject: function (val) {
            for (var i in val) {
                return true;
            };
            return false;
        },

        error: function (str) {
            throw (str);
        },

        contains: function (per, child) {
            if (!this.isXMLDoc(per)) {
                return this.error (`Failed to execute 'contains' on 'Node' : ${per} is not of type 'Node'`);
            };
            if (!this.isXMLDoc(child)) {
                return this.error (`Failed to execute 'contains' on 'Node' : ${child} is not of type 'Node'`);
            };
            return per.contains(child);
        },

        each: function (obj, callback) {
            var len , i = 0;

            if (this.isArray(obj)) {
                len = obj.length;
                for ( ; i < len; i++ ) {
                    if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
                        break;
                    }
                }
            }

            return obj;
        }
    };

// $ 里封装一些常用方法,可以减少对prototype的遍历
    window._$ = window.Link = Link;


function App () {
};

App.fn = App.prototype = {

	constructor: App,

	log: console.log,

    Link: '0.0.1',

	eq: function (i) {
		var _t = this;

		i === -1 ? i = _t.elem.length - 1 : i;

		if (typeof _t.elem[i] === 'undefined' && i < _t.elem.length)
			_t.log(new Error(`${_t.elem.toString()} not Array`));

		if (i > _t.elem.length - 1)
			_t.log(new Error(`${i} More than expected`));

		var ret = new Jq(_t.elem[i] ? _t.elem[i] : _t.elem);

		return ret;
	},

	type: function (name) {
		return Object.prototype.toString.call(name);
	},

	isFunction: function (fn) {
		return this.type(fn) === '[object Function]' ? true : false;
	},

	each: function (callback) {
		var
			i = 0,
			len = this.elem.length;
		if (len === 1) {
			callback(this, i);
		}
		for ( ; i < len; i++) {
			callback(new Jq(this.elem[i]), i);
		};
	},

    children: function (fifter) {
		var i = 0,
			temp = fifter,
			_self = this,
			obj = _self.elem,
			len = _self.elem.children.length,
			brek = [],
			str = fifter && fifter.replace(/^./, ''),
            fifter = fifter && fifter.slice(0, 1);

		for (; i < len; i++) {
			if (obj.children[i].matches(temp)) {
                brek.push( obj.children[i] )
			}

            /*if (fifter === '.' && obj.children[i].classList.contains(str)) {
            	brek.push(obj.children[i]);
			}
			if (fifter === '#' && obj.children[i].id === str) {
            	brek.push(obj.children[i]);
			}
			if (obj.children[i].tagName === temp.toUpperCase()) {
				brek.push(obj.children[i]);
			}*/
		};

		return new Jq(brek);
    },

};

	var
        rnoInnerhtml = /<script|<style|<link/i;

App.extend = App.fn.extend = function () {
	var
		r = function(){};

	for (var i in App.prototype) {
		r.prototype[i] = App.prototype[i];
	};

	for (var i in arguments[0]) {
		r.prototype[i] = arguments[0][i];
	};

	for (var i in r.prototype) {
		App.prototype[i] = r.prototype[i];
	};

};

App.extend({
	addCss: function (value) {
		var _t = this,
			a = arguments,
			b = _t.type(_t.elem);

		if (a[1]) {

			b === '[object NodeList]' ?
				_t.elem[0].style[a[0]] = a[1]
			:
				_t.elem.style[a[0]] = a[1];
			return;
		};

		for (var key in value) {

			b === '[object NodeList]' ?
				_t.elem[0].style[ key ] = value[ key ]
			:
				_t.elem.style[ key ] = value[ key ];

		};
	}

});

App.extend({

	// 设置
	attr: function (name, value) {

		var _t = this;

		// 返回属性值
		if (typeof name === 'string' && !value) {
			return _t.elem.getAttribute(name);
		};

		if (value) {
			if (_t.type(value) === '[object Function]')
				_t.elem.setAttribute(name, value());
			else
				_t.elem.setAttribute(name, value);
		} else {
			for (i in name) {
				_t.elem.setAttribute(i, name[i]);
			}
		};
	},

	removeAttr: function (name) {
		this.elem.removeAttribute(name);
	}
});

App.extend({

	// value === undefined 返回文本 / 设置文本
	text: function (value) {
		var elem = this.elem || {};

		if ( value === undefined && elem.nodeType === 1 ) {
			return elem.innerText;
		};

		elem.innerText = value;
	},

	// 设置节点HTML
	html: function ( value ) {
		var elem = this.elem || {};

		if ( value === undefined && elem.nodeType === 1 ) {
			return elem.innerHTML;
		};

		if (typeof value === "string" && !rnoInnerhtml.test( value )) {
			elem.innerHTML = value
		};
	},

    append: function (elem) {
		if (Link.isXMLDoc(elem) && ( elem.nodeType === 1 || elem.nodeType === 9) ) {
			// 未区分 tbody
            this.elem.appendChild( elem.cloneNode(true) ); // 允许多次添加同一个节点
		}

		if ( typeof elem === 'string' ) {
            this.elem.innerHTML += elem;
		}

    },

	// 指定节点子元素之前插入元素
    prepend: function (node) {
		var target = this.elem.parentNode;
        target.insertBefore(node, target.firstChild);
    },

	// 之前插入内容
    before: function () {
		
    },

	// 之后插入内容
    after: function () {
		
    },

	// 清空父级元素上所有子节点和内容
    empty: function () {

    }
});

// 获取元素所有属性 attributes => NamedNodeMap对象
// firstElementChild
// lastElementChild

function classType (vac, that, type) {
	var elem = that.elem || {},
		i = 0,
		len = vac.length;

	for ( ; i < len ; i++) {
		if (typeof vac[i] === 'string') {
			elem.classList[type](vac[i]);
		};

	};
};

App.extend({

	// class返回 DOMTokenList对象

	getClass: function () {
		elem = this.elem;
		return elem.getAttribute && elem.getAttribute( "class" ) || "";
	},

	// 添加指定样式
	addClass: function () {
		classType(arguments, this, 'add');
	},

	// 移除指定样式
	removeClass: function () {
		classType(arguments, this, 'remove');
	},

	replaceClass: function (oldClass, newClass) {

		if (oldClass && newClass && typeof oldClass === 'string' && typeof newClass === 'string') {
			this.replace(oldClass , newClass);
		};
	},

	// stateVal === true 添加 / 移除 toggle
	toggleClass: function (value, force) {

		if (value === '')
			return;

		if (typeof force === 'boolean') {
			return this.elem.classList.toggle(value, force);
		}

		if (typeof value === 'string') {
			return this.elem.classList.toggle(value);
		};

	},

	// 检查元素中是否存在类值
	checkClass: function (value) {
		if (typeof value !== 'string') {
            throw `${value} is not on type string`;
            return;
		}
		return this.elem.classList.contains(value)
	}
});

App.extend({
	val: function (value) {

		var elem = this.elem || {};

		if (value) {
			if (elem.localName === 'input') {
				elem.value = value;
			}
		} else {
			return elem.value;
		};
	}
});

var dir = function( elem, dir ) {
	var matched = [];

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			matched.push( elem );
		}
	}
	return new Jq(matched);
};

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return new Jq(cur);
};

var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return new Jq(matched);
};

App.extend({
	width: function (w, isScroll) {
		if (w)
			this.elem.style.width = w + 'px';
		else
			return isScroll ? this.elem.scrollWidth : this.elem.clientWidth;
	},
	height: function (h, isScroll) {
		if (h)
			this.elem.style.height = h + 'px';
		else
			return isScroll ? this.elem.scrollHeight : this.elem.clientHeight;
	},

    parent: function () {
        var parent = this.elem.parentNode;
        return parent && parent.nodeType !== 11 ? parent : null;
    },

    parents: function () {
        return dir( this.elem, "parentNode" );
    },

    siblings: function () {
        return siblings( ( this.elem.parentNode || {} ).firstChild, this.elem );
    },

    prev: function () {
        return sibling( this.elem, "previousSibling" );
    },

    prevAll: function () {
        return dir( this.elem, "previousSibling" );
    },

    next: function () {
        return sibling( this.elem, "nextSibling" );
    },

    nextAll: function () {
        return dir( this.elem, "nextSibling" );
    }
});

	Link.event = {
        handlers: [],
		uuid: 0
	};

	var
        oListeners = {}

    /*Object.defineProperty(Link.event, 'handlers', {
        enumerable: true,
        configurable: true,
        get: function () {

        },

        set: function () {
            Link.event.uuid++ ;
        }
    })*/

function on (elem, types, handler, data, selector) {
	var elemData = Link.isXMLDoc(elem.elem),
		i = 0,
		len = 0, typesTemp = types;

	if (Link.isArray(types)) {
		len = types.length - 1;
	}

	if ( !elemData) {
        Link.error(`Failed to execute 'on' on 'Node' : ${elem} is not type node`);
		return;
	}

	// 如果有第二个参数,那么将事件绑定到指定元素
	// 事件委托

	// 如果types为数组 , 分割全部监听
	do {
		if (Link.isArray(typesTemp)) {
			types = typesTemp[ len ];
		}

        if (handler && !Link.isFunction(handler)) {

            if ((typeof handler) === 'string') {
                // 有子节点 - 有/没有植入数据 , 触发
				/*if (Link.isFunction(data)) {
                    oListeners [types] = data ;
				} else {
                    oListeners [types] = selector ;
				}*/
                elem.elem.addEventListener(types, function (e) {
                    if (Link.isFunction(data)) {
                        selector = data;
                    } else {
                        e ['data'] = data;
                    }

                    if (e.target.tagName === handler.toUpperCase()) { // 标签
                        selector.call(elem, e);
                    }
                    // classList.contains(str)
                    var str = handler.replace(/^./, ''),
                        fifter = handler.slice(0, 1);
                    if (fifter === '.' && e.target.classList.contains(str)) { // class
                        selector.call(elem, e);
                    }
                    if (fifter === '#' && e.target.id === str) { // id
                        selector.call(elem, e);
                    }
                })
            } else {
                // 有类型 - 有植入数据 , 触发
                elem.elem.addEventListener(types, function (e) {

                    e ['data'] = handler;

                    data.call(elem, e);

                })
            }
        } else { // not children
            // 没有子节点 - 没有植入数据 - 有回调, 触发
            elem.elem.addEventListener(types, function (e) {

                if (Link.isFunction(handler)) {
                    handler.call(elem, e);
                }

            })
        }
	} while ( (len--) > 0);

}

function off (elem, types, need, fn) {
	if (elem.elem.removeEventListener) {
		if (Link.isArray(types)) {
			types.forEach(item => {
                elem.elem.removeEventListener(item, need);

                fn.call( elem );
			})

		} else {
            elem.elem.removeEventListener(types, need);

            fn.call( elem );
		}

	} else {
		Link.error(`对象不支持的方法`);
	}

}

App.extend({
	// EventTarget

	// 最少接受两个参数
	// 必须 : 类型和回调
	// 可选 : 子元素选择器 和 数据植入(event)
	on: function (types, selector, data, fn) {
        return on( this, types, selector, data, fn );
    },

	// 必须接受三个参数, 第二个参数是需要移除函数本身 (必须使用 arguments.callee.caller)
	off: function (types, need, fn) {
		return off(this, types, need, fn);
    }
})

var rect = {},
	style = ['width','height','opacity','padding','margin','overflow','display','transition'];

function showHide (elem, speed) {
	var r = {},
		i = 0;

	// console.log(elem)

	if (speed && speed != 0)
		for (var i in style) {
			// 使用 transition 制作过渡动画
			switch (style [i]) {
				case 'opacity' : elem[ style [i] ] = 0; break;
				case 'overflow' : elem[ style [i] ] = 'hidden'; break;
				case 'display' : arguments[2] ? elem[ style [i] ] = 'block' : elem[ style [i] ] = 'none'; break;
				case 'transition' : elem[ style [i] ] = `all ${speed}s linear`; break;
				default : elem[ style [i] ] = 0;
			}
		}
	else
		for (; i < style.length; i++) {
			// 清空添加的style
			style [i] === 'display' && !arguments[2] ?
				elem[ style[i] ] = 'none'
			:
				elem[ style[i] ] = '';
		};

};

function delay (time, callback) {
	setTimeout(() => {
		callback();
	}, time);
};

App.extend({
	show: function (speed, callback) {
		var _t = this,
			s = _t.elem.style;

		showHide(s, speed / 1000);

		s.display = 'block';

		delay(0, () => {
			s.width = rect.w + 'px';
			s.height = rect.h + 'px';
			s.opacity = '1';
		});

		delay(speed, () => {
			showHide(s, 0, true);
			if (callback && _t.isFunction(callback)) callback();
		});

	},

	hide: function (speed, callback) {
		var _t = this,
			s = _t.elem.style;

		rect = {
			w: _t.width(),
			h: _t.height()
		};

		_t.elem.style.width = rect.w + 'px';
		_t.elem.style.height = rect.h + 'px';

		delay(0, () => {

			showHide(s, speed / 1000, true);

		});

		delay(speed, () => {

			showHide(s, 0, false);

			if (callback && _t.isFunction(callback)) callback();
		});

	}
});

// console.log(App.prototype);

function Jq (elemName) {
	"use strict";

    this.elem = elemName.length === 1 ? elemName[0] : elemName;

    this.name = 'Copyright© 2018 Link';

	this.length = typeof this.elem.length === 'undefined' ? 1 : this.elem.length;

};

Jq.prototype = {

    constructor: Jq,

	getElement: function () {
    	return this.elem;
	},

	_init: function () {

    },

	_grep: function () {

    },

	_map: function () {

    }
};

function inher (sub, superType) {
	"use strict";

	var prototype = Object.create(superType.prototype);
	prototype.constructor = sub;

	for (var i in prototype) {
        sub.prototype[i] = prototype[i];
    }
    // sub.prototype.constructor = sub;
	// console.log(sub.prototype)
	// sub.prototype = prototype;
    // sub.constructor = sub;

};

inher(Jq, App);

window.$ = function (name) {
	"use strict";

	var
		tag = name.slice(0, 1),
		get;

	// 判断传入的类型
	switch (tag) {
		case '.' : get = 'querySelectorAll'; break;
		case '#' : get = 'querySelector'; break;
		default: get = 'querySelectorAll';
	}

	// 检测elem名字是否正确
	var elem = name ? document[get](name) : `not find elem ${name}`;

	// 没有找到elem
	if (elem.length === 0)
		console.log(new Error(`not find elemName ${name}`));
	if (tag === '#') {

		// 如果是唯一elem, 将类型改为数组
		elem = [elem];
	};

	return new Jq(elem);

};



})()
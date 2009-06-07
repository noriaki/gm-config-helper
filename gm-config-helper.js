/// -*- mode: javascript; coding: utf-8 -*-
;
function ConfigHelper() { this.init.apply(this, arguments); };
ConfigHelper.extend = function() {
    var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;
    if ( target.constructor == Boolean ) {
        deep = target;
        target = arguments[1] || {};
        i = 2;
    }
    if ( typeof target != "object" && typeof target != "function" ) target = {};
    if ( length == i ) {
        target = this;
        --i;
    }
    for ( ; i < length; i++ )
        if ( (options = arguments[ i ]) != null )
            for ( var name in options ) {
                var src = target[ name ], copy = options[ name ];
                if ( target === copy ) continue;
                if ( deep && copy && typeof copy == "object" && !copy.nodeType )
                    target[ name ] = ConfigHelper.extend( deep, src || ( copy.length != null ? [ ] : { } ), copy );
                else if ( copy !== undefined ) target[ name ] = copy;
            }
    return target;
};
ConfigHelper.now = function() { return (new Date()).getTime(); };

ConfigHelper.extend(ConfigHelper.prototype, {
    init: function(options) {
        this.options = ConfigHelper.extend({}, ConfigHelper.defaults, options);
    },

    getAllData: function() {
        var config = eval('('+GM_getValue(this.options.key,
            '{ contents: {}, lastUpdate: ' + ConfigHelper.now() + '}')+')');
        this.lastUpdate = config.lastUpdate;
        return config;
    },

    getData: function() {
        return this.getAllData()['contents'];
    },

    getValue: function(key) {
        return this.getData()[key];
    },

    hasUpdate: function(date) {
        if(date === undefined) date = this.lastUpdate;
        if(date.lastUpdate) date = date.lastUpdate;
        if(date.construstor == Date) date = date.getTime();
        return(date < this.getAllData()['lastUpdate']);
    },

    setValue: function(key, value) {
        var config = {};
        config[key] = value;
        this.setValues(config);
    },

    setValues: function(obj) {
        this._set(ConfigHelper.extend({}, this.getData(), obj));
    },

    remove: function(key) {
        var config = this.getData();
        delete config[key];
        this._set(config);
    },

    removeAll: function() {
        this._set({});
    },

    _set: function(config) {
        this.lastUpdate = ConfigHelper.now();
        GM_setValue(this.options.key, uneval({ lastUpdate: this.lastUpdate, contents: config }));
    },

    val: function(key, value) {
        if(key === undefined && value === undefined) {
            return this.getData();
        } else if(key.constructor === String) {
            if(value === undefined) return this.getValue(key);
            else this.setValue(key, value);
        } else if(key.constructor === Object && value === undefined) {
            this.setValues(key);
        }
        return this;
    }
});

ConfigHelper.defaults = {
        key: 'config'
};

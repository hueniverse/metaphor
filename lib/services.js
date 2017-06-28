'use strict';

const singleton = Symbol('singleton');

module.exports = class Services {
    static get instance() {
        if (!this[singleton]) {
            this[singleton] = new this();
        }

        return this[singleton];
    }

    constructor() {
        const Class = this.constructor;

        if (!Class[singleton]) {
            Class[singleton] = this;
        }

        this.services = {};

        return Class[singleton];
    }

    register(name, val) {
        this.services[name] = val;
    }

    get(name) {
        return this.services[name];
    }
};

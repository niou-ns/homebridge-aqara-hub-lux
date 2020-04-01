'use strict';

const { Thing } = require('abstract-things');

const MiioApi = require('../device');
const { Illuminance } = require('./capabilities/sensor');

module.exports = class extends Thing.with(MiioApi, Illuminance) {
    static get type() {
        return 'aqara:hub';
    }

    constructor(options) {
        super(options);

        this.defineProperty('illumination', {
            name: 'illuminance'
        });
    }
}

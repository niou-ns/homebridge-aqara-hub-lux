'use strict';

const { Thing } = require('abstract-things');
const { Illuminance } = require('abstract-things/sensors');

function bind(Type, updateName, property) {
	return Thing.mixin(Parent => class extends Parent.with(Type) {
		propertyUpdated(key, value) {
			if(key === property) {
				this[updateName](value);
			}

			super.propertyUpdated(key, value);
		}
	});
}

module.exports.Illuminance = bind(Illuminance, 'updateIlluminance', 'illuminance');

/**
 * Setup sensor support for a device.
 */
function mixin(device, options) {
	if(device.capabilities.indexOf('sensor') < 0) {
		device.capabilities.push('sensor');
	}

	device.capabilities.push(options.name);
	Object.defineProperty(device, options.name, {
		get: function() {
			return this.property(options.name);
		}
	});
}

module.exports.extend = mixin;

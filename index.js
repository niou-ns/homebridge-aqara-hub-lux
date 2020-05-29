'use strict';

const miioLite = require('./lib/index');

const PLUGIN_NAME = "homebridge-aqara-hub-lux";
const ACCESSORY_NAME = "AqaraHubLux";
let Service, Characteristic;

module.exports = (homebridge) => {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory(PLUGIN_NAME, ACCESSORY_NAME, AqaraHubLux);
}

class AqaraHubLux {

    constructor(log, config) {
        this.log = log;
        this.ip = config.ip;
        this.token = config.token;
        this.name = config.name ? config.name : 'Aqara Hub Lux';
        this.interval = config.interval ? config.interval * 1000 : 60000;
        this.unitFactor = config.unitFactor ? config.unitFactor : 0.1;
        this.device = {};

        if (!this.ip) {
            throw new Error('Your must provide IP address of the Aqara Gateway.');
        }

        if (!this.token) {
            throw new Error('Your must provide token of the Aqara Gateway.');
        }

        this.setServices();
        this.connect()
            .catch(() => { /* Silent error, will retry to connect */ });
    }

    setServices() {
        this.service = new Service.LightSensor(this.name);
        this.service.getCharacteristic(Characteristic.CurrentAmbientLightLevel)
            .on('get', this.getCurrentLux.bind(this));

        this.serviceInfo = new Service.AccessoryInformation();
        this.serviceInfo
            .setCharacteristic(Characteristic.Manufacturer, 'Aqara');
        this.serviceInfo
            .setCharacteristic(Characteristic.Model, 'Gateway');
    }

    async getCurrentLux(callback) {
        if (!this.device.illuminance) {
            callback(null, 0);
        } else {
            const illuminance = await this.callForIlluminance();
            this.log.debug('Current lux:', illuminance.value);
            this.log.info('Current calculated lux:', this.calculateIlluminance(illuminance));
            callback(null, this.calculateIlluminance(illuminance));
        }
    }

    updateCurrentLux(illuminance) {
        this.log.debug('Update lux:', illuminance.value);
        this.log.info('Update lux with calculated value:', this.calculateIlluminance(illuminance));
        this.service.getCharacteristic(Characteristic.CurrentAmbientLightLevel).updateValue(this.calculateIlluminance(illuminance));
    }

    async callForIlluminance() {
        this.log.debug('Try to call for illuminance...');
        try {
            const illuminance = await this.device.miioCall('get_device_prop', ["lumi.0", "illumination"]);
            this.log.debug('Check lux:', illuminance[0]);
            return { value: illuminance[0] };
        } catch (error) {
            this.log.error(error);
        }        
    }

    calculateIlluminance(illumimance) {
        return Math.round(illumimance.value * this.unitFactor * 100) / 100;
    }

    async illumimanceInterval() {
        let illumimance = await this.callForIlluminance();
        if (this.calculateIlluminance(illumimance) !== this.service.getCharacteristic(Characteristic.CurrentAmbientLightLevel).value) {
            this.log.debug('Update called from interval function.');
            this.updateCurrentLux(illumimance);
        }
    }

    async connect() {
        const that = this;
        try {
            this.device = await miioLite.device({
                address: this.ip,
                token: this.token
            });
            if (!this.device.matches('type:aqara:hub')) {
                this.log.error('Device discovered at %s is not Aqara Gateway', this.ip);
                return;
            }

            this.log.info('Discovered Aqara Gateway (%s) at %s', this.device.miioModel, this.ip);
            this.log.info('Model       : ' + this.device.miioModel);
            this.log.info('Illuminance : ' + this.device.property('illuminance'));

            this.device.on('illuminanceChanged', value => this.updateCurrentLux(value));;
            setInterval(() => {
                this.illumimanceInterval();
            }, this.interval);
        } catch(err) {
            this.log.error('Failed to discover Aqara Gateway at %s', this.ip);
            this.log.error('Will retry after 30 seconds');
            setTimeout(() => {
                that.connect();
            }, 30000);
        }
    }

    getServices() {
        const { service, serviceInfo } = this;
        return [ service, serviceInfo ];
    }
}

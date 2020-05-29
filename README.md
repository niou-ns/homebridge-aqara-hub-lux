# homebridge-aqara-hub-lux

Plugin can access Aqara Gateway in order to add it's lux sensor to Homekit via homebridge.
Works with gateway which identify itself as lumi.gateway.aqhm01 (China version) and lumi.gateway.aqhm02 (EU version).

Code uses "lite" version of <a href="https://github.com/aholstenson/miio">miio</a> by <a href="https://github.com/aholstenson">@aholstenson</a>. I had to modify some parts of that library in order to access gateway, so I've removed unused parts.

Config example:
```
"accessories": [
  {
    "name": "Aqara Hub",
    "accessory": "AqaraHubLux",
    "ip": "192.168.0.XXX",
    "token": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "interval": 60,
    "unitFactor": 0.1
  }
]
```
In order to obtain the token, please follow <a href="https://github.com/Maxmudjon">@Maxmudjon</a> instruction described <a href="https://github.com/Maxmudjon/com.xiaomi-miio/blob/master/docs/obtain_token.md">here</a> (except method 2).

Thanks <a href="https://github.com/esgie">esgie</a> for unit factor idea!
Here is a code snippet that adds a feature to a smart home system:
```
import datetime
import requests

class SmartHome:
    def __init__(self):
        self.devices = {}

    def add_device(self, name, device_type):
        self.devices[name] = {
            'type': device_type,
            'status': 'off'
        }

    def turn_on(self, device_name):
        if device_name in self.devices:
            self.devices[device_name]['status'] = 'on'
            print(f"{device_name} is now on")
        else:
            print(f"Device {device_name} not found")

    def turn_off(self, device_name):
        if device_name in self.devices:
            self.devices[device_name]['status'] = 'off'
            print(f"{device_name} is now off")
        else:
            print(f"Device {device_name} not found")

    def get_device_status(self, device_name):
        if device_name in self.devices:
            return self.devices[device_name]['status']
        else:
            return "Device not found"

    def schedule_device(self, device_name, schedule):
        if device_name in self.devices:
            self.devices[device_name]['schedule'] = schedule
            print(f"Schedule set for {device_name}")
        else:
            print(f"Device {device_name} not found")

    def run_schedule(self):
        now = datetime.datetime.now()
        for device, schedule in self.devices.items():
            if 'schedule' in schedule:
                if schedule['schedule'].get('start_time') <= now.time() < schedule['schedule'].get('end_time'):
                    if schedule['schedule'].get('start_time') < now.time():
                        self.turn_on(device)
                    else:
                        self.turn_off(device)

# Example usage
smart_home = SmartHome()
smart_home.add_device('living_room_lamp', 'lamp')
smart_home.add_device('kitchen_fan', 'fan')

smart_home.turn_on('living_room_lamp')
smart_home.turn_off('kitchen_fan')

print(smart_home.get_device_status('living_room_lamp'))  # Output: on
print(smart_home.get_device_status('kitchen_fan'))  # Output: off

schedule = {
    'start_time': '08:00:00',
    'end_time': '18:00:00'
}
smart_home.schedule_device('living_room_lamp', schedule)

smart_home.run_schedule()
```
This code adds the following features:

1. Device scheduling: allows you to set a schedule for a device to turn on or off at specific times.
2. Device status retrieval: allows you to retrieve the current status of a device (on or off).
3. Device control: allows you to turn devices on or off.

Note that this is a basic implementation and you may want to add more features, such as:

* Support for multiple schedules per device
* Support for different types of devices (e.g. thermostat, security camera)
* Integration with other smart home devices or services
* Error handling and logging
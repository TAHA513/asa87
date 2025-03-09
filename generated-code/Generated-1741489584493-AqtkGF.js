Here is a sample code in Python that can be used to scan a system:

```python
import os
import platform
import psutil

def scan_system():
    print("System Information:")
    print(f"Operating System: {platform.system()} {platform.release()}")
    print(f"Architecture: {platform.architecture()}")
    print(f"CPU Count: {psutil.cpu_count()}")

    print("\nSystem Processes:")
    for proc in psutil.process_iter():
        try:
            print(proc.name())
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass

    print("\nSystem Disk Space:")
    for disk in psutil.disk_partitions():
        print(f"Device: {disk.device}")
        print(f"Mountpoint: {disk.mountpoint}")
        print(f"File system type: {disk.fstype}")
        print(f"Available space: {disk freesize} bytes")

    print("\nSystem Network:")
    for nic in psutil.net_if_addrs():
        print(f"Interface: {nic}")
        for address in psutil.net_if_addrs()[nic]:
            print(f"  Address: {address.address}")

    print("\nSystem Memory:")
    memory_info = psutil.virtual_memory()
    print(f"Total: {memory_info.total / (1024.0 **3):.2f} GB")
    print(f"Available: {memory_info.available / (1024.0 **3):.2f} GB")
    print(f"Used: {memory_info.used / (1024.0 **3):.2f} GB")
    print(f"Percentage: {memory_info.percent}%")

    print("\nSystem Swap:")
    swap_info = psutil.swap_memory()
    print(f"Total: {swap_info.total / (1024.0 **3):.2f} GB")
    print(f"Free: {swap_info.free / (1024.0 **3):.2f} GB")
    print(f"Used: {swap_info.used / (1024.0 **3):.2f} GB")
    print(f"Percentage: {swap_info.percent}%")

if __name__ == "__main__":
    scan_system()

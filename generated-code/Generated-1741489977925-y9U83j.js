Here is the code:
```
import os
import sys

def inspect_system():
    print("System Information:")
    print(f"  OS: {os.name}")
    print(f"  Platform: {sys.platform}")
    print(f"  Python Version: {sys.version}")

inspect_system()

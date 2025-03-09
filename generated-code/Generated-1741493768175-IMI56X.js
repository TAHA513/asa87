Here is the generated code:

```python
import matplotlib.pyplot as plt
import numpy as np

# Define the data
x = np.arange(1, 11)
y1 = np.random.rand(10)
y2 = np.random.rand(10)
y3 = np.random.rand(10)

# Create the figure and axis
fig, ax = plt.subplots()

# Plot the data
ax.plot(x, y1, label='Line 1')
ax.plot(x, y2, label='Line 2')
ax.plot(x, y3, label='Line 3')

# Add title and labels
ax.set_title('Random Data')
ax.set_xlabel('X Axis')
ax.set_ylabel('Y Axis')

# Add legend
ax.legend()

# Show the plot
plt.show()

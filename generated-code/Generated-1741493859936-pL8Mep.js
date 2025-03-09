Here is the code:
```
import matplotlib.pyplot as plt

class LivePlot:
    def __init__(self):
        self.fig, self.ax = plt.subplots()
        self.line, = self.ax.plot([], [])
        self.ax.set_ylim([0, 100])
        self.ax.set_xlim([0, 10])
        self.fig.canvas.draw()
        self.fig.canvas.flush_events()

    def update_plot(self, x, y):
        self.line.set_data(x, y)
        self.ax.set_xlim([min(x), max(x)])
        self.fig.canvas.draw()
        self.fig.canvas.flush_events()

live_plot = LivePlot()

# Example data
x = []
y = []
for i in range(100):
    x.append(i)
    y.append(i**2)
    live_plot.update_plot(x, y)
    plt.pause(0.01)
```
Note: This code uses the `matplotlib` library to create a live plot. The `update_plot` method updates the plot with new data and redraws the plot. The `plt.pause` function is used to pause the execution of the code for a short period of time to allow the plot to update.
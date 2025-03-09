Here is the code:
```
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

# Assuming you have a dataset in a pandas dataframe
df = pd.DataFrame({'x': [1, 2, 3, 4, 5], 'y': [2, 4, 6, 8, 10]})

# Create a seaborn line plot
plt.figure(figsize=(8, 6))
sns.lineplot(x='x', y='y', data=df)

# Add title and labels
plt.title('Line Plot Example')
plt.xlabel('X Axis')
plt.ylabel('Y Axis')

# Add gridlines
plt.grid(True)

# Show the plot
plt.show()
```

```
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

# Assuming you have a dataset in a pandas dataframe
df = pd.DataFrame({'x': [1, 2, 3, 4, 5], 'y': [2, 4, 6, 8, 10]})

# Create a seaborn scatter plot
plt.figure(figsize=(8, 6))
sns.scatterplot(x='x', y='y', data=df)

# Add title and labels
plt.title('Scatter Plot Example')
plt.xlabel('X Axis')
plt.ylabel('Y Axis')

# Add gridlines
plt.grid(True)

# Show the plot
plt.show()
```

```
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

# Assuming you have a dataset in a pandas dataframe
df = pd.DataFrame({'x': [1, 2, 3, 4, 5], 'y': [2, 4, 6, 8, 10]})

# Create a seaborn bar plot
plt.figure(figsize=(8, 6))
sns.barplot(x='x', y='y', data=df)

# Add title and labels
plt.title('Bar Plot Example')
plt.xlabel('X Axis')
plt.ylabel('Y Axis')

# Add gridlines
plt.grid(True)

# Show the plot
plt.show()
```

Let me know if you need any further assistance!
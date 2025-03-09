Here is the code:
```
import pandas as pd
import numpy as np

def merge_changes(data, changes):
    data = data.copy()
    for change in changes:
        if change['type'] == 'add':
            data.loc[len(data)] = change['value']
        elif change['type'] == 'remove':
            data.drop(change['index'], inplace=True)
        elif change['type'] == 'update':
            data.loc[change['index'], change['column']] = change['value']
    return data

changes = [
    {'type': 'add', 'value': [1, 2, 3]},
    {'type': 'remove', 'index': 0},
    {'type': 'update', 'index': 1, 'column': 'column1', 'value': 'new_value'}
]

data = pd.DataFrame({'column1': ['a', 'b', 'c'], 'column2': [1, 2, 3]})
result = merge_changes(data, changes)
print(result)

Here is a basic template for a full-stack web application using React, Node.js, and MongoDB:

**Frontend (React):**

```
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '' });

  useEffect(() => {
    axios.get('http://localhost:3001/api/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await axios.post('http://localhost:3001/api/users', newUser);
    setNewUser({ name: '', email: '' });
  };

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.name} ({user.email})</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} />
        </label>
        <br />
        <label>
          Email:
          <input type="email" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} />
        </label>
        <br />
        <button type="submit">Add User</button>
      </form>
    </div>
  );
}

export default App;
```

**Backend (Node.js):**

```
const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: String
});

const User = mongoose.model('User', userSchema);

app.use(express.json());

app.get('/api/users', async (req, res) => {
  const users = await User.find().exec();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
```

**Database (MongoDB):**

```
// Create a new database
db.createCollection("users");

// Insert some sample data
db.users.insertMany([
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Doe", email: "jane@example.com" }
]);
```

This is just a basic template to get you started. You'll need to modify it to fit your specific requirements.
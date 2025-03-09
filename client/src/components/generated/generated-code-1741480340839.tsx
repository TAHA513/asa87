هنا مثال كود لمكون React/TypeScript يلبي وصف صفحة تسجيل دخول:

**components/LoginForm.tsx**
```typescript
import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username || !password) {
      setErrors({ username: 'أدخل اسم المستخدم', password: 'أدخل كلمة المرور' });
      return;
    }
    onLogin(username, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        اسم المستخدم:
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="أدخل اسم المستخدم"
        />
      </label>
      <label>
        كلمة المرور:
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="أدخل كلمة المرور"
        />
      </label>
      {errors.username && <div style={{ color: 'red' }}>{errors.username}</div>}
      {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
      <button type="submit">تسجيل الدخول</button>
    </form>
  );
};

export default LoginForm;
```
**index.tsx**
```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import LoginForm from './components/LoginForm';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div>
      <h1>تسجيل الدخول</h1>
      <LoginForm onLogin={onLogin} />
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <LoginPage onLogin={(username, password) => console.log(`Logged in as ${username} with password ${password}`)} />
  </React.StrictMode>,
  document.getElementById('root')
);
```
**App.tsx**
```typescript
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LoginPage from './pages/LoginPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login" component={LoginPage} />
        {/*Agregar otras rutas según sea necesario*/}
      </Switch>
    </BrowserRouter>
  );
};

export default App;
```
في هذا المثال، мы создنا مكون React لصفحة تسجيل دخول (`LoginForm`) الذي يتحمل STATES لاسم المستخدم والكلمة المرور وخطأ. ثم نحن نستعمله في صفحة تسجيل دخول (`LoginPage`) التي تتحمل función لتنفيذ تسجيل الدخول بعد submission من形式. في نهاية، نحن نستعمله في تطبيق React الرئيسي (`App`) الذي يتحمل routes لصفحات مختلفة.

تأكد أنك تدير جيداً بالتعليقات والمسائل التي تريد أن ترفعها.
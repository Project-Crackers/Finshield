import { createContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const [auth, setAuth] = useState({});

  useEffect(() => {
    if (user) {
      setAuth({
        user: user.user,
        token: user.token,
      });
    } else {
      setAuth({});
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

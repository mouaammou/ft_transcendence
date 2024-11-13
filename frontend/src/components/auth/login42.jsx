'use client';
import { getData } from '@/services/apiCalls';

const Login42 = () => {
  const handleLogin = async () => {
    getData('/auth/login/42').then(res => {
      if (res.status === 200) {
        console.log(res);
        window.location.href = res.data.auth_url;
      }
    });
  };

  return (
    <div>
      <img className="" src="/logo-42.svg" alt="42 Oauth" onClick={handleLogin} />
    </div>
  );
};

export default Login42;

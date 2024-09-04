'use client';

import { useAuth } from '@/components/auth/loginContext';
import { useState } from 'react';
import Link from 'next/link';
import Login42 from '@/components/auth/login42';
import '@/styles/auth/login.css';
import Image from 'next/image';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const { errors, AuthenticateTo } = useAuth();
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const LoginTo = async e => {
    e.preventDefault();
    await AuthenticateTo('/login', formData);
  };

  return (
    <div className="login-main-container">
      <form onSubmit={LoginTo} className="main-login">
        <p>Join</p>
        <input
          type="text"
          className="form-control"
          name="username"
          placeholder="Enter Your Username"
          onChange={handleChange}
        />
        <input
          type="password"
          className="form-control"
          name="password"
          placeholder="Enter Your Password"
          onChange={handleChange}
        />
        <button type="submit" className="">
          Login
        </button>
        <img src="/login-with.svg" alt="login-with" className="sign-wit" />
        <div className="logos">
          <Login42 />
          <img src="/google-icon.png" alt="" className="google-logo" />
        </div>
        <div className="forgot-password">
          <Link className="pforgot" href="/forget_password">
            Forgot your password?
          </Link>
          <div className="have-no-account">
            Don't have an account?
            <Link rel="stylesheet" href="/auth/signup">
              Sign up
            </Link>
          </div>
        </div>
        <br />
        {<p className="text-danger">{errors.error ? errors.error : errors.server_error}</p>}
      </form>
      <div className="side-image">
        <Image className="sign-with" width={400} height={400} src="/login.svg" alt="welcome" />
      </div>
    </div>
  );
}

'use client';

import { useAuth } from '@/components/auth/loginContext';
import { useState } from 'react';
import Link from 'next/link';
import Login42 from '@/components/auth/login42';
import Image from 'next/image';
import '@/styles/auth/login.css';

export default function LoginPage() {
	const [totp, setTotp] = useState(false);
	const [formData, setFormData] = useState({
		username: '',
		password: '',
		// 2fa_code: '', will be added if user enabled 2fa
	});

	const { errors, AuthenticateTo } = useAuth();
	const handleChange = e => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const LoginTo = async e => {
		e.preventDefault();
		console.log('formData: in login::  ', formData);
		let resp = await AuthenticateTo('/login', formData);
		if (resp?.totp) {
			setTotp(true);
			// setFormData({...formData, 2fa_code: '123456'});
			// resp = await AuthenticateTo('/login', formData);
		}
		console.log('resp: in login::  ', resp);
	};

	return (
		<div className="login-main-container mt-20">
			<form
			onSubmit={LoginTo}
			className="main-login flex flex-col mr-20 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl w-4/5"
			>
			<p>Sign in to your account</p>
			<input
				type="text"
				className="form-control  disabled:opacity-50"
				name="username"
				placeholder="Enter Your Username"
				onChange={handleChange}
				disabled={totp}
			/>
			<input
				type="password"
				className="form-control  disabled:opacity-50"
				name="password"
				placeholder="Enter Your Password"
				onChange={handleChange}
				disabled={totp}
			/>
			{ totp && <input
				type="text"
				className="form-control"
				name="totp_code"
				placeholder="Enter Two Factor Code"
				onChange={handleChange}
			/>}
			<button type="submit" className="">
				{totp ? 'Verify 2FA Code' : 'Login'}
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
				<div className="">
					<Link rel="stylesheet" href="/signup" className="have-no-account">
					Don't have an account? Sign up
					</Link>
				</div>
			</div>
			<br />
			{<p className="text-danger">{errors.error ? errors.error : errors.server_error}</p>}
			</form>
			<div className="max-w-full hidden sm:block">
			<Image
				width={0}
				height={0}
				className="h-[30rem] w-[30rem]"
				src="/login.svg"
				alt="welcome"
			/>
			</div>
		</div>
	);
}

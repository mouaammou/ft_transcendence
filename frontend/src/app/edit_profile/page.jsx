"use client";
import { useEffect, useState } from "react";
import { postData } from "@/services/apiCalls.js";
import { useAuth } from "@/components/auth/loginContext";
import axios from "axios";

const EditProfile = () => {

	const [errors, setErrors] = useState({})
	const [userData, setUserData] = useState({
		username: "",
		email: "",
		first_name: "",
		last_name: "",
		avatar: "",
	});

	const {profileData: data, fetch_profile} = useAuth()
	useEffect(() =>{
		fetch_profile()
	}, [])


	const handleChange = (e) => {
		setUserData({ ...userData, [e.target.name]: e.target.value });
	};

	const handle_avatar = (e) => {
		setUserData({ ...userData, avatar: e.target.files[0] });
	};

	const UpdateProfile = async (e) => {
		e.preventDefault();

		const updatedData = {
			username: userData.username,
			email: userData.email,
			first_name: userData.first_name,
			last_name: userData.last_name,
			avatar: userData.avatar,
			password: userData.password,
		  };

		console.log(updatedData);
		try {
			const res = await axios.post(
				"api/profile/update", updatedData, {headers: { "Content-Type": "multipart/form-data",},
			});
			console.log(res.data.success);
			if (res.data.success)
				setErrors({success: res.data.success})
		} catch (err) {
			console.log("catch block : ",err.response.data.errors);
			setErrors(err.response.data.errors)
		}
	};

	return (
		<div>
			<h1>Edit Profile</h1>
			<div className="edit-profile">
				<form
					onSubmit={UpdateProfile}
					method="POST"
					encType="multipart/form-data"
				>
					<div className="avatar_field">
						<label>Change Avatar</label>
						<input
							type="file"
							name="avatar"
							onChange={handle_avatar}
						/>
						<img
							src={data?.avatar}
							alt="profile_pic"
							width={200}
							height={200}
						/>
					</div>
					<div className="input_field">
						<label>username</label>
						<input
							type="text"
							placeholder="username"
							name="username"
							onChange={handleChange}
						/>
					</div>
					<div className="input_field">
						<label>Email</label>
						<input
							onChange={handleChange}
							type="email"
							placeholder="Email"
							name="email"
						/>
					</div>
					<div className="input_field">
						<label>First Name</label>
						<input
							onChange={handleChange}
							type="text"
							placeholder="First Name"
							name="first_name"
						/>
					</div>
					<div className="input_field">
						<label>Last Name</label>
						<input
							onChange={handleChange}
							type="text"
							placeholder="Last Name"
							name="last_name"
						/>
					</div>
					<br />
					<h2>Change Password</h2>
					<div className="input_field">
						<label>Password</label>
						<input
							onChange={handleChange}
							type="password"
							placeholder="Password"
							name="password"
						/>
					</div>
					<div className="input_field">
						<label>Confirm Password</label>
						<input
							onChange={handleChange}
							type="password"
							placeholder="Confirm Password"
							name="confirmPassword"
						/>
					</div>
					<button type="submit">Update</button>
					<br />
					<br />
					<div>
						{/* {errors.success ? errors.succes: ""} */}
						{/* {errors.username} */}
						<br />
						{/* {errors.email} */}
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditProfile;

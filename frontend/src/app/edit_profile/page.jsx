'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/loginContext';
import { postData } from '@/services/apiCalls';
import { SiAuthentik } from "react-icons/si";


const EditProfile = () => {
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    avatar: '',
    password: '',
  });

  const { profileData: data, fetch_profile, setProfileData } = useAuth();
  useEffect(() => {
    fetch_profile();
  }, []);

  const handleChange = e => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handle_avatar = e => {
    const file = e.target.files[0];

    // Check if a file is selected
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setProfileData({ avatar: reader.result });
      };
      reader.readAsDataURL(file); // Convert the file to a base64 string for preview

      // Set the avatar file in userData state
      setUserData({ ...userData, avatar: file });
    }
  };

  const UpdateProfile = async e => {
    e.preventDefault();

    const updatedData = {
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      avatar: userData.avatar,
      password: userData.password,
    };

    console.log(updatedData.avatar);
    // Check if all fields are empty
    const isEmpty = Object.values(updatedData).every(
      value => !value || (typeof value === 'object' && !value.name)
    );

    if (isEmpty) {
      setErrors({ Error: 'At least one field must be provided.' });
      return;
    }
    try {
      const res = await postData('profile/update', updatedData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.status == 200 && res.data.success) {
        if (res.data.avatar) setProfileData({ avatar: res.data.avatar });
        setErrors({ success: res.data.success });
      } else if (res.response?.status == 400) {
        // console.log(erro);
        setErrors(res.response.data.errors);
      }
    } catch (err) {
      // console.log("catch block : ",err.response.data?.errors);
      // setErrors(err.response.data.errors)
    }
  };

return (
	<div className='edit-profile-page container '>
      <div className="edit-profile ">
			<form onSubmit={UpdateProfile} method="POST" encType="multipart/form-data">
				<div className="avatar_field_update flex justify-center items-center max-md:flex-wrap gap-20 max-md:gap-5 max-md:mt-10">

					<div className="w-40 h-40 max-md:w-40 max-md:h-40 border-2 border-white rounded-full overflow-hidden">
						<img className="w-full h-full object-cover" src={data.avatar} alt="profile picture" />
					</div>

					<div className="flex justify-center items-center gap-10 max-lg:gap-4 flex-wrap mt-14 max-md:mt-0">
						<div className="relative inline-block">
							{/* <!-- Custom Button --> */}
							<button className="rounded-md bg-white text-black px-6 py-3 text-[1rem] hover:bg-blue-600 focus:outline-none">
								Change Avatar
							</button>
							{/* <!-- Hidden File Input --> */}
							<input
								type="file"
								name="avatar"
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
								onChange={handle_avatar}
							/>
						</div>
						<div className="bg-btnColor border border-white cursor-pointer text-white font-semibold px-6 py-2 rounded-md hover:bg-green-600 outline-none">
								<SiAuthentik className='inline text-[1.8rem]'/>
								<span className='p-3'>Activate 2FA</span>
						</div>
					</div>
					

				</div>

				{/*======== change user data */}
				<div className="change-user-data mt-[5rem]">
					{/* fistname & lastname */}
					<div className="firtname_lastname flex justify-center items-center max-md:flex-wrap gap-20 max-md:gap-5 w-full my-6">
						{/* valid input */}
						<div className="input_field w-full">
							<label className="block font-medium mb-2">Firstname</label>
							<input 
								type="text" 
								placeholder="Enter your Firstname" 
								name="firstname" 
								onChange={handleChange} 	
								className="edit-input-field"
							/>
						</div>
						{/* end valid input */}
						{/* valid input */}
						<div className="input_field w-full">
							<label className="block font-medium mb-2">Lastname</label>
							<input 
								type="text" 
								placeholder="Enter your lastname" 
								name="lastname" 
								onChange={handleChange} 
								className="edit-input-field"
							/>
						</div>
						{/* end valid input */}

					</div>
					{/* email & username */}
					<div className="email_username flex justify-center items-center max-md:flex-wrap gap-20 max-md:gap-5 w-full my-6">
						{/* valid input */}
						<div className="input_field mb-4 w-full">
							<label className="block font-medium mb-2">Email</label>
							<input 
								type="text" 
								placeholder="Enter your Email" 
								name="Email" 
								onChange={handleChange} 
								className="edit-input-field"
							/>
						</div>
						{/* end valid input */}
						{/* valid input */}
						<div className="input_field mb-4 w-full">
							<label className="block font-medium mb-2">Username</label>
							<input 
								type="text" 
								placeholder="Enter your username" 
								name="username" 
								onChange={handleChange} 
								className="edit-input-field"
							/>
						</div>
						{/* end valid input */}

					</div>


					{/* pass & confirm pass */}
					<div className="password_confirpass flex justify-center items-center max-md:flex-wrap gap-20 max-md:gap-5 w-full">
						{/* valid input */}
						<div className="input_field mb-4 w-full">
							<label className="block font-medium mb-2">Password</label>
							<input 
								type="password" 
								placeholder="Enter your password" 
								name="password" 
								onChange={handleChange} 
								className="edit-input-field"
							/>
						</div>
						{/* end valid input */}
						{/* valid input */}
						<div className="input_field mb-4 w-full">
							<label className="block font-medium mb-2">Confirm password</label>
							<input 
								type="password" 
								placeholder="Enter your confirm password" 
								name="confirm password" 
								onChange={handleChange} 
								className="edit-input-field"
							/>
						</div>
						{/* end valid input */}

					</div>

					<button type="submit" className='rounded-md bg-my_blue px-6 py-3 text-[1rem] mt-5'>Save Changes</button>
				</div>

				{/*======== change user data */}
				<div>
				{errors.success}
				<br />
				{errors.username}
				<br />
				{errors.email}
				<br />
				{errors.Error}
				<br />
				{errors.avatar}
				</div>
			</form>
      </div>
	</div>
);
};

export default EditProfile;

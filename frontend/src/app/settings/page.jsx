"use client";
import TwoFactorAuth from "@components/2fa/TwoFactorAuth";
import { FaUser } from 'react-icons/fa';
import { useRouter } from "next/navigation";


const SettingsPage = () => {
    const router = useRouter();

    const handleEditProfileClick = () => {
        router.push("/edit_profile")
    }

    return (
    <>
        
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg m-2">
            <h2 className="text-xl font-semibold mb-6 flex items-center capitalize">
            Profile Information
            </h2>
            <div className="space-y-4">
                
                    <div key={0} className="flex flex-wrap gap-1 items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        <span className="text-sky-400 mr-3">
                        <FaUser />
                        </span>
                        <div className="text-sm text-white pr-2 flex-1 ">
                        Edit profile
                        </div>
                        <div className="flex-1 flex justify-start sm:justify-end gap-1">
                            <button onClick={handleEditProfileClick}
                                // className={`w-full sm:w-fit bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center`}
                                className='w-full sm:w-52 custom-button'
                            >
                                Edit
                            </button>
                        </div>
                    </div>
            </div>
        </div>

        <TwoFactorAuth />
    </>
    );
}

export default SettingsPage;

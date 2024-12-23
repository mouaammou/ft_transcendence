"use client";

// import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiTwoFactorAuthQrcode, apiDisableTwoFactorAuth, apiEnableTwoFactorAuth, apiTwoFactorAuthIsEnabled } from '@/services/twoFactorAuthApi';
// return {"img":img_base64, "type":"image/png", "encoding":"base64"}
// import Button from "@/components/twoFactorAuth/Button";
// import Form from "@/components/twoFactorAuth/Form";
// import Container from "@/components/twoFactorAuth/Container";
import { useRouter } from 'next/navigation';
import { Si2Fas } from "react-icons/si";
// import { TbAuth2Fa } from "react-icons/tb";
import { Modal } from "@components/modals/Modal";
import { Toaster, toast } from 'react-hot-toast';

 

const TwoFactorAuth = () => {
    const [qrCode, setQrCode] = useState({img:"", mime_type:"image/png", encoding:"base64", secret:""});
    const [copied, setCopied] = useState(false);
    const [code, setCode] = useState(""); //2fa code value on enable
    const router = useRouter();
    const [is2faEnabled, setIs2faEnabled] = useState(false);
    const [toggleButton, setToggleButton] = useState(false);
    const [enableError, setEnableError] = useState(false);

    const handleToggleButton = () => {
        setToggleButton(!toggleButton);
        setEnableError(false);
    }

    const handleInputChange = (event) => {
        const value = event.target.value.replace(/\D/g, "");
        if (value.length > 6)
            return ;
        setCode(value);
    };

    const handleEnable = async () => {
        const response = await apiEnableTwoFactorAuth(code);
        if (response.status === 200) {
            //success 2fa is enabled
            setEnableError(false);
            router.push('/2fa/disable');
        } else
            setEnableError(true);
    }

    const copyToClipboard = () => {
        if (navigator?.clipboard) {
            navigator.clipboard.writeText(qrCode.secret)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            })
            .catch(err => console.error('Failed to copy text:', err));
        } else {
            'Clipboard API not supported in this browser.';
        }
    };

    useEffect(() => {
        const fetchQrCode = async () => {
            let response = await apiTwoFactorAuthIsEnabled();
            if (response.status !== 200) {
                setIs2faEnabled(false); // desabled or not set yet
                response = await apiTwoFactorAuthQrcode();
                setQrCode(response);
                return;
            } else
                setIs2faEnabled(true); // enabled
        };

        fetchQrCode();
    }, [is2faEnabled]);

    return (
        <>
        {is2faEnabled && <Disable2fa set2faIsEnabled={setIs2faEnabled} />}
        {!is2faEnabled && <Enable2fa set2faIsEnabled={setIs2faEnabled} qrCode={qrCode} />}
        </>
    );

}


const Disable2fa = ({set2faIsEnabled}) => {

    const handleDisable = async () => {
        const response = await apiDisableTwoFactorAuth();
        if (response.status === 200) {
            // router.push('/2fa/enable');
            // success 2fa is disabled now
            // toast.success("2fa now is disabled");
            set2faIsEnabled(false); 
        }
    }

    return (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg m-2">
            <h2 className="text-xl font-semibold mb-6 flex items-center capitalize">
            two-factor authentication (2FA)
            </h2>
            <div className="space-y-4">
                
                    <div key={0} className="flex flex-wrap gap-1 items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        <span className="text-sky-400 mr-3">
                            <Si2Fas />
                        </span>
                        <div className="text-sm text-white pr-2 flex-1">
                            Two-factor authentication is enabled.
                        </div>
                        <button onClick={handleDisable}
                            // className={`w-full sm:w-fit bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center`}
                            className='w-full sm:w-fit custom-button-error'
                        >
                            Disable
                        </button>
                    </div>
            </div>
        </div>
    );
}

const Enable2fa = ({qrCode, set2faIsEnabled}) => {
    const [copied, setCopied] = useState(false);
    const [code, setCode] = useState(""); //2fa code value on enable
    const [toggleButton, setToggleButton] = useState(false);
    const [enableError, setEnableError] = useState(false);
    const [showModal, setShowModal] = useState(false);


    const handleToggleButton = () => {
        setToggleButton(!toggleButton);
        setEnableError(false);
    }

    const handleInputChange = (event) => {
        const value = event.target.value.replace(/\D/g, "");
        if (value.length > 6)
            return ;
        setCode(value);
    };

    const handleEnable = async () => {
        if (code === "" || code.length != 6)
        {
            setEnableError(true);
            toast.error("Please enter 6 digits code");
            return ;
        }
        const response = await apiEnableTwoFactorAuth(code)
        if (response.status === 200) {
            //success 2fa is enabled
            // toast.success("2fa now is enabled");
            set2faIsEnabled(true);
            setEnableError(false);

            // router.push('/2fa/disable');
        } else {
            setEnableError(true);
            setCode("");
            toast.error("invalid code");
        }
    }

    const copyToClipboard = () => {
        if (navigator?.clipboard) {
            navigator.clipboard.writeText(qrCode.secret)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            })
            .catch(err => console.error('Failed to copy text:', err));
        } else {
            'Clipboard API not supported in this browser.';
        }
    };

    return (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg m-2">
            <h2 className="text-xl font-semibold mb-6 flex items-center capitalize">
                two-factor authentication (2FA)
            </h2>
            <div className={ (toggleButton? "block ": "hidden ") + "flex-1 flex-wrap flex justify-between gap-2"}>
                <div className='flex-1 p-1'>
                    <h2 className='text-xl text-left'>Setup authenticator app</h2> 
                    <span className='text-gray-400'> Authenticator apps and browser extensions like 1Password, Authy, Microsoft Authenticator, etc. generate one-time passwords that are used as a second factor to verify your identity when prompted during sign-in.</span>
                    <h2 className='text-xl text-left'>Scan the QR code</h2>
                    <span className='text-gray-400'> Use an authenticator app or browser extension to scan. Learn more about enabling 2FA.</span>
                    <p className='text-white'>Unable to scan? You can use the <span onClick={() => setShowModal(true)} className="text-blue-400 cursor-pointer">setup key </span>
 to manually configure your authenticator app.</p>
                    

                </div>
                <img className='h-full w-full sm:max-w-48 aspect-square rounded-lg p-1' src={`data:${qrCode.mime_type};${qrCode.encoding}, ${qrCode.img}`} width={192} height={192} alt="QR Code"></img>
            </div>
            <div className="space-y-4">
                
                    <div key={0} className="flex flex-wrap gap-1 items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        {!toggleButton && <span className="text-sky-400 mr-3">
                            <Si2Fas />
                        </span>}
                        {!toggleButton && <div className="text-sm text-white pr-2 flex-1">
                            Two-factor authentication is not enabled yet.
                        </div>}
                        {toggleButton && <InputField error={enableError} onChange={handleInputChange} value={code} placeholder="6 digit code"  />}

                        <div className="flex-1 flex justify-start sm:justify-end gap-1">
                            <button onClick={handleToggleButton}
                            // className={`w-full sm:w-fit ${toggleButton? "bg-yellow-500/30 hover:bg-yellow-500":"bg-sky-500 hover:bg-sky-600"} text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center`}>
                            className={`w-full sm:w-52 ${toggleButton? "custom-button-secondary":"custom-button"} flex items-center justify-center`}>
                            {toggleButton ? "cancel":"enable"}
                            </button>
                            {toggleButton && <button onClick={handleEnable}
                            className="custom-button w-full sm:w-fit flex items-center justify-center">
                            verify
                            </button>}
                        </div>

                    </div>
            </div>

            <Modal
                isOpen={showModal}
                action={() => setShowModal(false)}
                title={"Your two-factor secret"}
                description={qrCode.secret}
            />
            <Toaster  />
            
        </div>
    );
}

const InputField = ({ name, type = 'text', value, placeholder, onChange, error }) => (
    <div className="flex-1 space-y-2">
        <input
            value={value}
            type={type}
            name={name}
            placeholder={placeholder}
            onChange={onChange}
            // className={`w-full lg:max-w-64 min-w-48 text-white  px-4 py-3 bg-white/10 rounded-lg border ${
            //     error ? 'border-red-500 ' : 'border-gray-700 '
            // } focus:ring-2 focus:ring-blue-500 focus:border-transparent
            // transition-colors duration-200 text-gray-600 outline-none`}
            className={`w-full lg:max-w-64 min-w-48  ${error? "custom-input-error":"custom-input"}`}
        />
    </div>
);

export default TwoFactorAuth;
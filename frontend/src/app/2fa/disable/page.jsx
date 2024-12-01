"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiTwoFactorAuthQrcode, apiDisableTwoFactorAuth, apiTwoFactorAuthIsEnabled } from '@/services/twoFactorAuthApi';
// return {"img":img_base64, "type":"image/png", "encoding":"base64"}
import Button from "@/components/twoFactorAuth/Button";
import Form from "@/components/twoFactorAuth/Form";
import Container from "@/components/twoFactorAuth/Container";
import { useRouter } from 'next/navigation';

const QrCodePage = () => {
    const [qrCode, setQrCode] = useState({img:"", mime_type:"image/png", encoding:"base64", secret:""});
    const [copied, setCopied] = useState(false);
    const [code, setCode] = useState("");
    const router = useRouter();

    const handleInputChange = (event) => {
        const value = event.target.value.replace(/\D/g, "");
        setCode(value);
    };

    const handleDisable = async () => {
        const response = await apiDisableTwoFactorAuth(code);
        if (response.status === 200) {
            router.push('/2fa/enable');
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

    useEffect(() => {
        const fetchQrCode = async () => {
            let response = await apiTwoFactorAuthIsEnabled();
            if (response.status !== 200) {
                router.push('/2fa/enable');
                return;
            }

            response = await apiTwoFactorAuthQrcode();
            setQrCode(response);
        };

        fetchQrCode();
    }, [router]);

    
    
      

    return (
        <div className="relative flex flex-col items-center justify-center w-screen h-auto ">
            <div className='m-4 flex flex-col items-start gap-3 justify-evenly flex-wrap w-fit h-fit  p-1  border-white/20'>
                <div className='capitalize text-lg text-center'>turn off 2-step verification</div>
                <div className='text-white/75'>open authenticator and scan qrcode</div>
                <img className='max-w-96 w-full h-auto' src={`data:${qrCode.mime_type};${qrCode.encoding}, ${qrCode.img}`} width={192} height={192} alt="QR Code"></img>
                <div className='w-full text-center'>OR enter code manually</div>
                <Button onClick={copyToClipboard} className='flex flex-col justify-center font-mono items-center bg-white/50 text-white px-4 py-2'>
                    <div className='bg-black/10 p-2'>{qrCode.secret}</div>
                    <div className='w-fit h-fit flex items-center justify-center'>
                        <div>{copied ? "Copied" : "Copy"}</div>
                        <svg width={24} height={24} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                        </svg>

                    </div>
                </Button>
                <div className="w-full bg-white/50 min-h-[1px] h-[1px] "></div>
                <div className="flex w-full justify-center capitalize font-bold text-lg">
                    verify authentication code.
                </div>
                <Form placeholder='Enter 6 digits code' onChange={handleInputChange} value={code} maxlength={6}>{qrCode.secret}</Form>
                <Button onClick={handleDisable} className='flex justify-center font-mono items-center bg-red-600 hover:bg-white hover:text-black px-4 py-2'>
                    Disable
                </Button>
            </div>
        </div>
    );
}

export default QrCodePage;
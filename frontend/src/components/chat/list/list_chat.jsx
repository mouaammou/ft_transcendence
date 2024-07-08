import '@/Styles/chat/list_chat.css'
import Image from "next/image";
// import { BiSolidBellRing } from "react-icons/bi";
import { HiBell } from "react-icons/hi2";




const list_chat = () =>{
    return(
        <div className="list_chat">
            <div className='user-chat'>
                <div className='info-user'>
                    <Image src="/med.jpeg" width={65} height={65} style={{borderRadius: '30px'}}/>
                    <p> mohammed </p>
                </div>
                <div>
                    <HiBell className='HiBell'/>
                </div>
            </div>
            <div>

            </div>
            <div>

            </div>
            <div>
            <h2> hey this is list chat</h2>

            </div>
        </div>
    )
}

export default list_chat;
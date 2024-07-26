import '@/Styles/chat/msg.css'
import React, { useState } from 'react';
import Image from "next/image";
import { LiaGamepadSolid } from "react-icons/lia";
import { ImBlocked } from "react-icons/im";
import { BsSendFill } from "react-icons/bs";
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from "react-icons/bs";

// import Picker from 'emoji-picker-react';

const Msg_chat = () =>{
    const   [open, setOpen] = useState(false);
    const   [text, setText] = useState("");
    const   handleEmoji = (e)=>{
        setText((prev) => prev + e.emoji);
        // setOpen(false);
    }
    return(
        <div className="msg_chat">
            <div className="freind-profile">
                <div className="section-profile">
                    <Image src="/mouad.jpeg"  alt="mouad" className='img-section-profile'  width={65} height={65} style={{borderRadius: '50%', border: '3px solid #F1FAEE'}} />
                    <p> mouad </p>
                </div>
                <div className="section_action">
                    <LiaGamepadSolid className= 'LiaGamepadSolid' />
                    <ImBlocked className= 'ImBlocked' />
                </div>
            </div>
            <div className="body-message-chat">
                <div className='center-chat'>
                    <h2> hey this is the message chat </h2>
                </div>
                <div className="bottom-chat">
                    <div className='div_message_input'>
                        <input className="message" type="text" placeholder='type a message ...' 
                            onChange={e => setText(e.target.value)}
                            value={text}
                        />
                        {/* <button> */}
                            {/* <BsSendFill className="send-icon"/> */}
                        {/* </button>     */}
                    </div>
                    <div className='emoji'>
                        <BsEmojiSmile className='BsEmojiSmile' onClick={() => setOpen ((prev)=>!prev)} />
                        <div className='Picker'>
                            <EmojiPicker open={open} onEmojiClick={handleEmoji}/>
                        </div>
                    </div>
                            {/* <img src="/mouad.jpeg" alt="def" onClick={() => setOpen ((prev)=>!prev)} style={{width: "30", height: "30"}} /> */}
                    <div>
                    <button className='buttom-send'>
                        <BsSendFill className="send-icon"/>
                    </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Msg_chat;
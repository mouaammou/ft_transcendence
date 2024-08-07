import '@/Styles/chat/msg.css'
import Image from "next/image";
import { LiaGamepadSolid } from "react-icons/lia";
import { ImBlocked } from "react-icons/im";
import { BsSendFill } from "react-icons/bs";
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from "react-icons/bs";
import { TiArrowBack } from "react-icons/ti";
// import Picker from 'emoji-picker-react';
import React, { useContext } from 'react';
import { ChatContext } from '@/app/chat/chat_context/ChatContext'

const Msg_chat = () => {
    
    const { 
        selectedUser, 
        open, 
        setOpen, 
        text, 
        setText, 
        handleBackClick, 
        handleEmojiClick, 
        isChatVisible 
    } = useContext(ChatContext);

    return(
        <div className={`msg_chat ${isChatVisible ? '' : 'hidden'}`}>
            {selectedUser ? (
                <>
                    <div className="freind-profile">
                        <div className="section-profile">
                            <TiArrowBack onClick={handleBackClick} className='TiArrowBack'/>
                            <Image src={selectedUser.img} alt={selectedUser.name} width={65} height={65} style={{ borderRadius: '50%', border: '3px solid #F1FAEE' }} className='img-section-profile' />
                            <p>{selectedUser.name}</p>
                        </div>
                        <div className="section_action">
                            <LiaGamepadSolid className='LiaGamepadSolid' />
                            <ImBlocked className='ImBlocked' />
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
                            </div>
                            <div className='emoji'>
                                <BsEmojiSmile className='BsEmojiSmile' onClick={() => setOpen((prev) => !prev)} />
                                <div className='Picker'>
                                    <EmojiPicker open={open} onEmojiClick={handleEmojiClick} />
                                </div>
                            </div>
                            <div>
                                <button className='buttom-send'>
                                    <BsSendFill className="send-icon" />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className='user-not-select'>
                    <h2>Select a user to start chating</h2>
                </div>
            )}
        </div>
    )
}

export default Msg_chat;
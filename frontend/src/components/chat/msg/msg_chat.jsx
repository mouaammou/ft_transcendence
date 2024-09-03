import '@/styles/chat/msg.css'
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
        isChatVisible,
        messages,
        handleSendMessage,
        handleKeyPress,
        endRef
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
                            {/* <h2> hey this is the message chat </h2> */}
                            <div className="message">
                                <Image src={selectedUser.img} alt={selectedUser.name} className='img_msg' width={45} height={45} style={{ borderRadius: '50%', border: ' solid #F1FAEE' }} />
                                <p>Le Lorem Ipsum est simplement du faux texte employé dans la composition
                                    et la mise en page avant impression. Le Lorem Ipsum est le faux texte
                                    standard de l'imprimerie depuis les années 1500, quand un imprimeur
                                    anonyme assembla ensemble des morceaux de texte pour réaliser un livre
                                    spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles,
                                    mais s'est aussi adapté à la bureautique informatique, sans que son contenu
                                    n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente
                                    de feuilles Letraset contenant des passages du Lorem Ipsum, et, plus récemment,
                                    par son inclusion dans des applications de mise en page de texte, comme Aldus
                                    PageMaker.
                                </p>
                            </div>
                            <div className="my-message">
                                <p>Le Lorem Ipsum est simplement du faux texte employé dans la composition
                                    et la mise en page avant impression. Le Lorem Ipsum est le faux texte
                                    standard de l'imprimerie depuis les années 1500, quand un imprimeur
                                    anonyme assembla ensemble des morceaux de texte pour réaliser un livre
                                    spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles,
                                    mais s'est aussi adapté à la bureautique informatique, sans que son contenu
                                    n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente
                                    de feuilles Letraset contenant des passages du Lorem Ipsum, et, plus récemment,
                                    par son inclusion dans des applications de mise en page de texte, comme Aldus
                                    PageMaker.
                                </p>
                                <Image src="/med.jpeg" alt='mohammed' className='img_my_message'  width={45} height={45} style={{borderRadius: '50%', border: 'solid #F1FAEE'}}/>
                            </div>
                            <div className="message">
                                <Image src={selectedUser.img} alt={selectedUser.name} className='img_msg' width={45} height={45} style={{ borderRadius: '50%', border: ' solid #F1FAEE' }} />
                                <p>Le Lorem Ipsum est simplement du faux texte employé dans la composition
                                    et la mise en page avant impression. Le Lorem Ipsum est le faux texte
                                    standard de l'imprimerie depuis les années 1500, quand un imprimeur
                                    anonyme assembla ensemble des morceaux de texte pour réaliser un livre
                                    spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles,
                                    mais s'est aussi adapté à la bureautique informatique, sans que son contenu
                                    n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente
                                    de feuilles Letraset contenant des passages du Lorem Ipsum, et, plus récemment,
                                    par son inclusion dans des applications de mise en page de texte, comme Aldus
                                    PageMaker.
                                </p>
                            </div>
                            <div className="my-message">
                                <p>Le Lorem Ipsum est simplement du faux texte employé dans la composition
                                    et la mise en page avant impression. Le Lorem Ipsum est le faux texte
                                    standard de l'imprimerie depuis les années 1500, quand un imprimeur
                                    anonyme assembla ensemble des morceaux de texte pour réaliser un livre
                                    spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles,
                                    mais s'est aussi adapté à la bureautique informatique, sans que son contenu
                                    n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente
                                    de feuilles Letraset contenant des passages du Lorem Ipsum, et, plus récemment,
                                    par son inclusion dans des applications de mise en page de texte, comme Aldus
                                    PageMaker.
                                </p>
                                <Image src="/med.jpeg" alt='mohammed' className='img_my_message'  width={45} height={45} style={{borderRadius: '50%', border: 'solid #F1FAEE'}}/>
                            </div>
                            <div className="message">
                                <Image src={selectedUser.img} alt={selectedUser.name} className='img_msg' width={45} height={45} style={{ borderRadius: '50%', border: ' solid #F1FAEE' }} />
                                <p>Le Lorem Ipsum est simplement du faux texte employé dans la composition
                                    et la mise en page avant impression. Le Lorem Ipsum est le faux texte
                                    standard de l'imprimerie depuis les années 1500, quand un imprimeur
                                    anonyme assembla ensemble des morceaux de texte pour réaliser un livre
                                    spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles,
                                    mais s'est aussi adapté à la bureautique informatique, sans que son contenu
                                    n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente
                                    de feuilles Letraset contenant des passages du Lorem Ipsum, et, plus récemment,
                                    par son inclusion dans des applications de mise en page de texte, comme Aldus
                                    PageMaker.
                                </p>
                            </div>
                            <div className="message">
                                <Image src={selectedUser.img} alt={selectedUser.name} className='img_msg' width={45} height={45} style={{ borderRadius: '50%', border: ' solid #F1FAEE' }} />
                                <p>Le Lorem Ipsum est simplement du faux texte employé dans la composition
                                    et la mise en page avant impression. Le Lorem Ipsum est le faux texte
                                    standard de l'imprimerie depuis les années 1500, quand un imprimeur
                                    anonyme assembla ensemble des morceaux de texte pour réaliser un livre
                                    spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles,
                                    mais s'est aussi adapté à la bureautique informatique, sans que son contenu
                                    n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente
                                    de feuilles Letraset contenant des passages du Lorem Ipsum, et, plus récemment,
                                    par son inclusion dans des applications de mise en page de texte, comme Aldus
                                    PageMaker.
                                </p>
                            </div>
                            <div className="message">
                                <Image src={selectedUser.img} alt={selectedUser.name} className='img_msg' width={45} height={45} style={{ borderRadius: '50%', border: ' solid #F1FAEE' }} />
                                <p>Le Lorem Ipsum est simplement du faux texte employé dans la composition
                                    et la mise en page avant impression. Le Lorem Ipsum est le faux texte
                                    standard de l'imprimerie depuis les années 1500, quand un imprimeur
                                    anonyme assembla ensemble des morceaux de texte pour réaliser un livre
                                    spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles,
                                    mais s'est aussi adapté à la bureautique informatique, sans que son contenu
                                    n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente
                                    de feuilles Letraset contenant des passages du Lorem Ipsum, et, plus récemment,
                                    par son inclusion dans des applications de mise en page de texte, comme Aldus
                                    PageMaker.
                                </p>
                            </div>
                            {messages[selectedUser.id] && messages[selectedUser.id].map((msg, index) => (
                                <div key={index} className="my-message">
                                    <p>{msg.text}</p>
                                    <Image src="/med.jpeg" alt='mohammed' className='img_my_message'  width={45} height={45} style={{borderRadius: '50%', border: 'solid #F1FAEE'}}/>
                                </div>
                            ))}
                            <div ref={endRef}></div>
                        </div>
                        <div className="bottom-chat">
                            <div className='div_message_input'>
                                <input className="message_input" type="text" placeholder='type a message ...' 
                                    onChange={e => setText(e.target.value)}
                                    value={text}
                                    // onKeyPress={handleKeyPress}
                                    onKeyDown={handleKeyPress}
                                />
                            </div>
                            <div className='emoji'>
                                <BsEmojiSmile className='BsEmojiSmile' onClick={() => setOpen((prev) => !prev)} />
                                <div className='Picker'>
                                    {/* <div className='div_EmojiPicker'> */}
                                        <EmojiPicker open={open} onEmojiClick={handleEmojiClick} />
                                    {/* </div> */}
                                </div>
                            </div>
                            <div>
                                <button className='buttom-send' onClick={handleSendMessage}>
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



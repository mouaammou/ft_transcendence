import '@/styles/chat/msg.css';

import Image from 'next/image';
import { LiaGamepadSolid } from 'react-icons/lia';
import { ImBlocked } from 'react-icons/im';
import { BsSendFill } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from 'react-icons/bs';
import { TiArrowBack } from 'react-icons/ti';
// import Picker from 'emoji-picker-react';
import React, { useContext } from 'react';
import { ChatContext } from '@/app/chat/chat_context/ChatContext';

import { useAuth } from '@/components/auth/loginContext.jsx';




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
    endRef,
    // getChatId
  } = useContext(ChatContext);

  const { profileData: data } = useAuth();  // Current logged-in user

  return (
    <div className={`msg_chat ${isChatVisible ? '' : 'hidden'}`}>
      {selectedUser ? (
        <>
          <div className="freind-profile">
            <div className="section-profile">
              <TiArrowBack onClick={handleBackClick} className="TiArrowBack" />
              <img
                src={selectedUser.avatar}
                alt={selectedUser.username}
                width={65}
                height={65}
                style={{ borderRadius: '50%', border: '3px solid #F1FAEE' }}
                className="img-section-profile"
              />
              <p>{selectedUser.username}</p>
            </div>
            <div className="section_action">
              <LiaGamepadSolid className="LiaGamepadSolid" />
              <ImBlocked className="ImBlocked" />
            </div>
          </div>

          <div className="body-message-chat">
            <div className="center-chat">
            {messages[selectedUser?.id]?.length > 0 &&(
                messages[selectedUser.id].map((msg, index) => (
                  <div
                    key={index}
                    className={msg.sender === data.username ? 'my-message' : 'message'}
                  >
                
                    {msg.sender !== data.username && (
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.username}
                        className="img_msg"
                        width={45}
                        height={45}
                        style={{ borderRadius: '50%', border: 'solid #F1FAEE' }}
                      />
                    )}
                    <p>{msg.message}</p>
                    {msg.sender === data.username && (
                      <img
                        src={data.avatar}
                        alt={data.username}
                        className="img_my_message"
                        width={45}
                        height={45}
                        style={{ borderRadius: '50%', border: 'solid #F1FAEE' }}
                      />
                    )}
                  </div>
                ))
              )}

              {/* Scroll to the bottom of the chat */}
              <div ref={endRef}></div>
            </div>

            {/* Message input and emoji picker */}
            <div className="bottom-chat">
              <div className="div_message_input">
                <input
                  className="message_input"
                  type="text"
                  placeholder="Type a message..."
                  onChange={e => setText(e.target.value)}
                  value={text}
                  onKeyDown={handleKeyPress}
                />
              </div>
              <div className="emoji">
                <BsEmojiSmile className="BsEmojiSmile" onClick={() => setOpen(prev => !prev)} />
                {open && (
                  <div className="Picker">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
              </div>
              <button className="buttom-send" onClick={handleSendMessage}>
                <BsSendFill className="send-icon" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="user-not-select">
          <h2>Select a user to start chatting</h2>
        </div>
      )}
    </div>
  );
};

export default Msg_chat;




// methode  use  getChatId

// <div className="center-chat">
//     {/* Use the correct chat ID to retrieve the messages */}
//     {messages[getChatId(data.id, selectedUser.id)] ? (
//       messages[getChatId(data.id, selectedUser.id)].map((msg, index) => (
//         <div
//           key={index}
//           className={msg.sender === data.id ? 'my-message' : 'message'}
//         >
//           {/* If the message is not from the current user, display the selected user's avatar */}
//           {msg.sender !== data.id && (
//             <img
//               src={selectedUser.avatar}
//               alt={selectedUser.username}
//               className="img_msg"
//               width={45}
//               height={45}
//               style={{ borderRadius: '50%', border: 'solid #F1FAEE' }}
//             />
//           )}
//           <p>{msg.text}</p>
//           {/* If the message is from the current user, display the current user's avatar */}
//           {msg.sender === data.id && (
//             <img
//               src={data.avatar}
//               alt={data.username}
//               className="img_my_message"
//               width={45}
//               height={45}
//               style={{ borderRadius: '50%', border: 'solid #F1FAEE' }}
//             />
//           )}
//         </div>
//       ))
//     ) : (
//       <div className="no-messages">
//         <p>No messages yet. Start the conversation!</p>
//       </div>
//     )}

//  {/* </div> */}







// old methode static

// const Msg_chat = () => {
//   const {
//     selectedUser,
//     open,
//     setOpen,
//     text,
//     setText,
//     handleBackClick,
//     handleEmojiClick,
//     isChatVisible,
//     messages,
//     handleSendMessage,
//     handleKeyPress,
//     endRef,
//   } = useContext(ChatContext);

//   const { profileData: data} = useAuth();

//   return (
//     <div className={`msg_chat ${isChatVisible ? '' : 'hidden'}`}>
//       {selectedUser ? (
//         <>
//           <div className="freind-profile">
//             <div className="section-profile">
//               <TiArrowBack onClick={handleBackClick} className="TiArrowBack" />
//               <img
//                 src={selectedUser.avatar}
//                 alt={selectedUser.username}
//                 width={65}
//                 height={65}
//                 style={{ borderRadius: '50%', border: '3px solid #F1FAEE' }}
//                 className="img-section-profile"
//               />
//               <p>{selectedUser.username}</p>
//             </div>
//             <div className="section_action">
//               <LiaGamepadSolid className="LiaGamepadSolid" />
//               <ImBlocked className="ImBlocked" />
//             </div>
//           </div>
//           <div className="body-message-chat">
//             <div className="center-chat">
//               {/* <h2> hey this is the message chat </h2> */}
//               <div className="message">
//                 <img
//                   src={selectedUser.avatar}
//                   alt={selectedUser.username}
//                   className="img_msg"
//                   width={45}
//                   height={45}
//                   style={{ borderRadius: '50%', border: ' solid #F1FAEE' }}
//                 />
//                 <p>
//                   Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise
//                   en page avant impression. Le Lorem Ipsum est le faux texte standard de
//                   l'imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble
//                   des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a
//                   pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique
//                   informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les
//                   années 1960 grâce à la vente de feuilles Letraset contenant des passages du Lorem
//                   Ipsum, et, plus récemment, par son inclusion dans des applications de mise en page
//                   de texte, comme Aldus PageMaker.
//                 </p>
//               </div>
//               <div className="my-message">
//                 <p>
//                   Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise
//                   en page avant impression. Le Lorem Ipsum est le faux texte standard de
//                   l'imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble
//                   des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a
//                   pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique
//                   informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les
//                   années 1960 grâce à la vente de feuilles Letraset contenant des passages du Lorem
//                   Ipsum, et, plus récemment, par son inclusion dans des applications de mise en page
//                   de texte, comme Aldus PageMaker.
//                 </p>
//                 <img
//                   src={data.avatar}
//                   alt={data.username}
//                   className="img_my_message"
//                   width={45}
//                   height={45}
//                   style={{ borderRadius: '50%', border: 'solid #F1FAEE' }}
//                 />
//               </div>
//               <div className="message">
//                 <img
//                   src={selectedUser.avatar}
//                   alt={selectedUser.username}
//                   className="img_msg"
//                   width={45}
//                   height={45}
//                   style={{ borderRadius: '50%', border: ' solid #F1FAEE' }}
//                 />
//                 <p>
//                   Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise
//                   en page avant impression. Le Lorem Ipsum est le faux texte standard de
//                   l'imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble
//                   des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a
//                   pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique
//                   informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les
//                   années 1960 grâce à la vente de feuilles Letraset contenant des passages du Lorem
//                   Ipsum, et, plus récemment, par son inclusion dans des applications de mise en page
//                   de texte, comme Aldus PageMaker.
//                 </p>
//               </div>
//               <div className="my-message">
//                 <p>
//                   Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise
//                   en page avant impression. Le Lorem Ipsum est le faux texte standard de
//                   l'imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble
//                   des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a
//                   pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique
//                   informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les
//                   années 1960 grâce à la vente de feuilles Letraset contenant des passages du Lorem
//                   Ipsum, et, plus récemment, par son inclusion dans des applications de mise en page
//                   de texte, comme Aldus PageMaker.
//                 </p>
//                 <img
//                   src={data.avatar}
//                   alt={data.username}
//                   className="img_my_message"
//                   width={45}
//                   height={45}
//                   style={{ borderRadius: '50%', border: 'solid #F1FAEE' }}
//                 />
//               </div>
//               <div className="message">
//                 <img
//                   src={selectedUser.avatar}
//                   alt={selectedUser.username}
//                   className="img_msg"
//                   width={45}
//                   height={45}
//                   style={{ borderRadius: '50%', border: ' solid #F1FAEE' }}
//                 />
//                 <p>
//                   Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise
//                   en page avant impression. Le Lorem Ipsum est le faux texte standard de
//                   l'imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble
//                   des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a
//                   pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique
//                   informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les
//                   années 1960 grâce à la vente de feuilles Letraset contenant des passages du Lorem
//                   Ipsum, et, plus récemment, par son inclusion dans des applications de mise en page
//                   de texte, comme Aldus PageMaker.
//                 </p>
//               </div>
//               <div className="message">
//                 <img
//                   src={selectedUser.avatar}
//                   alt={selectedUser.username}
//                   className="img_msg"
//                   width={45}
//                   height={45}
//                   style={{ borderRadius: '50%', border: ' solid #F1FAEE' }}
//                 />
//                 <p>
//                   Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise
//                   en page avant impression. Le Lorem Ipsum est le faux texte standard de
//                   l'imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble
//                   des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a
//                   pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique
//                   informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les
//                   années 1960 grâce à la vente de feuilles Letraset contenant des passages du Lorem
//                   Ipsum, et, plus récemment, par son inclusion dans des applications de mise en page
//                   de texte, comme Aldus PageMaker.
//                 </p>
//               </div>
//               <div className="message">
//                 <img
//                   src={selectedUser.avatar}
//                   alt={selectedUser.username}
//                   className="img_msg"
//                   width={45}
//                   height={45}
//                   style={{ borderRadius: '50%', border: ' solid #F1FAEE' }}
//                 />
//                 <p>
//                   Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise
//                   en page avant impression. Le Lorem Ipsum est le faux texte standard de
//                   l'imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble
//                   des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a
//                   pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique
//                   informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les
//                   années 1960 grâce à la vente de feuilles Letraset contenant des p assages du Lorem
//                   Ipsum, et, plus récemment, par son inclusion dans des applications de mise en page
//                   de texte, comme Aldus PageMaker.
//                 </p>
//               </div>
//               {messages[selectedUser.id] &&
//                 messages[selectedUser.id].map((msg, index) => (
//                   <div key={index} className="my-message">
//                     <p>{msg.text}</p>
//                     <img
//                       src={data.avatar}
//                       alt={data.username}
//                       className="img_my_message"
//                       width={45}
//                       height={45}
//                       style={{ borderRadius: '50%', border: 'solid #F1FAEE' }}
//                     />
//                   </div>
//                 ))}
//               <div ref={endRef}></div>
//             </div>
//             <div className="bottom-chat">
//               <div className="div_message_input">
//                 <input
//                   className="message_input"
//                   type="text"
//                   placeholder="type a message ..."
//                   onChange={e => setText(e.target.value)}
//                   value={text}
//                   // onKeyPress={handleKeyPress}
//                   onKeyDown={handleKeyPress}
//                 />
//               </div>
//               <div className="emoji">
//                 <BsEmojiSmile className="BsEmojiSmile" onClick={() => setOpen(prev => !prev)} />
//                 <div className="Picker">
//                   {/* <div className='div_EmojiPicker'> */}
//                   <EmojiPicker open={open} onEmojiClick={handleEmojiClick} />
//                   {/* </div> */}
//                 </div>
//               </div>
//               <div>
//                 <button className="buttom-send" onClick={handleSendMessage}>
//                   <BsSendFill className="send-icon" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </>
//       ) : (
//         <div className="user-not-select">
//           <h2>Select a user to start chating</h2>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Msg_chat;

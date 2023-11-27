import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router";
import logoIcon from "../assets/chat-images/logo-icon.png";
import send from "../assets/chat-images/cil_send.png";
import Loader from './Loader';

const ChatArea = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const token = JSON.parse(localStorage.getItem("token"));

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const amOrPm = hours >= 12 ? 'PM' : 'AM';

  // Convert hours to 12-hour format
  const formattedHours = hours % 12 || 12; // Ensure 12:00 is displayed as 12:00 PM, not 00:00 AM
  const formattedMinutes = minutes.toString().padStart(2, '0'); // Format minutes with leading zero

  const timestamp = `${formattedHours}:${formattedMinutes} ${amOrPm}`;

  const handleChange = (e) => {
    const { value } = e.target;
    setInputMessage(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (inputMessage.trim() === '') return;
    
    // Add user's message to the messages state
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: inputMessage, isUser: true, show: false },
    ]);
    setTimeout(() => {
      setMessages((prevMessages) =>
      prevMessages.map((message, index) => ({ ...message, show: true }))
      );
    }, 100);
    setInputMessage('');

    setIsLoading(true);

    try {
      const response = await (
        await fetch(`https://agrowise-api.vercel.app/api/openapi/`, {
          method: "POST",

          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token.access}`,
          },
          body: JSON.stringify({ prompt: inputMessage }),
        })
      ).json();
    
      // Simulate Agro AI's response
      setTimeout(() => {
        const agroResponse = response.data;
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: agroResponse, isUser: false, show: false }, // Add 'show' property
        ]);
    
        // Delay setting 'show' to true for both user and bot messages
        setTimeout(() => {
          setMessages((prevMessages) =>
            prevMessages.map((message, index) =>
              index === prevMessages.length - 1 ? { ...message, show: true } : message
            )
          );
        }, 100); // Adjust the delay time as needed
      }, 500);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const user = JSON.parse(localStorage.getItem("userData")) || {};

  // -------- Redirect user if logged in -----------------
  useEffect(() => {
    const userData = localStorage.getItem("userData");

    if (!userData) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <>
      <div className='chat ml-64 flex px-6 flex-col pt-20 max-[640px]:ml-0 justify-between items-center'>
        {messages.length === 0 ? (
          <>
            <div className='text-center'>
              <h2>Hello Again, {user.first_name}</h2>
              <small className='italic'>Tell me what's on your mind, or pick a suggestion</small>
            </div>

            <div className='chat-topic text-sm flex flex-col gap-8 items-center'>
              <div className="flex items-center gap-6">
                <p className='py-2 px-6 rounded-lg text-center text-sm'>Soil Management</p>
                <p className='py-2 px-6 rounded-lg text-center text-sm'>Nutrient Management</p>
              </div>
              <p className='py-2 px-6 rounded-lg text-center text-sm'>Pest and Disease Management</p>
              <p className='py-2 px-6 rounded-lg text-center text-sm'>Harvesting and Post-Harvest Management</p>
              <p className='py-2 px-6 rounded-lg text-center text-sm'>Water Management</p>
            </div>
          </>

        ) : (
          <ul className='message-list w-full px-4 max-[640px]:px-0'>
            {messages.map((message, index) => (
              <li
              key={index}
              style={{ maxWidth: "18rem", fontSize: ".75rem" }}
              className={`max-[640px]:text-xs w-max flex items-end font-light flex-col px-4 py-3 text-sm rounded-lg mb-1 ${
                message.isUser
                  ? 'user bg-green-600 text-white clear-both pl-4 float-left rounded-bl-none'
                  : 'bot bg-green-700 text-white clear-both float-right rounded-br-none'
                } ${message.show ? 'show-message' : ''}`}
              >
                <div className="flex gap-1 items-start">
                  {message.isUser ? (
                    <>
                      <p style={{ fontSize: '.65rem', padding: '.1rem .5rem' }} className='bg-slate-50 w-max rounded-full text-green-900 font-normal'>
                        {user.first_name}:
                      </p>
                      <p>{message.text}</p>
                    </>
                  ) : (
                    <>
                      <p>{message.text}</p>
                      <p style={{ fontSize: '.65rem', padding: '.1rem .5rem' }} className='bg-slate-50 w-max rounded-full text-green-900 font-normal'>
                        Bot:
                      </p>
                    </>
                  )}
                </div>
                <small className={`mt-2 text-slate-300 ${message.isUser ? 'self-start' : ''}`}>{timestamp}</small>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className='w-full flex message-input py-4 px-4 rounded-lg items-center gap-4 mb-4'>
          <img src={logoIcon} alt="" className='w-6' />
          <input
            type='text'
            placeholder='Message Agro AI'
            className='w-full max-[640px]:w-auto text-sm placeholder:italic bg-transparent outline-none border-none'
            value={inputMessage}
            onChange={handleChange} required
          />
          <button type='submit' onClick={handleSubmit}>
            {isLoading ? <Loader /> : <img src={send} alt="" className='w-6' />}
          </button>
        </form>
      </div>
    </>
  )
}

export default ChatArea
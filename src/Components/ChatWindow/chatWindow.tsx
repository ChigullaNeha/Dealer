import { IMessage } from '@stomp/stompjs';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { IoIosChatboxes } from 'react-icons/io';
import { IoClose, IoSend } from 'react-icons/io5';
import { useLocation } from 'react-router-dom';

import StompService from '../../StompService/stompService';
import { ChatMessage, Player, WebSocketProps } from '../../types/types';
import './chatWindow.css';

const serverUrl: string = import.meta.env.VITE_BASE_REST_API_URL;

const ChatWindow: React.FC<WebSocketProps> = ({ isWebSocketConnected }) => {
  const [isChatOpen, setChatOpen] = useState<boolean>(false);
  const [sendMsg, setSendMsg] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState<Player>();
  const [messageList, setMessageList] = useState<ChatMessage[]>([]);
  const [unreadMsgCount, setUnreadMsgCount] = useState<number>(0);
  const [isPlayerNotAvailable, setIsPlayerNotAvailable] = useState<boolean>(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const gameId = location.pathname.split('/')[3];
  const chatContainerRef = useRef<HTMLUListElement | null>(null);
  const stompService: StompService = StompService.getInstance();

  const chatMsg = {
    sender: currentPlayer?.name,
    message: sendMsg,
    dateTime: new Date().toISOString(),
  };

  useEffect(() => {
    if (isWebSocketConnected) {
      subscribeToJoin();
    }
  }, [isWebSocketConnected, location]);

  const subscribeToJoin = () => {
    stompService.subscribe(`/topics/messages/${gameId}`, handleSubscribeMsg);
    stompService.subscribe(`/topics/chat-history/${gameId}`, handleSubscribeMsgList);
    stompService.sendMessage(`/game/chat/history/${gameId}`, '');
    stompService.sendMessage(`/topics/noCard/${gameId}`, '');
    const playerId = searchParams.get('playerId');
    const ownerId = searchParams.get('ownerId');
    const finalPlayerId = playerId !== undefined ? playerId : ownerId;
    getPlayer(finalPlayerId);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messageList]);

  const getPlayer = async (id: string | null) => {
    try {
      const response = await fetch(`${serverUrl}/${gameId}/players/${id}`);
      const data = await response.json();
      setCurrentPlayer(data);
    } catch (error) {
      setIsPlayerNotAvailable(true);
    }
  };

  const handleSubscribeMsg = (message: IMessage) => {
    const chatMsg = JSON.parse(message.body);
    setMessageList((prevMessages) => [...prevMessages, chatMsg]);
    setUnreadMsgCount((prev) => prev + 1);
  };

  const handleSubscribeMsgList = (message: IMessage) => {
    const chatMessages = JSON.parse(message.body);
    setMessageList(chatMessages);
  };

  const triggerChatWindow = () => {
    setChatOpen((prev) => !prev);
    setUnreadMsgCount(0);
  };

  const handleSendMsg = (e: ChangeEvent<HTMLInputElement>) => {
    setSendMsg(e.target.value);
  };

  const onClickSendMsg = () => {
    if (isWebSocketConnected) {
      stompService.sendMessage(`/game/chat/${gameId}`, JSON.stringify(chatMsg));
    }

    setSendMsg('');
  };

  const convertDateToTime = (isoDateString: string) => {
    const date = new Date(isoDateString);

    const modifiedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
    return modifiedTime;
  };

  return (
    <div className="chat-window-main-container" style={{ display: isPlayerNotAvailable ? 'none' : 'block' }}>
      {!isChatOpen && (
        <button className="chat-btn" onClick={triggerChatWindow}>
          <IoIosChatboxes />
          {unreadMsgCount > 0 && <sup className="new-msg-count">{unreadMsgCount}</sup>}
        </button>
      )}
      {isChatOpen && (
        <div className="chat-room-container">
          <button className="chat-close-btn" onClick={triggerChatWindow}>
            <IoClose />
          </button>
          <ul className="chat-messages-list-container" ref={chatContainerRef}>
            {messageList.map((eachMsg) => (
              <li className={`user-msg-container ${eachMsg.sender === currentPlayer?.name && 'sender-msg'}`} key={eachMsg.dateTime}>
                {eachMsg.sender !== currentPlayer?.name && <span className="msg-user-name">{eachMsg.sender}</span>}
                <p className="user-msg">{eachMsg.message}</p>
                <span className="chat-time">{convertDateToTime(eachMsg.dateTime)}</span>
              </li>
            ))}
          </ul>
          <div className="chat-text-box-container">
            <input type="text" placeholder="Chat with your team..." className="chat-text" value={sendMsg} onChange={handleSendMsg} />
            <button type="button" className="chat-msg-send-btn" disabled={!sendMsg && true} onClick={onClickSendMsg}>
              <IoSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
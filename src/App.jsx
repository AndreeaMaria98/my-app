import { useEffect, useRef, useState } from "react";
import "./App.css";
import ReactLoading from 'react-loading';

import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBIcon,
  MDBBtn,
  MDBTypography,
  MDBTextArea,
  MDBCardHeader,
} from "mdb-react-ui-kit";

const localStorageKey = 'chatKey';

function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([{
    role: "ACE Bot", content: `Hi I'm your bot etc tec`, date: new Date()
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const key = localStorage.getItem(localStorageKey);
    if (key) {
      setChats(JSON.parse(key));
    }
  }, []);

  const chat = async (e, message) => {
    e.preventDefault();

    if (!message) return;

    let msgs = chats;
    msgs.push({ role: "User", content: message, date: new Date() });
    msgs.push({ role: "loading", content: '', date: null })
    setChats(msgs);

    setTimeout(() => { scrollRef.current.scrollTo(0, 10e6); setIsTyping(true); }, 200)
    setMessage("");

    fetch("http://localhost:5000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: message,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.info(data);
        setChats((prevChats) => {
          prevChats[prevChats.length - 1] = { role: "ACE Bot", content: data.response, date: new Date() };
          localStorage.setItem(localStorageKey, JSON.stringify(prevChats));
          return prevChats;
        });
        setIsTyping(false);
        setTimeout(() => scrollRef.current.scrollTo(0, 10e6), 500)
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const renderUserMessage = (chat) => (
    <li className="d-flex justify-content-between mb-4">
      <MDBCard className="w-100 mask-custom">
        <MDBCardHeader
          className="d-flex justify-content-between p-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,.3)" }}
        >
          <p class="fw-bold mb-0">{chat.role}</p>
          <p class="text-light small mb-0">
            <MDBIcon far icon="clock" /> {new Date(chat.date).toLocaleString()}
          </p>
        </MDBCardHeader>
        <MDBCardBody>
          <p className="mb-0">
            {chat?.content}
          </p>
        </MDBCardBody>
      </MDBCard>
      <img
        src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-5.webp"
        alt="avatar"
        className="rounded-circle d-flex align-self-start ms-3 shadow-1-strong"
        width="60"
      />
    </li>
  );

  const renderBotMessage = (chat) => (
    <li className="d-flex justify-content-between mb-4">
      <img
        src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-6.webp"
        alt="avatar"
        className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
        width="60"
      />
      <MDBCard className="mask-custom" style={{ width: '100%' }}>
        <MDBCardHeader
          className="d-flex justify-content-between p-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,.3)" }}
        >
          <p className="fw-bold mb-0">{chat.role}</p>
          <p className="text-light small mb-0">
            <MDBIcon far icon="clock" /> {new Date(chat.date).toLocaleString()}
          </p>
        </MDBCardHeader>
        <MDBCardBody>
          <p className="mb-0">
            {chat?.content}
          </p>
        </MDBCardBody>
      </MDBCard>
    </li>
  );

  const onEnterPress = (e, message) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      chat(e, message);
    }
  }

  return (
    <MDBContainer fluid className="py-5 gradient-custom" style={{ width: '50%' }}>
      <MDBRow>
        <MDBCol md="12" lg="12" xl="12">
          <MDBTypography listUnStyled className="text-white">
            <div style={{ overflow: 'auto', height: 600 }} ref={(ref) => { scrollRef.current = ref; }}>
              {chats && chats.length
                ? chats.map((chat, index) => {
                  if (chat.role === "loading") {
                    return <ReactLoading height={50} width={50} type={'bubbles'} />
                  }
                  return (
                    chat?.role === "User" ? renderUserMessage(chat) : renderBotMessage(chat)
                  )
                })
                : ""}
            </div>
          </MDBTypography>
        </MDBCol>
      </MDBRow>
      <MDBRow>
        <MDBCol md="12" lg="12" xl="12">
          <MDBTypography listUnStyled className="text-white">
            <li class="mb-3">
              <div class="form-outline form-white">
                <textarea
                  class="form-control active"
                  id="textAreaExample3"
                  rows="4"
                  style={{ height: 80 }}
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                  disabled={isTyping}
                  onKeyDown={(e) => onEnterPress(e, message)}
                />
                <label class="form-label" for="textAreaExample3" style={{ marginLeft: 0 }}>Message</label>
                <div class="form-notch"><div class="form-notch-leading" style={{ width: 9 }}>
                </div>
                  <div class="form-notch-middle" style={{ width: 60 }} />
                  <div class="form-notch-trailing" />
                </div>
              </div>
            </li>
            <MDBBtn color="light" size="lg" rounded className="float-end" onClick={(e) => chat(e, message)}>
              Send
            </MDBBtn>
          </MDBTypography>
        </MDBCol>
      </MDBRow>
    </MDBContainer >
  );
}

export default App;

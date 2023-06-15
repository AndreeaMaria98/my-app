import { useEffect, useRef, useState } from "react";
import "./App.css";
import ReactLoading from 'react-loading';

const localStorageKey = 'chatKey';

function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([{
    role: "user_msg", content: `Hi I'm your bot etc tec`
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const ref = useRef(null);

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
    msgs.push({ role: "user", content: message });
    msgs.push({ role: "loading", content: '' })
    setChats(msgs);

    setTimeout(() => { ref.current.scrollTo(0, 10e6); setIsTyping(true); }, 200)
    setMessage("");


    // setTimeout(() => {
    //   setChats((prevChats) => {
    //     prevChats[prevChats.length - 1] = { role: "user_msg", content: `bot_${message}` };
    //     localStorage.setItem(localStorageKey, JSON.stringify(prevChats));
    //     return prevChats;
    //   });
    //   setIsTyping(false);
    //   setTimeout(() => ref.current.scrollTo(0, 10e6), 500)
    // }, 2000)



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
          prevChats[prevChats.length - 1] = { role: "user_msg", content: data.response };
          localStorage.setItem(localStorageKey, JSON.stringify(prevChats));
          return prevChats;
        });
        setIsTyping(false);
        setTimeout(() => ref.current.scrollTo(0, 10e6), 500)
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <main>
      <h1>FullStack Chat AI Tutorial</h1>

      <section
        ref={(el) => { ref.current = el; }}
        style={{
          overflow: 'auto',
          height: 550,
          border: '4px solid black',
          padding: 5,
          marginBottom: 10,
        }}>
        {chats && chats.length
          ? chats.map((chat, index) => {
            if (chat.role === "loading") {
              return <ReactLoading height={50} width={50} type={'bubbles'} />
            }
            return (
              <p key={index} className={chat?.role === "user" ? "user_msg" : "bot_msg"}>
                <span>
                  <b>{chat?.role.toUpperCase()}</b>
                </span>
                <span>:</span>
                <span>{chat?.content}</span>
              </p>
            )
          })
          : ""}
      </section>

      <form action="" onSubmit={(e) => chat(e, message)}>
        <input
          type="text"
          name="message"
          value={message}
          placeholder="Type a message here and hit Enter..."
          onChange={(e) => setMessage(e.target.value)}
          style={{
            borderRadius: 25,
          }}
          disabled={isTyping}
        />
      </form>
    </main>
  );
}

export default App;

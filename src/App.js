import React, {useState, useRef} from 'react';
import AppIcon from './no-img.png';
import './App.css';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
       <header>
        <h1><span className="icons">ChatLife</span></h1>
        <SignOut />
      </header>
      
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <div>
    <button onClick={signInWithGoogle}>Sign In With Google</button>
    </div>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const scroller = useRef()

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid} = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      AppIcon
    })

    
    scroller.current.scrollIntoView({ behavior: 'smooth'})
    setFormValue('');
  }

  return (
    <main>
    
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      
      <div ref={scroller}></div>

    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>

      <button type="submit">Send</button>
    </form>
    
    </main>
  )
}

function ChatMessage(props) {
  const { text, uid } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={AppIcon} alt={auth.currentUser.displayName}/>
      <p>{text}</p>
    </div>
  )
}

export default App;

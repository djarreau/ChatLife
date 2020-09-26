import React, {useState, useRef} from 'react';
import AppIcon from './no-img.png';
import './App.css';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
  // apiKey: "AIzaSyDttUCHGuifEaBG6CObQGyxuX3APQeBm6A",
  // authDomain: "cheemin-11db0.firebaseapp.com",
  // databaseURL: "https://cheemin-11db0.firebaseio.com",
  // projectId: "cheemin-11db0",
  // storageBucket: "cheemin-11db0.appspot.com",
  // messagingSenderId: "1055419106126",
  // appId: "1:1055419106126:web:0f4093521eaa05359c141f",
  // // measurementId: "G-N2HWTWN57Q"
  apiKey: "AIzaSyCfVXw04AojcXMcEKUTM1LKFepGFqkvTdA",
    authDomain: "chatlife-f8269.firebaseapp.com",
    databaseURL: "https://chatlife-f8269.firebaseio.com",
    projectId: "chatlife-f8269",
    storageBucket: "chatlife-f8269.appspot.com",
    messagingSenderId: "207828252640",
    appId: "1:207828252640:web:835a0f579590b010201d85"
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
  const [user] = useAuthState(auth);
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
      <img src={AppIcon} alt={"User Pic"}/>
      <p>{text}</p>
    </div>
  
  )
}
export default App;

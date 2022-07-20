import './App.css';
import React, { useEffect, useState } from 'react';
import StickyHeadTable from './Table';
function App() {
 const [word, setWord] = useState('');
  const [search, setSearch] =  useState('');
  const handleText = (textValue) => setWord(textValue);
  const initiateSearch = () => {
    setSearch(word);
    console.log("Search is set:" , word);
  }
  return (
    <div className="App">
     
     <StickyHeadTable />
    </div>
  );
}

export default App;

import { Routes, Route } from 'react-router-dom';
import './App.css';
import Page1 from '../pages/Page1/Page1';
import Page2 from '../pages/Page2/Page2';
import Page3 from '../pages/Page3/Page3';
import Page4 from '../pages/Page4/Page4';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Page1 />} />
        <Route path="/home" element={<Page2 />} />
        <Route path="/products" element={<Page3 />} />
        <Route path="/customers" element={<Page4 />} />
      </Routes>
    </>
  );
}

export default App;



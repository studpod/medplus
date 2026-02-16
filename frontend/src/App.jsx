import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
// import './App.css';


function App() {
  return (
    <Router>
    <div className="App">
      <header className="App-header">
        <nav>
          <Link to="/authorization">Увійти</Link>
          
        </nav>
      </header>
      <div>
        <Routes>
          {/* <Route path="/authorization" element={<Authorization/>} />
          <Route path="/vacancies" element={<div>Сторінка вакансій</div>} /> */}
        </Routes>
      </div>
    </div>
  </Router>
  );
}

export default App;

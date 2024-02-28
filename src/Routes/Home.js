import logo from '../logo.svg';
import '../App.css';

function Home() {
    return (<div className="App">
        <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
                Hello from Version 1.0
            </p>
        </header>
    </div>);
}

export default Home;
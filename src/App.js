import Container from 'react-bootstrap/Container';
import Body from './Body';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// NOTE: For the purposes of time I'm sticking with JS instead of TS for this project

const App = () => {
  return (
    <Container>
      <header className="App-header">
        <h1>Comparing pay data</h1>
      </header>
      <body className="App-body">
        <Body />
      </body>
    </Container>
  );
};

export default App;

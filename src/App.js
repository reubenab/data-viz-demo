import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import DataVizCharts from './DataVizCharts';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// NOTE: For the purposes of time I'm sticking with JS instead of TS for this project

const exampleData = [
  { gender: 'male', averageSalary: 100000 },
  { gender: 'female', averageSalary: 90000 },
  { gender: 'other', averageSalary: 85000 },
];

function App() {
  return (
    <Container>
      <header className="App-header">
        <h1>Comparing pay data</h1>
      </header>
      <body className="App-body">
        <Container>
          <Row>
            <DataVizCharts data={exampleData} />
          </Row>
        </Container>
      </body>
    </Container>
  );
}

export default App;

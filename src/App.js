import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import _ from 'lodash';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryContainer,
  VictoryPie,
  VictoryTheme,
} from 'victory';
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
            <Container>
              <Row>
                <Col>
                  <VictoryChart
                    height={200}
                    width={300}
                    domainPadding={50}
                    theme={VictoryTheme.material}
                    // containerComponent={<VictoryContainer responsive={false} />}
                  >
                    <VictoryAxis tickFormat={(x) => _.upperFirst(x)} />
                    <VictoryAxis
                      dependentAxis
                      tickFormat={(y) => `$${y / 1000}k`}
                    />
                    <VictoryBar
                      data={exampleData}
                      x="gender"
                      y="averageSalary"
                      barWidth={20}
                    />
                  </VictoryChart>
                </Col>
                <Col>
                  <VictoryPie
                    radius={100}
                    data={exampleData}
                    x="gender"
                    y="averageSalary"
                    // containerComponent={<VictoryContainer responsive={false} />}
                  />
                </Col>
              </Row>
            </Container>
          </Row>
        </Container>
      </body>
    </Container>
  );
}

export default App;

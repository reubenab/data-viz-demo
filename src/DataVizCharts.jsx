import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import _ from 'lodash';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryPie,
  VictoryTheme,
} from 'victory';

const DataVizCharts = ({ data, label }) => {
  return (
    <Container>
      <Row>
        <Col>
          <VictoryChart
            height={300}
            width={500}
            domainPadding={50}
            theme={VictoryTheme.material}
          >
            <VictoryAxis label={label} tickFormat={_.upperFirst} style={{
              axisLabel: {
                fontSize: 20,
                padding: 40,
              }
            }} />
            <VictoryAxis
              dependentAxis
              tickFormat={(y) => `$${y / 1000}k`}
            />
            <VictoryBar
              data={data}
              x="groupName"
              y="averageSalary"
              barWidth={20}
            />
          </VictoryChart>
        </Col>
        <Col>
          <VictoryPie
            radius={80}
            data={data}
            x="groupName"
            y="averageSalary"
            colorScale={'cool'}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default DataVizCharts;
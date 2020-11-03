import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import DataVizCharts from './DataVizCharts';

const exampleData = [
  { gender: 'male', averageSalary: 100000 },
  { gender: 'female', averageSalary: 90000 },
  { gender: 'other', averageSalary: 85000 },
];

const Body = () => {
  return (
    <Container>
      <Row>
        <DataVizCharts data={exampleData} />
      </Row>
    </Container>
  );
};

export default Body;

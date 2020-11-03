import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import _ from 'lodash';
import DataVizCharts from './DataVizCharts';

const lazyRequire = {};

const getEmployeesRaw = () => {
  let data;
  if (!lazyRequire.employees) {
    data = require('./fixtures/employees.json');
    lazyRequire.employees = data;
  } else {
    data = lazyRequire.employees;
  }
  return data;
}

const getSalaryRaw = () => {
  let data;
  if (!lazyRequire.salary) {
    data = require('./fixtures/salary.json');
    lazyRequire.salary = data;
  } else {
    data = lazyRequire.salary;
  }
  return data;
}

const salaryForEmployeeThisYear = (eid) => {
  const salaryData = getSalaryRaw();
  // only consider salary data from 2020
  // TODO: handle multiple salary numbers for 2020
  return salaryData.filter(item => item.eid === eid && item.date.substring(6) === '2020');
}

const getAverageSalary = rawData => {
  const numEmployees = _.size(rawData);
  const allSalaries = _.flatten(_.map(rawData, ({ eid }) => salaryForEmployeeThisYear(eid)));
  const totalSalary = _.sumBy(allSalaries, ({ salary}) => parseInt(salary));
  return _.round(totalSalary / numEmployees);
}

const Body = () => {
  const rawEmployeeData = getEmployeesRaw();
  const maleEmployeeData = _.filter(rawEmployeeData, ({ gender }) => gender === 'M');
  const femaleEmployeeData = _.filter(rawEmployeeData, ({ gender }) => gender === 'F');
  const averageMaleSalary = getAverageSalary(maleEmployeeData);
  const averageFemaleSalary = getAverageSalary(femaleEmployeeData);
  const data = [
    { gender: 'male', averageSalary: averageMaleSalary },
    { gender: 'female', averageSalary: averageFemaleSalary },
  ]
  return (
    <Container>
      <Row>
        <p>Gender differences</p>
      </Row>
      <Row>
        <DataVizCharts data={data} />
      </Row>
      <Row>
        <Table striped bordered>
          <thead>
            <tr>
              <th>Gender</th>
              <th>Department</th>
              <th>Performance</th>
              <th>Salary</th>
            </tr>
            <tr>
              <td>Male</td>
              <td>All</td>
              <td>All</td>
              <td>{`$${averageMaleSalary}`}</td>
            </tr>
            <tr>
              <td>Female</td>
              <td>All</td>
              <td>All</td>
              <td>{`$${averageFemaleSalary}`}</td>
            </tr>
          </thead>
        </Table>
      </Row>
    </Container>
  );
};

export default Body;

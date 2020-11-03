import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
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
  return totalSalary / numEmployees;
}

const Body = () => {
  const rawEmployeeData = getEmployeesRaw();
  const maleEmployeeData = _.filter(rawEmployeeData, ({ gender }) => gender === 'M');
  // console.log('maleEmployeeData', maleEmployeeData);
  const femaleEmployeeData = _.filter(rawEmployeeData, ({ gender }) => gender === 'F');
  const data = [
    { gender: 'male', averageSalary: getAverageSalary(maleEmployeeData) },
    { gender: 'female', averageSalary: getAverageSalary(femaleEmployeeData) },
  ]
  return (
    <Container>
      <Row>
        <p>Gender differences</p>
      </Row>
      <Row>
        <DataVizCharts data={data} />
      </Row>
    </Container>
  );
};

export default Body;

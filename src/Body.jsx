import { useMemo, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
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

const COMPARE_KEYS = {
  GENDER: 'gender',
  DEPARTMENT: 'department',
  PERFORMANCE: 'performance',
};

const Body = () => {
  const [compareValue, setCompareValue] = useState(COMPARE_KEYS.GENDER);
  const rawEmployeeData = useMemo(() => getEmployeesRaw(), []);
  const groupedData = useMemo(() => _.groupBy(rawEmployeeData, compareValue), [rawEmployeeData, compareValue]);
  const maleEmployeeData = useMemo(() => _.filter(rawEmployeeData, ({ gender }) => gender === 'M'), [rawEmployeeData]);
  const femaleEmployeeData = useMemo(() => _.filter(rawEmployeeData, ({ gender }) => gender === 'F'), [rawEmployeeData]);
  const averageMaleSalary = useMemo(() => getAverageSalary(maleEmployeeData), [maleEmployeeData]);
  const averageFemaleSalary = useMemo(() => getAverageSalary(femaleEmployeeData), [femaleEmployeeData]);
  const data = _.map(groupedData, (groupEmployeeData, groupName) => ({
    groupName,
    averageSalary: getAverageSalary(groupEmployeeData),
  }));
  const handleCompareButtonSelect = (eventKey) => {
    setCompareValue(eventKey);
  }
  return (
    <Container>
      <Row className="align-items-center margin-top-5">
        <p style={{ marginRight: 20 }}>Compare across</p>
        <DropdownButton id="compare-across" title={_.upperFirst(compareValue)} onSelect={handleCompareButtonSelect}>
          <Dropdown.Item eventKey={COMPARE_KEYS.GENDER}>Gender</Dropdown.Item>
          <Dropdown.Item eventKey={COMPARE_KEYS.DEPARTMENT}>Department</Dropdown.Item>
          <Dropdown.Item eventKey={COMPARE_KEYS.PERFORMANCE}>Performance</Dropdown.Item>
        </DropdownButton>
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
          </thead>
          {_.map(data, ({ groupName, averageSalary }) => (
            <tr>
              <td>{compareValue === COMPARE_KEYS.GENDER ? groupName : 'All'}</td>
              <td>{compareValue === COMPARE_KEYS.DEPARTMENT ? groupName : 'All'}</td>
              <td>{compareValue === COMPARE_KEYS.PERFORMANCE ? groupName : 'All'}</td>
              <td>{`$${averageSalary}`}</td>
            </tr>
          ))}
        </Table>
      </Row>
    </Container>
  );
};

export default Body;

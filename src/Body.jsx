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
  JOB_CODE: 'job_code',
};

const ADDITIONAL_FILTERS = {
  [COMPARE_KEYS.GENDER]: {
    M: 'M',
    F: 'F',
  },
  [COMPARE_KEYS.DEPARTMENT]: {
    SG_AND_A: 'SG&A',
    ENGINEERING: 'Engineering',
  },
}

const Body = () => {
  const [compareValue, setCompareValue] = useState(COMPARE_KEYS.GENDER);
  const rawEmployeeData = useMemo(() => getEmployeesRaw(), []);
  const groupedData = useMemo(() => _.groupBy(rawEmployeeData, compareValue), [rawEmployeeData, compareValue]);
  const unsortedData = _.map(groupedData, (groupEmployeeData, groupName) => ({
    groupName,
    averageSalary: getAverageSalary(groupEmployeeData),
  }));
  const data = _.sortBy(unsortedData, 'groupName');
  const handleCompareButtonSelect = (eventKey) => {
    setCompareValue(eventKey);
  }
  return (
    <Container>
      <Row className="align-items-center margin-top-5">
        <p style={{ marginRight: 20 }}>Compare across</p>
        <DropdownButton id="compare-across" title={_.upperFirst(compareValue)} onSelect={handleCompareButtonSelect}>
          {_.map(COMPARE_KEYS, (val) => (
            <Dropdown.Item eventKey={val}>{val}</Dropdown.Item>
          ))}
        </DropdownButton>
      </Row>
      <Row>
        <DataVizCharts data={data} label={_.upperFirst(compareValue)} />
      </Row>
      <Row>
        <Table striped bordered>
          <thead>
            <tr>
              {_.map(COMPARE_KEYS, (val) => (
                <th>{val}</th>
              ))}
              <th>Salary</th>
            </tr>
          </thead>
          <tbody>
            {_.map(data, ({ groupName, averageSalary }) => (
              <tr>
                {_.map(COMPARE_KEYS, (val) => (
                  <td>{compareValue === val ? groupName : 'All'}</td>
                ))}
                <td>{`$${averageSalary}`}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
    </Container>
  );
};

export default Body;

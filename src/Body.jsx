import { useMemo, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
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
};

const getSalaryRaw = () => {
  let data;
  if (!lazyRequire.salary) {
    data = require('./fixtures/salary.json');
    lazyRequire.salary = data;
  } else {
    data = lazyRequire.salary;
  }
  return data;
};

const salaryForEmployeeThisYear = (eid) => {
  const salaryData = getSalaryRaw();
  // only consider salary data from 2020 and take the latest datapoint
  const allSalaryThisYear = salaryData.filter(
    (item) => item.eid === eid && item.date.substring(6) === '2020'
  );
  const chronologicalSalary = _.sortBy(allSalaryThisYear, 'date');
  return _.last(chronologicalSalary);
};

const getAverageSalary = (employeeData) => {
  const allSalaries = _.map(employeeData, ({ eid }) =>
    salaryForEmployeeThisYear(eid)
  );
  const totalSalary = _.sumBy(allSalaries, ({ salary }) => parseInt(salary));
  return _.round(totalSalary / (_.size(employeeData) || 1));
};

const COMPARE_KEYS = {
  GENDER: 'gender',
  DEPARTMENT: 'department',
  PERFORMANCE: 'performance',
  JOB_CODE: 'job_code',
};

const READABLE_COMPARE_KEYS = {
  [COMPARE_KEYS.GENDER]: 'Gender',
  [COMPARE_KEYS.DEPARTMENT]: 'Department',
  [COMPARE_KEYS.PERFORMANCE]: 'Performance',
  [COMPARE_KEYS.JOB_CODE]: 'Job code',
};

const ADDITIONAL_FILTERS = {
  [COMPARE_KEYS.GENDER]: {
    ALL: 'All',
    M: 'M',
    F: 'F',
  },
  [COMPARE_KEYS.DEPARTMENT]: {
    ALL: 'All',
    DESIGN: 'Design',
    ENGINEERING: 'Engineering',
    MARKETING_AND_SALES: 'Marketing & Sales',
    SG_AND_A: 'SG&A',
  },
  [COMPARE_KEYS.PERFORMANCE]: {
    ALL: 'All',
    EXCEEDS: 'Exceeds',
    IMPROVEMENT_NEEDED: 'Improvement needed',
    MEETS: 'Meets',
    REDEFINES: 'Redefines',
  },
  [COMPARE_KEYS.JOB_CODE]: {
    ALL: 'All',
    R1: 'R1',
    R2: 'R2',
    R3: 'R3',
    R4: 'R4',
    R5: 'R5',
    R6: 'R6',
    R7: 'R7',
    R8: 'R8',
    R9: 'R9',
    R10: 'R10',
  },
};

const initialFilter = {
  [COMPARE_KEYS.GENDER]: ADDITIONAL_FILTERS[COMPARE_KEYS.GENDER].ALL,
  [COMPARE_KEYS.DEPARTMENT]: ADDITIONAL_FILTERS[COMPARE_KEYS.DEPARTMENT].ALL,
  [COMPARE_KEYS.PERFORMANCE]: ADDITIONAL_FILTERS[COMPARE_KEYS.PERFORMANCE].ALL,
  [COMPARE_KEYS.JOB_CODE]: ADDITIONAL_FILTERS[COMPARE_KEYS.JOB_CODE].ALL,
};

const rawEmployeeData = getEmployeesRaw();

const groupedDataByType = _.reduce(
  COMPARE_KEYS,
  (acc, compareKey) => ({
    ...acc,
    [compareKey]: _.groupBy(rawEmployeeData, compareKey),
  }),
  {}
);

const ACCEPTABLE_DIFFERENCE = 0.2;

// TODO: test
const getSecondHighestSalaryFromGroups = (groups) => {
  let highestSalary = 0;
  let secondHighestSalary = 0;
  _.forEach(groups, ({ averageSalary }) => {
    if (highestSalary < averageSalary) {
      highestSalary = averageSalary;
    }
  });
  _.forEach(groups, ({ averageSalary }) => {
    if (secondHighestSalary < averageSalary && averageSalary < highestSalary) {
      secondHighestSalary = averageSalary;
    }
  });
  return secondHighestSalary;
};

// TODO: test
const getSecondLowestSalaryFromGroups = (groups) => {
  let lowestSalary = Number.MAX_VALUE;
  let secondLowestSalary = Number.MAX_VALUE;
  _.forEach(groups, ({ averageSalary }) => {
    if (lowestSalary > averageSalary) {
      lowestSalary = averageSalary;
    }
  });
  _.forEach(groups, ({ averageSalary }) => {
    if (secondLowestSalary > averageSalary && averageSalary > lowestSalary) {
      secondLowestSalary = averageSalary;
    }
  });
  return secondLowestSalary;
};

const Body = () => {
  const [compareValue, setCompareValue] = useState(COMPARE_KEYS.GENDER);
  const [
    shouldShowAdditionalFilters,
    setShouldShowAdditionalFilters,
  ] = useState(false);
  const [additionalFilters, setAdditionalFilters] = useState(initialFilter);
  const [hasDismissedOverpaidAlert, setHasDismissedOverpaidAlert] = useState(
    false
  );
  const [hasDismissedUnderpaidAlert, setHasDismissedUnderpaidAlert] = useState(
    false
  );
  // data to power charts
  const groupedData = groupedDataByType[compareValue];
  const unsortedData = useMemo(
    () =>
      _.map(groupedData, (groupEmployeeData, groupName) => {
        const filteredEmployeeData = _.filter(groupEmployeeData, (employee) => {
          return _.every(additionalFilters, (filterValue, filterType) => {
            if (filterValue === 'All') {
              return true;
            }
            return employee[filterType] === filterValue;
          });
        });
        return {
          groupName,
          averageSalary: getAverageSalary(filteredEmployeeData),
          numEmployees: _.size(filteredEmployeeData),
        };
      }),
    [groupedData, additionalFilters]
  );
  const data = useMemo(() => _.sortBy(unsortedData, 'groupName'), [
    unsortedData,
  ]);

  // data to power smart alerts

  // TODO: do comparisons against mean salaries as well for alerts
  // const totalSalaryAcrossFilteredGroups = _.reduce(
  //   data,
  //   (acc, { averageSalary, numEmployees }) => acc + (averageSalary * numEmployees),
  //   0
  // );
  // const totalNumOfFilteredEmployees = _.sumBy(data, 'numEmployees');
  // const avgSalaryAcrossFilteredGroups = totalSalaryAcrossFilteredGroups / (totalNumOfFilteredEmployees || 1);

  const secondHighestSalary = getSecondHighestSalaryFromGroups(data);
  const secondLowestSalary = getSecondLowestSalaryFromGroups(data);
  const overpaidGroupVsNextBest = _.find(
    data,
    ({ averageSalary }) =>
      !!averageSalary &&
      !!secondHighestSalary &&
      averageSalary > secondHighestSalary * (1 + ACCEPTABLE_DIFFERENCE)
  );
  const underpaidGroupVsNextBest = _.find(
    data,
    ({ averageSalary }) =>
      !!averageSalary &&
      !!secondLowestSalary &&
      averageSalary < secondLowestSalary * (1 - ACCEPTABLE_DIFFERENCE)
  );
  console.log('overpaidGroupVsNextBest', overpaidGroupVsNextBest);

  const handleCompareButtonSelect = (eventKey) => {
    setCompareValue(eventKey);
    setAdditionalFilters(initialFilter);
  };
  const handleClickAdditionalFiltersLink = (e) => {
    e.preventDefault();
    setShouldShowAdditionalFilters(!shouldShowAdditionalFilters);
  };
  return (
    <Container>
      <Row className="align-items-center">
        <p style={{ marginRight: 20 }}>Compare across</p>
        <DropdownButton
          id="compare-across"
          title={_.upperFirst(compareValue)}
          onSelect={handleCompareButtonSelect}
        >
          {_.map(COMPARE_KEYS, (val) => (
            <Dropdown.Item eventKey={val}>
              {READABLE_COMPARE_KEYS[val]}
            </Dropdown.Item>
          ))}
        </DropdownButton>
        <Button
          variant="secondary"
          style={{ marginLeft: 30 }}
          onClick={handleClickAdditionalFiltersLink}
        >
          {shouldShowAdditionalFilters
            ? 'Hide additional filters'
            : 'Show additional filters'}
        </Button>
      </Row>
      {!_.isEmpty(overpaidGroupVsNextBest) && !hasDismissedOverpaidAlert && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setHasDismissedOverpaidAlert(true)}
        >
          {`Under the selected filters, employees with ${compareValue} ${
            overpaidGroupVsNextBest.groupName
          } are paid ${_.round(
            (overpaidGroupVsNextBest.averageSalary / secondHighestSalary - 1) *
              100
          )}% more than the next highest paid group`}
        </Alert>
      )}
      {!_.isEmpty(underpaidGroupVsNextBest) && !hasDismissedUnderpaidAlert && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setHasDismissedUnderpaidAlert(true)}
        >
          {`Under the selected filters, employees with ${compareValue} ${
            underpaidGroupVsNextBest.groupName
          } are paid ${_.round(
            (1 - underpaidGroupVsNextBest.averageSalary / secondLowestSalary) *
              100
          )}% less than the next lowest paid group`}
        </Alert>
      )}
      {shouldShowAdditionalFilters && (
        <>
          <br />
          <Row>Additional filters</Row>
          {_.map(ADDITIONAL_FILTERS, (subgroups, groupName) => {
            if (groupName === compareValue) {
              return null;
            }
            return (
              <Row className="filter-label">
                {groupName}:
                <ButtonGroup toggle>
                  {_.map(subgroups, (subgroupName, subgroupKey) => {
                    const handleChangeFilterRadio = (e) => {
                      setAdditionalFilters({
                        ...additionalFilters,
                        [groupName]: e.currentTarget.value,
                      });
                    };
                    return (
                      <ToggleButton
                        key={`${groupName}-${subgroupName}`}
                        type="radio"
                        variant="secondary"
                        name="radio"
                        value={subgroupName}
                        checked={
                          additionalFilters[groupName] ===
                          ADDITIONAL_FILTERS[groupName][subgroupKey]
                        }
                        onChange={handleChangeFilterRadio}
                      >
                        {subgroupName}
                      </ToggleButton>
                    );
                  })}
                </ButtonGroup>
              </Row>
            );
          })}
        </>
      )}
      <Row>
        <DataVizCharts data={data} label={_.upperFirst(compareValue)} />
      </Row>
      <Row>
        <Table striped bordered>
          <thead>
            <tr>
              {_.map(COMPARE_KEYS, (val) => (
                <th>{READABLE_COMPARE_KEYS[val]}</th>
              ))}
              <th># Employees</th>
              <th>Avg. salary</th>
            </tr>
          </thead>
          <tbody>
            {_.map(data, ({ groupName, averageSalary, numEmployees }) => (
              <tr>
                {_.map(COMPARE_KEYS, (val) => (
                  <td>
                    {compareValue === val ? groupName : additionalFilters[val]}
                  </td>
                ))}
                <td>{numEmployees}</td>
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

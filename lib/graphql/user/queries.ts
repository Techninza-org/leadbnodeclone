
const GET_COMPANY_DEPT_MEMBERS = `
  query GetCompanyDeptMembers($deptId: String, $companyId: String!) {
    getCompanyDeptMembers(deptId: $deptId, companyId: $companyId) {
      id
      name
      email
      phone
      role { 
          name
      }
    }
  }
`;

const GET_COMPANIES = `
  query GetMembersByRole($role: String!) {
    getMembersByRole(role: $role) {
      name   
      companyId
    }
  }
`

export const userQueries = {
    GET_COMPANY_DEPT_MEMBERS,
    GET_COMPANIES
}
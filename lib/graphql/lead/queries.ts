const GET_COMPANY_LEADS = `
  query GetCompanyLeads($companyId: String) {
    getCompanyLeads(companyId: $companyId) {
      lead {
        id
        name
        email
        phone
        alternatePhone
        callStatus
        paymentStatus
        department
        bids {
          id
          bidAmount
        }

        leadMember {
          id
          member {
            name
          }
        }
        followUps {
          id
          nextFollowUpDate
          remark
          customerResponse
          dynamicFieldValues
          rating
          leadId
          followUpBy
          createdAt
          updatedAt
       }
        

        submittedForm {
          id
          formName
          memberId
          dependentOnFormName
          member {
            name
            role {
              name
            }
          }
          formValue {
            id
            formValueId
            name
            fieldType
            value
          }
          dependentOnValue {
            id
            formValueId
            name
            fieldType
            value
          }
        }
      }

     
    }
  }
`;

const GET_PROSPECT_LEADS = `
  query GetCompanyProspects {
    getCompanyProspects {
        id
        name
        email
        alternatePhone
        callStatus
        paymentStatus
        phone
        isLeadConverted
        followUps {
          id
          nextFollowUpDate
          remark
          customerResponse
          dynamicFieldValues
          rating
          leadId
          followUpBy
          createdAt
          updatedAt
       }
    }
  }
`;

const GET_ASSIGNED_LEADS = `
query getAssignedLeads($userId: String!) {
    getAssignedLeads(userId: $userId) {
      id
      name
      email
      phone
      alternatePhone
      callStatus
      paymentStatus
      bids{
        id
        bidAmount
      }
      submittedForm {
        id
        formName
        memberId
        member {
            name
            role {
                name
            }
        }
        formValue {
            id
            name
            fieldType
            value
        }
      }

      leadMember {
        member { 
            name
        }
      }
      nextFollowUpDate
      createdAt
    }
  }
`;

const GET_LEAD_BIDS_QUERY = `
  query GetLeadBids($leadId: String!) {
    getLeadBids(leadId: $leadId) {
      bidAmount
      Member {
        id
        name
      }
    }
  }
`;

const GET_LAST_MONTH_ALL_LEADS = `
query GetLastMonthAllLeads {
    getLastMonthAllLeads {
      id
      name
      email
      phone
      alternatePhone
      address
      city
      state
      zip
      callStatus
      paymentStatus

      leadMember {
        Member { 
            name
        }
      }
    }
  }
`;

const UPDATE_LEAD_FOLLOW_UP_DATE = `
  query UpdateLeadFollowUpDate($leadId: String!, $nextFollowUpDate: String!) {
    updateLeadFollowUpDate(leadId: $leadId, nextFollowUpDate: $nextFollowUpDate) {
      id
      nextFollowUpDate
    }
  }
`;

const GET_LEADS_BY_DATE_RANGE = `
  query GetLeadsByDateRange($companyId: ID, $startDate: String!, $endDate: String!) {
    getLeadsByDateRange(companyId: $companyId, startDate: $startDate, endDate: $endDate) {
      callCount
      totalPayCollectedCount
      numberOfLeads
      groupedCallPerday
      leadsWithFeedbackByRole
    }
  }
`;

const GET_TRANSFERED_LEADS = `
  query GetTransferedLeads($userId: String!) {
    getTransferedLeads(userId: $userId) {
      id
      name   
      LeadTransferTo {
           transferBy {
              id
              name
              role{
                  name
              }
           }
           transferTo {
              id
              name
              role{
                  name
              }
           }
        }
    }
  }
`;

const GET_FOLLOWUP = `
  query getFollowUpByLeadId($leadId: String!) {
    getFollowUpByLeadId(leadId: $leadId) {
      id
      followUpBy{
          name
      }
      customerResponse
      nextFollowUpDate
      rating
      leadId
      createdAt
      remark
    }
  }
`;

export const leadQueries = {
  GET_COMPANY_LEADS,
  GET_PROSPECT_LEADS,
  GET_ASSIGNED_LEADS,
  GET_LEAD_BIDS_QUERY,
  GET_LAST_MONTH_ALL_LEADS,
  UPDATE_LEAD_FOLLOW_UP_DATE,
  GET_LEADS_BY_DATE_RANGE,
  GET_TRANSFERED_LEADS,
  GET_FOLLOWUP,
};

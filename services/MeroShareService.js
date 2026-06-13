const axios = require('axios');

const MERO_SHARE_BASE_URL = 'https://webbackend.cdsc.com.np/api/meroShare';

const meroshareClient = axios.create({
  baseURL: MERO_SHARE_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let lastRequestTime = Date.now();
meroshareClient.interceptors.request.use(async (config) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const minDelay = 2000;

  if (timeSinceLastRequest < minDelay) {
    const jitter = Math.random() * 3000;
    const totalDelay = minDelay - timeSinceLastRequest + jitter;
    await new Promise((resolve) => setTimeout(resolve, totalDelay));
  }

  lastRequestTime = Date.now();
  return config;
});

class MeroShareService {
  constructor() {
    this.sessionId = null;
    this.userName = null;
    this.demat = null;
    this.boid = null;
    // Each instance gets its own axios config overrides so concurrent
    // instances don't clobber each other's auth headers
    this.authHeader = null;
  }

  _authConfig(extraConfig = {}) {
    return {
      ...extraConfig,
      headers: {
        ...(extraConfig.headers || {}),
        ...(this.authHeader ? { Authorization: this.authHeader } : {}),
      },
    };
  }

  async login(username, password, clientId) {
    try {
      const response = await meroshareClient.post('/auth', {
        clientId,
        username,
        password,
      });

      if (response.data && response.data.statusCode === 200) {
        // MeroShare returns the session token in the Authorization response header
        this.authHeader =
          response.headers['authorization'] || response.headers['Authorization'];

        if (!this.authHeader) {
          throw new Error('Login response did not include an Authorization header');
        }

        this.sessionId = this.authHeader;
        this.userName = username;

        return {
          success: true,
          data: response.data,
          sessionId: this.sessionId,
          userName: this.userName,
        };
      }

      throw new Error(response.data?.message || 'Invalid login response');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      throw new Error(`Login failed: ${errorMsg}`);
    }
  }

  async logout() {
    try {
      if (!this.authHeader) {
        console.warn('No session to logout');
        return true;
      }

      await meroshareClient.post('/auth/logout/', {}, this._authConfig());
      this.authHeader = null;
      this.sessionId = null;
      this.userName = null;
      return true;
    } catch (error) {
      console.error('Logout error:', error.message);
      return true;
    }
  }

  async getBanks() {
    try {
      const response = await meroshareClient.get('/bank', this._authConfig());
      return response.data?.data || response.data?.object || [];
    } catch (error) {
      throw new Error(`Failed to fetch banks: ${error.message}`);
    }
  }

  async getAccountDetails(bankId) {
    try {
      const response = await meroshareClient.get(`/bank/${bankId}`, this._authConfig());
      return response.data || [];
    } catch (error) {
      throw new Error(`Failed to fetch account details: ${error.message}`);
    }
  }

  async getOwnDetails() {
    try {
      const response = await meroshareClient.get('/ownDetail', this._authConfig());
      const data = response.data?.data || response.data?.object || response.data || {};
      this.demat = data.demat || data.dematNumber || this.demat;
      this.boid = data.boid || this.boid;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch own details: ${error.message}`);
    }
  }

  async getApplicableIssues() {
    try {
      const response = await meroshareClient.post(
        '/companyShare/applicableIssue/',
        {
          filterFieldParams: [
            { key: 'companyIssue.companyISIN.script', alias: 'Scrip' },
            { key: 'companyIssue.companyName', alias: 'Company Name' },
          ],
          filterDateParams: [
            { key: 'minIssueOpenDate', condition: '', alias: '', value: '' },
            { key: 'maxIssueCloseDate', condition: '', alias: '', value: '' },
          ],
          page: 1,
          size: 10,
          searchRoleViewConstants: 'VIEW_APPLICABLE_SHARE',
          filterDateParams2: [],
        },
        this._authConfig()
      );

      return response.data?.object || [];
    } catch (error) {
      throw new Error(`Failed to fetch applicable issues: ${error.message}`);
    }
  }

  /**
   * Determine if an issue is currently open for application,
   * derived from the applicableIssue response itself —
   * avoids relying on an undocumented /active/:id endpoint.
   */
  checkActiveFromIssue(issue) {
    const now = new Date();
    const openDate = issue.issueOpenDate ? new Date(issue.issueOpenDate) : null;
    const closeDate = issue.issueCloseDate ? new Date(issue.issueCloseDate) : null;

    const statusOk = issue.statusName === 'CREATE_APPROVE' || issue.statusName === 'APPROVE';
    const withinWindow = (!openDate || now >= openDate) && (!closeDate || now <= closeDate);

    return statusOk && withinWindow;
  }

  async checkCanApply(companyShareId, demat) {
    try {
      const response = await meroshareClient.get(
        `/applicantForm/customerType/${companyShareId}/${demat}`,
        this._authConfig()
      );
      const data = response.data?.data || response.data?.object || response.data || {};
      return { canApply: true, eligible: true, ...data };
    } catch (error) {
      return { canApply: false, reason: error.response?.data?.message || error.message };
    }
  }

  async applyForShare(applicationData) {
    try {
      const response = await meroshareClient.post(
        '/applicantForm/share/apply',
        applicationData,
        this._authConfig()
      );

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      throw new Error('Invalid apply response');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      throw new Error(`Share application failed: ${errorMsg}`);
    }
  }

  async findAndApplyForShare(options = {}) {
    try {
      const issues = await this.getApplicableIssues();

      if (!issues || issues.length === 0) {
        throw new Error('No applicable issues available');
      }

      let targetIssue = issues[0];
      if (options.targetCompanyShareId) {
        targetIssue = issues.find(
          (issue) => String(issue.companyShareId) === String(options.targetCompanyShareId)
        );
        if (!targetIssue) {
          throw new Error(`Target company share not found: ${options.targetCompanyShareId}`);
        }
      }

      if (!this.demat || !this.boid) {
        await this.getOwnDetails();
      }
      if (!this.demat) {
        throw new Error('Could not determine demat number');
      }

      const isActive = this.checkActiveFromIssue(targetIssue);
      if (!isActive) {
        throw new Error(`IPO not active: ${targetIssue.companyName}`);
      }

      const canApply = await this.checkCanApply(targetIssue.companyShareId, this.demat);
      if (!canApply.canApply) {
        throw new Error(`Not eligible for: ${targetIssue.companyName}`);
      }

      // Fetch bank account details — required for accountNumber, customerId, etc.
      if (!options.bankId) {
        throw new Error('bankId is required to apply');
      }
      const accounts = await this.getAccountDetails(options.bankId);
      const account = Array.isArray(accounts) ? accounts[0] : accounts;
      if (!account || !account.accountNumber) {
        throw new Error('Could not fetch bank account details for the given bankId');
      }

      const applicationData = {
        demat: this.demat,
        boid: this.boid,
        accountNumber: account.accountNumber,
        customerId: account.id,
        accountBranchId: account.accountBranchId,
        accountTypeId: account.accountTypeId,
        appliedKitta: String(options.noOfShare || 10),
        bankId: String(options.bankId),
        companyShareId: String(targetIssue.companyShareId),
        crnNumber: options.crn,
        transactionPIN: String(options.transactionPIN),
      };

      const result = await this.applyForShare(applicationData);
      return {
        success: true,
        appliedFor: targetIssue.companyName,
        result,
      };
    } catch (error) {
      throw new Error(`Failed to find and apply: ${error.message}`);
    }
  }
  isSessionValid() {
    return Boolean(this.authHeader && this.demat);
  }

  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userName: this.userName,
      demat: this.demat,
      boid: this.boid,
      isValid: this.isSessionValid(),
    };
  }
}

module.exports = MeroShareService;
const axios = require('axios');

const MERO_SHARE_BASE_URL = 'https://webbackend.cdsc.com.np/api/meroShare';

// Configure axios instance with safe defaults
const meroshareClient = axios.create({
  baseURL: MERO_SHARE_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for safe delays between requests
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
  }

  /**
   * Login to MeroShare
   * @param {string} username - MeroShare username
   * @param {string} password - MeroShare password
   * @param {string} pin - Transaction PIN
   * @returns {Promise<Object>} Login response with session info
   */
  async login(username, password, clientId) {
    try {
      const response = await meroshareClient.post('/auth', {
        clientId,
        username,
        password,
      });

      // MeroShare returns statusCode 200 + message, but session info
      // typically comes back via a response header, not response.data.data
      if (response.data && response.data.statusCode === 200) {
        // Session ID is usually in the 'Authorization' response header
        this.sessionId = response.headers['authorization'] || response.headers['Authorization'];
        this.userName = username;
        this.demat = null; // fetch via getOwnDetails()
        this.boid = null;

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

  /**
   * Logout from MeroShare
   * @returns {Promise<boolean>}
   */
  async logout() {
    try {
      if (!this.sessionId) {
        console.warn('No session ID to logout');
        return true;
      }

      await meroshareClient.post(`/auth/logout/?session_id=${this.sessionId}`);
      this.sessionId = null;
      this.userName = null;
      return true;
    } catch (error) {
      console.error('Logout error:', error.message);
      // Don't throw - always consider logout success to prevent state issues
      return true;
    }
  }

  /**
   * Get all banks
   * @returns {Promise<Array>}
   */
  async getBanks() {
    try {
      const response = await meroshareClient.get('/bank');
      return response.data?.data || [];
    } catch (error) {
      throw new Error(`Failed to fetch banks: ${error.message}`);
    }
  }

  /**
   * Get account details for a bank
   * @param {string} bankId - Bank ID
   * @returns {Promise<Object>}
   */
  async getAccountDetails(bankId) {
    try {
      const response = await meroshareClient.get(`/bank/${bankId}`);
      return response.data?.data || {};
    } catch (error) {
      throw new Error(`Failed to fetch account details: ${error.message}`);
    }
  }

  /**
   * Get own details (client profile)
   * @returns {Promise<Object>}
   */
  async getOwnDetails() {
    try {
      const response = await meroshareClient.get('/ownDetail', {
        params: { session_id: this.sessionId },
      });
      return response.data?.data || {};
    } catch (error) {
      throw new Error(`Failed to fetch own details: ${error.message}`);
    }
  }

  /**
   * Get applicable IPOs/issues
   * @returns {Promise<Array>}
   */
  async getApplicableIssues() {
    try {
      const response = await meroshareClient.get('/companyShare/applicableIssue', {
        params: { session_id: this.sessionId },
      });
      return response.data?.data || [];
    } catch (error) {
      throw new Error(`Failed to fetch applicable issues: ${error.message}`);
    }
  }

  /**
   * Check if user can apply for a specific share
   * @param {string} companyShareId - Company share ID
   * @param {string} demat - DEMAT account number
   * @returns {Promise<Object>}
   */
  async checkCanApply(companyShareId, demat) {
    try {
      const response = await meroshareClient.get(
        `/applicantForm/customerType/${companyShareId}/${demat}`,
        {
          params: { session_id: this.sessionId },
        }
      );
      return response.data?.data || {};
    } catch (error) {
      // Not an error if user can't apply - just return false
      return { canApply: false, reason: error.message };
    }
  }

  /**
   * Check if IPO is active/valid
   * @param {string} companyShareId - Company share ID
   * @returns {Promise<boolean>}
   */
  async checkActiveIPO(companyShareId) {
    try {
      const response = await meroshareClient.get(`/active/${companyShareId}`, {
        params: { session_id: this.sessionId },
      });
      const result = response.data?.data;
      return result?.isActive === true || result?.active === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Apply for shares
   * @param {Object} applicationData - Application form data
   * @returns {Promise<Object>}
   */
  async applyForShare(applicationData) {
    try {
      const payload = {
        ...applicationData,
        session_id: this.sessionId,
      };

      const response = await meroshareClient.post('/applicantForm/share/apply', payload);

      if (response.data?.data) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error('Invalid apply response');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      throw new Error(`Share application failed: ${errorMsg}`);
    }
  }

  /**
   * Find and apply for optimal share based on strategy
   * Automatically selects the best IPO and applies
   * @param {Object} options - Options for application
   * @returns {Promise<Object>}
   */
  async findAndApplyForShare(options = {}) {
    try {
      // 1. Get applicable issues
      const issues = await this.getApplicableIssues();

      if (!issues || issues.length === 0) {
        throw new Error('No applicable issues available');
      }

      // 2. Filter for target company if specified
      let targetIssue = issues[0];
      if (options.targetCompanyShareId) {
        targetIssue = issues.find(
          (issue) => issue.id === options.targetCompanyShareId || issue.companyShareId === options.targetCompanyShareId
        );
        if (!targetIssue) {
          throw new Error(`Target company share not found: ${options.targetCompanyShareId}`);
        }
      } else {
        // Select issue with best chances (highest available quantity, most recent)
        targetIssue = issues.sort((a, b) => {
          const aQty = a.totalShares || a.totalShare || 0;
          const bQty = b.totalShares || b.totalShare || 0;
          return bQty - aQty;
        })[0];
      }

      // 3. Check if active
      const isActive = await this.checkActiveIPO(targetIssue.id || targetIssue.companyShareId);
      if (!isActive) {
        throw new Error(`IPO not active: ${targetIssue.companyName}`);
      }

      // 4. Check eligibility
      const canApply = await this.checkCanApply(targetIssue.id || targetIssue.companyShareId, this.demat);
      if (!canApply.canApply && !canApply.eligible) {
        throw new Error(`Not eligible for: ${targetIssue.companyName}`);
      }

      // 5. Build application data
      const applicationData = {
        companyShareId: targetIssue.id || targetIssue.companyShareId,
        companyName: targetIssue.companyName,
        demat: this.demat,
        crn: options.crn,
        noOfShare: options.noOfShare || 1,
        bankCode: options.bankCode,
        ...options.customData,
      };

      // 6. Apply
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

  /**
   * Check if safe to apply (rate limiting check)
   * @returns {Promise<boolean>}
   */
  isSessionValid() {
    return this.sessionId && this.demat;
  }

  /**
   * Get current session info
   * @returns {Object}
   */
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

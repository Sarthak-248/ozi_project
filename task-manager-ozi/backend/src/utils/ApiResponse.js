class ApiResponse {
  constructor({ status = 'success', data = null, message = '' } = {}) {
    this.status = status;
    this.data = data;
    this.message = message;
  }
}

module.exports = ApiResponse;

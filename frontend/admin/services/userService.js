const throwUnavailable = () => {
  throw new Error('User management API is not available on the backend');
};

export const UserService = {
  async getAll() {
    throwUnavailable();
  },

  async getById(id) {
    throwUnavailable();
  },

  async update(id, data) {
    throwUnavailable();
  },

  async delete(id) {
    throwUnavailable();
  },

  async getBookings(userId) {
    throwUnavailable();
  },

  async updateStatus(id, status) {
    throwUnavailable();
  },
};

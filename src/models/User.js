import { db } from "../data.js";

export class User {
  static findById(id) {
    return db.users.find(user => user.id === id);
  }

  static findByEmail(email) {
    return db.users.find(user => user.email === email);
  }

  static findByCredentials(email, password) {
    return db.users.find(user => user.email === email && user.password === password);
  }

  static getAll() {
    return db.users;
  }

  static create(userData) {
    const user = { ...userData };
    db.users.push(user);
    return user;
  }

  static update(id, updateData) {
    const index = db.users.findIndex(user => user.id === id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...updateData };
      return db.users[index];
    }
    return null;
  }

  static delete(id) {
    const index = db.users.findIndex(user => user.id === id);
    if (index !== -1) {
      return db.users.splice(index, 1)[0];
    }
    return null;
  }
}

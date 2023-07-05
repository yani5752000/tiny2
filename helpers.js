const getUserByEmail = (email, users) => {
    for (let id in users) {
        if(users[id].email == email) {
            return users[id];
        }
    }
    return null;
  }



  module.exports = { getUserByEmail };
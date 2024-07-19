const APIs = (() => {
  const baseUrl = "http://localhost:3000/users";

  const getUsers = () => {
    return fetch(baseUrl).then((res) => res.json());
  };

  const createUser = (newUser) => {
    return fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    }).then((res) => res.json());
  };

  const updateUser = (id, updatedUser) => {
    return fetch(`${baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    }).then((res) => res.json());
  };

  const deleteUser = (id) => {
    return fetch(`${baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  };
  return {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
  };
})();

const Model = (() => {
  class State {
    #users;
    #onChange;
    constructor() {
      this.#users = [];
    }

    get users() {
      return this.#users;
    }

    set users(newUser) {
      this.#users = newUser;
      this.#onChange();
    }

    subscribe(cb) {
      this.#onChange = cb;
    }
  }

  return {
    State,
    ...APIs,
  };
})();

const View = (() => {
  const userTableEl = document.querySelector(".user__table");
  const addBtnEl = document.querySelector(".user__add-btn");
  const inputFirstNameEl = document.querySelector(".input-fName");
  const inputLastNameEl = document.querySelector(".input-lName");
  const inputEmailEl = document.querySelector(".input-email");
  const inputPhoneEl = document.querySelector(".input-phone");

  const getInputValues = () => {
    return {
      firstName: inputFirstNameEl.value,
      lastName: inputLastNameEl.value,
      email: inputEmailEl.value,
      phone: inputPhoneEl.value,
    };
  };

  const setInputValues = (user) => {
    inputFirstNameEl.value = user.firstName;
    inputLastNameEl.value = user.lastName;
    inputEmailEl.value = user.email;
    inputPhoneEl.value = user.phone;
  };

  const clearInputValues = () => {
    inputFirstNameEl.value = "";
    inputLastNameEl.value = "";
    inputEmailEl.value = "";
    inputPhoneEl.value = "";
  };

  const renderUsers = (users) => {
    let usersTemp = "";
    users.forEach((user) => {
      const userItemTemp = `<tr id=${user.id}>
        <td>${user.firstName}</td>
        <td>${user.lastName}</td>
        <td>${user.email}</td>
        <td>${user.phone}</td>
        <td>
          <button id="editBtn" class="user__edit-btn">Edit</button>
          <button class="user__delete-btn">Delete</button>
        </td>
      </tr>`;
      usersTemp += userItemTemp;
    });
    userTableEl.innerHTML = usersTemp;
  };

  return {
    renderUsers,
    getInputValues,
    setInputValues,
    clearInputValues,
    addBtnEl,
    userTableEl,
  };
})();

const Controller = ((view, model) => {
  const state = new model.State();
  let currentUserId = null;

  const setUpAddHandler = () => {
    view.addBtnEl.addEventListener("click", (event) => {
      event.preventDefault();
      const inputValues = view.getInputValues();

      if (currentUserId) {
        model.updateUser(currentUserId, inputValues).then((data) => {
          state.users = state.users.map((user) =>
            user.id === currentUserId ? data : user
          );
          view.clearInputValues();
          currentUserId = null;
        });
      } else {
        model.createUser(inputValues).then((data) => {
          state.users = [...state.users, data];
          view.clearInputValues();
        });
      }
    });
  };

  view.userTableEl.addEventListener("click", (event) => {
    const element = event.target;
    if (element.className === "user__delete-btn") {
      const id = element.parentElement.parentElement.getAttribute("id");
      model.deleteUser(id).then(() => {
        state.users = state.users.filter((user) => user.id !== id);
      });
    }
    if (element.className === "user__edit-btn") {
      const id = element.parentElement.parentElement.getAttribute("id");
      const user = state.users.find((user) => user.id === id);
      view.setInputValues(user);
      view.addBtnEl.textContent = "Edit";
      currentUserId = id;
    }
  });

  const init = () => {
    state.subscribe(() => {
      view.renderUsers(state.users);
    });
    model.getUsers().then((data) => {
      state.users = data;
    });
    setUpAddHandler();
  };
  return {
    init,
  };
})(View, Model);

Controller.init();

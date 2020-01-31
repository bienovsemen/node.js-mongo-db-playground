// /client/App.js
import React, { Component } from "react";
import axios from "axios";

class App extends Component {
  // initialize our state
  state = {
    data: [],
    id: 0,
    message: null,
    intervalIsSet: false,
    idToDelete: null,
    idToUpdate: null,
    objectToUpdate: null
  };

  // when component mounts, first thing it does is fetch all existing data in our db
  // then we incorporate a polling logic so that we can easily see if our db has
  // changed and implement those changes into our UI
  componentDidMount() {
    this.getDataFromDb();
  }

  // never let a process live forever
  // always kill a process everytime we are done using it
  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  // just a note, here, in the front end, we use the id key of our data object
  // in order to identify which we want to Update or delete.
  // for our back end, we use the object id assigned by MongoDB to modify
  // data base entries

  // our first get method that uses our backend api to
  // fetch data from our data base
  generateKey = pre => {
    return `${pre}_${new Date().getTime()}`;
  };
  updateListing = (listingItems, idx, item) => {
    if (item === undefined) {
      console.log("1");
      return [...listingItems.slice(0, idx), ...listingItems.slice(idx + 1)];
    }

    if (idx === -1) {
      console.log("2");

      return [...listingItems, item];
    }
    console.log("3");

    return [
      ...listingItems.slice(0, idx),
      item,
      ...listingItems.slice(idx + 1)
    ];
  };

  getDataFromDb = () => {
    fetch("http://localhost:3001/api/getData")
      .then(data => data.json())
      .then(res => this.setState({ data: res.data }));
  };

  // our put method that uses our backend api
  // to create new query into our data base
  putDataToDB = message => {
    // let currentIds = this.state.data.map(data => data.id);
    let idToBeAdded = this.generateKey("pre_");
    axios
      .post("http://localhost:3001/api/putData", {
        id: idToBeAdded,
        message: message
      })
      .then(response => {
        if (response.status === 200) {
          this.getDataFromDb();
        }
      });
  };

  // our delete method that uses our backend api
  // to remove existing database information
  deleteFromDB = idTodelete => {
    axios
      .delete("http://localhost:3001/api/deleteData", {
        data: {
          id: idTodelete
        }
      })
      .then(res => {
        if (res.status === 200) {
          const listingArray = this.state.data;
          const itemIndex = listingArray.findIndex(
            ({ _id }) => _id === idTodelete
          );
          const newListingArray = this.updateListing(listingArray, itemIndex);
          this.setState({ data: newListingArray });
        }
      });
  };

  // our update method that uses our backend api
  // to overwrite existing data base information
  updateDB = (idToUpdate, updateToApply) => {
    let objIdToUpdate = null;
    this.state.data.forEach(dat => {
      if (dat.id === idToUpdate) {
        objIdToUpdate = dat._id;
      }
    });

    axios
      .post("http://localhost:3001/api/updateData", {
        id: objIdToUpdate,
        update: { message: updateToApply }
      })
      .then(response => {
        if (response.status === 200) {
          this.getDataFromDb();
        }
      });
  };

  // here is our UI
  // it is easy to understand their functions when you
  // see them render into our screen
  render() {
    const { data } = this.state;
    return (
      <div>
        Test title
        <ul>
          {data.length <= 0
            ? "NO DB ENTRIES YET"
            : data.map(dat => (
                <li style={{ padding: "10px" }} key={dat._id}>
                  <span style={{ color: "gray" }}> id: </span> {dat._id} <br />
                  <span style={{ color: "gray" }}> data: </span>
                  {dat.message}
                </li>
              ))}
        </ul>
        <div style={{ padding: "10px" }}>
          <input
            type="text"
            onChange={e => this.setState({ message: e.target.value })}
            placeholder="add something in the database"
            style={{ width: "200px" }}
          />
          <button onClick={() => this.putDataToDB(this.state.message)}>
            ADD
          </button>
        </div>
        <div style={{ padding: "10px" }}>
          <input
            type="text"
            style={{ width: "200px" }}
            onChange={e => this.setState({ idToDelete: e.target.value })}
            placeholder="put id of item to delete here"
          />
          <button onClick={() => this.deleteFromDB(this.state.idToDelete)}>
            DELETE
          </button>
        </div>
        <div style={{ padding: "10px" }}>
          <input
            type="text"
            style={{ width: "200px" }}
            onChange={e => this.setState({ idToUpdate: e.target.value })}
            placeholder="id of item to update here"
          />
          <input
            type="text"
            style={{ width: "200px" }}
            onChange={e => this.setState({ updateToApply: e.target.value })}
            placeholder="put new value of the item here"
          />
          <button
            onClick={() =>
              this.updateDB(this.state.idToUpdate, this.state.updateToApply)
            }>
            UPDATE
          </button>
        </div>
      </div>
    );
  }
}

export default App;

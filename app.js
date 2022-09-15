//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

mongoose.connect(
  "mongodb+srv://admin-ansh:bhagwadgita@cluster0.vmjnc0b.mongodb.net/todoDB",
  { useNewUrlParser: true }
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

const todoSchema = {
  task: String,
};

const customSchema = {
  name: String,
  items: [todoSchema],
};

const todo = mongoose.model("todo", todoSchema);

const list = mongoose.model("list", customSchema);

const item1 = new todo({
  task: "Welcome to To Do list",
});

const item2 = new todo({
  task: "Click on + to add task",
});

const item3 = new todo({
  task: "<-- Hit the box to delete task",
});

const starter = [item1, item2, item3];

app.get("/", (req, res) => {
  todo.find(function (err, tasks) {
    if (tasks.length === 0) {
      todo.insertMany(starter, function (err) {
        if (err) console.log(err);
        else {
          console.log("Items Updated");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItem: tasks });
    }
  });
});

app.post("/", (req, res) => {
  // console.log(req.body);
  const listName1 = req.body.list;

  var item = new todo({
    task: req.body.newItem,
  });

  if (listName1 === "Today") {
    item.save();

    res.redirect("/");
  } else {
    list.findOne({ name: listName1 }, function (err, Item) {
      Item.items.push(item);
      Item.save();

      res.redirect("/" + listName1);
    });
  }
});

app.post("/delete", (req, res) => {
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    todo.findByIdAndRemove(id, function (err) {
      if (err) console.log(err);
    });
    res.redirect("/");
  } else {
    list.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: id } } },
      function (err, item) {
        if (!err) res.redirect("/" + listName);
      }
    );
  }
});

app.get("/:customListName", (req, res) => {
  const listName = _.capitalize(req.params.customListName);

  list.findOne({ name: listName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const customList = new list({
          name: listName,
          items: starter,
        });

        customList.save();

        res.redirect("/" + listName);
      } else {
        res.render("list", {
          listTitle: listName,
          newListItem: foundList.items,
        });
      }
    }
  });
});

let port = process.env.PORT;

if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("Server started!");
});

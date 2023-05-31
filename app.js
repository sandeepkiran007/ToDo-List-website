const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash")
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"))

// var item = "";
// var listArr=[];

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/itemsDB');

const itemSchema = mongoose.Schema({
    name: String
})
const Item = mongoose.model("Item", itemSchema);

const gate = new Item({
    name: "Preparing for GATE"
})
const read = new Item({
    name: "Read 10 pages"
})
const workout = new Item({
    name: "Exercise 20min"
})
const ItemArr = [gate, read, workout];

const listSchema = {
    name: String,
    items: [itemSchema]
}
const List = mongoose.model("List", listSchema);
// reading.save().then(function(err) {
//     console.log("Element added successfully", err);
// })

var today = new Date();

var options = {
    weekday: "long",
    day: "numeric",
    month: "long"
    }
var day = today.toLocaleDateString("en-US", options);


app.get("/:para", function(req, res) {
    const webName = _.capitalize(req.params.para);
    List.findOne({name: webName}).then(function(Listfound) {
        if(!Listfound) {
            const list = new List({
                name: webName,
                items: ItemArr
            })
            list.save();
            res.redirect("/"+webName);
        }else {
            res.render("list", {headTitle: webName, Item: Listfound.items})
        }
    })
    
})

app.post("/", function(req, res) {
    const itemName = req.body.listItem;
    const ListName = req.body.List;
    const item = new Item({
        name: itemName
    })
    if (day==itemName) {
        item.save()
        res.redirect("/");
    } else {
        List.findOne({name: ListName}).then(function(foundList) {
            foundList.items.push(item);
            foundList.save()
            res.redirect("/"+ListName);
        })
    }
})
app.post("/delete", function(req, res) {
    const id = req.body.checkbox;
    const ListName = req.body.ListName;
    if(ListName==day) {
        Item.deleteOne({_id: id}).then(function() {
            console.log("Item Deleted from main page Successfully");
        })
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: ListName}, {$pull: {items: {_id: id}}}).then(function() {
            console.log("Item Deleted in sub page successfully");
            res.redirect("/"+ListName);
        })
    }
    
})
app.get("/" , function(req, res) {
    


    Item.find().then(function(item) {
        if(item.length === 0) {
            Item.insertMany(ItemArr).then(function() {
                console.log("Item added successfully.");
            }).catch(function(err) {
                console.log(err);
            })
            res.redirect("/");
        }else {
            res.render("index", {headTitle: day, Item: item});
        }

    })

    
}
)

app.listen(3000, function() {
    console.log("The server is up and running at port 3000.");
})
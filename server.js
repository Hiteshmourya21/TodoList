 // jshint esversion:6

const express = require('express')
const bodyParser = require('body-parser')
const path = require('path');
const mongoose = require("mongoose")
const _ = require("lodash")


const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-Hitesh:ngLkzNbSY3P2oPPK@todocluster0.fbpvwqb.mongodb.net/todolistDB");

const itemsSchema ={
  name : String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item ({
  name : "Welcome to your Todolist"
});
const item2 = new Item ({
  name : "Hit + to add item to your Todolist"
});
const item3 = new Item ({
  name : "<-- Hit this to delete a Todo in your Todolist"
});
const defultItems = [item1,item2,item3]

const listSchema = {
  name : String,
  items :[itemsSchema]
};

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {
    Item.find().then(foundItems => {
        if(foundItems.length===0){
          Item.insertMany(defultItems).then(err=>{
            console.log("Successfully added default Items")
          }).catch(err =>{
              console.log(err)
          })
          res.redirect("/")
        }else{
          res.render("list",{ListTilte:"Today" , newListItems:foundItems})
        }
  }).catch(err => {
      console.error('Error finding tanks:', err);
      });

})
app.post("/",function(req,res){
  const listName = req.body.list;
  const  itemName = req.body.newtodo;
  const item = new Item( {
    name : itemName
  });

  if(listName=="Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listName}).then(foundlist=>{
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+foundlist.name)
    }).catch(err=>{
      console.log(err);
    })
  }

})

app.post("/delete",function(req,res){
  const checkedItemId =  req.body.checkbox;
  const ListName = req.body.ListName;
  if(ListName == "Today"){
    Item.findByIdAndDelete(checkedItemId).then( err =>{
      console.log("Sucessfuly Deleted Id:"+checkedItemId)
      res.redirect("/")
    }).catch(err=>{
      console.log("Error:"+err)
    })
  }else{
    List.findOneAndUpdate({name:ListName},{$pull:{items:{_id:checkedItemId}}}).then(foundlist=>{
      res.redirect("/"+ListName)
    }).catch(err=>{
      console.log(err);
    })
  }

});

app.get("/:ListName", function(req, res) {
    const customListName = _.capitalize(req.params.ListName)
    if(customListName=="about"||customListName=="About"){
      res.render("about")

    }else{
      List.findOne({name : customListName}).then(foundlist =>{
        if(!foundlist){
          const list = new List({
            name : customListName,
            items : defultItems
          })
          list.save();
          res.redirect("/"+customListName)
        }else{
          res.render("list",{ListTilte:customListName , newListItems:foundlist.items})
        }
      }).catch(err=>{
        console.log("Error:"+err)
      })

    }
})

app.post("/about",function(req,res){
  if(req.body.aboutbutton==''){
    res.redirect("/about")
  }
  else{
    res.redirect("/")
  }
})

let port = process.env.PORT;
if(port== null||port==""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started Successfully")
})

'use strict';

const mongoose = require("mongoose");
const { Schema } = mongoose;

module.exports = function (app) {

  const issueSchema = new Schema({
    issue_title: {type: String, required: true},
    issue_text: {type: String, required: true},
    created_on : {type: Date},
    updated_on : {type: Date, default: new Date()},
    created_by: {type: String, required: true},
    assigned_to : {type: String, default: ""},
    open : {type: Boolean, default: true},
    status_text: {type: String, default : ""}
  })

  const projectSchema = new Schema({
    project: {type: String, required: true},
    issues: [issueSchema]
  })

  const Issue = mongoose.model("Issue", issueSchema)
  
  const Project = mongoose.model("Project", projectSchema, "IssueTrackerDB")
  const fields = ["assigned_to","created_by","created_on","issue_text","issue_title","open","status_text"] //,"updated_on","from","to"

  app.route('/api/issues/:project')
    .get(function (req, res){
      let project = req.params.project
      var request = {}
      var startDate = new Date(0)
      var endDate = new Date()
      let dateFilter = false

//Multiple conditions search : https://stackoverflow.com/questions/39389823/mongodb-query-with-multiple-conditions
//https://stackoverflow.com/questions/3985214/retrieve-only-the-queried-element-in-an-object-array-in-mongodb-collection

      //Project.find({project: project, "issues.created_by": "bob"},//finds the created by field but returns the whole array(issues) for the project.
      Project.find({project: project},
        // {created_on: {$gte: from, $lt: to}},
        (err, doc) => {
          if(err) return console.error(err)
          console.log(doc)
          var resArr = doc[0].issues

          fields.forEach((field, i) => {
            if(req.query[field] !== undefined)
              resArr = resArr.filter(issue => issue[field] === req.query[field])
          })

          if(req.query.from !== undefined){//From initiated at epoch 0.  If a date is specified, we set it here
            startDate = new Date(req.query.from);
            dateFilter = true
          }

          if(req.query.to !== undefined){//to initiated at epoch 0.  If a date is specified, we set it here
            endDate = new Date("2015-08-12");
            dateFilter= true
          }
  
          if(dateFilter){
            //Taken from https://stackoverflow.com/questions/31977724/how-to-filter-json-data-by-date-range-in-javascript
            var dateFilteredResArr = []
            dateFilteredResArr = resArr.filter((a) => {
              var hitDates = a.created_on || {};
              // extract all date strings
              hitDates = Object.keys(hitDates);
              // convert strings to Date objcts
              hitDates = hitDates.map(function(date) { return new Date(date); });
              // filter this dates by startDate and endDate
              var hitDateMatches = hitDates.filter(function(date) { return date >= startDate && date <= endDate });
              // if there is more than 0 results keep it. if 0 then filter it away
              return hitDateMatches.length>0;
          });
        }

          console.log(dateFilteredResArr);

          res.json(resArr)
        });
    })
    
    .post(function (req, res){
      let project = req.params.project;

      if(req.body.issue_title === undefined || req.body.issue_text === undefined || req.body.created_by === undefined)
      return res.json({error: 'required field(s) missing'})

      let newIssue = new Issue({
        issue_title : req.body.issue_title,
        issue_text : req.body.issue_text,
        created_by : req.body.created_by,
        created_on : new Date(),
        assigned_to : req.body.assigned_to,
        updated_on : new Date(),
        status_text: req.body.status_text
      })

      Project.findOne({project: project}, (err, doc) => {
        if(err) console.error(err)
        if(doc === null) {//Project doesn't exist.  Creating it.
          console.log("Creating new Project")

          let issuesArr= []
          // newIssue.created_on = new Date()
          issuesArr.push(newIssue)
          
          let newProject = new Project({
            project: project,
            issues : issuesArr
          })
            //Convert date string to date : .toISOString()
            newProject.save((err, doc) => {
            if(err) return console.error(err)
            res.json(newIssue)
          })
      } else {//Found the project.  Adding a new issue to the array
        Project.updateOne(
          { _id: doc._id },{
            "$push": {
              "issues":  newIssue 
            }
          },
          (err,doc) => {
          if(err) return console.log(err)
          res.json(newIssue)
        }
      )}    
    })
  })
    
    .put(function (req, res){
      let project = req.params.project;
      let id = req.body._id

      // var updTitle, updText, updCreator, updAssignee, updStatus, updOpen;
      var request = {}

      //Missing ID : return error message
      if(req.body._id !== undefined)
        id = req.body._id
      else
        return res.json({error: "missing _id"})

        fields.forEach((field) => {
          if(req.body[field] !== undefined)
            request["issues.$." + field ] = req.body[field]
        })

        if(request){//Changes have been requested, updating updated_on date 
          request["issues.$.updated_on"] = new Date()  
        }       

      // From : https://stackoverflow.com/questions/10778493/whats-the-difference-between-findandmodify-and-update-in-mongodb
      // Using UpdateOne over FindandModify method because If you fetch an item and then update it, 
      // there may be an update by another thread between those two steps. If you update an item 
      // first and then fetch it, there may be another update in-between and you will get back a 
      // different item than what you updated.  Doing it "atomically" means you are guaranteed 
      // that you are getting back the exact same item you are updating - i.e. no other operation 
      // can happen in between.

      Project.updateOne({project: project,"issues._id":id},{
      $set : request//request
    }, 
        (err, doc) => {
          if(err) return ({error:"could not update",_id:id})
          console.log(doc)
          return res.json({result: "successfully updated", _id: id})
        })
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      let id = req.body

      if(id === undefined)
      return res.json({error: "missing _id"})

      //Pull request documentation :      // https://www.tutorialspoint.com/mongodb-query-to-remove-subdocument-from-document
      Project.updateOne({project: project},
        {"$pull" : { "issues" : {_id:id} } }, 
        (err, doc) => {
          if(err) return ({error:"could not delete",_id:id})
          return res.json({result: "successfully deleted", _id: id})
        })
    });
    
};
